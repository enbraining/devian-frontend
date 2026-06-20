import Parser from "rss-parser";
import { BLOG_SOURCES, BlogSource } from "./blogs";
import { getSupabaseServer } from "./supabase-server";
import { Article } from "./supabase";
import { autoTag } from "./tagger";
import OpenAI from "openai";

type RssItem = {
  title?: string;
  link?: string;
  id?: string;
  pubDate?: string;
  updated?: string;
  contentSnippet?: string;
  categories?: string[];
  enclosure?: { url?: string };
  "content:encoded"?: string;
  "content"?: string;
  "media:content"?: { $?: { url?: string } } | { $?: { url?: string } }[];
};

const parser = new Parser<Record<string, unknown>, RssItem>({
  customFields: {
    item: ["media:content", "content:encoded", "content", "enclosure", "updated", "id"],
  },
  headers: {
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
  },
});

function extractUrl(item: RssItem): string {
  if (item.link) return item.link;
  if (item.id?.startsWith("http")) return item.id;
  return "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 300);
}

function resolveUrl(src: string, baseUrl: string): string {
  if (src.startsWith("http")) return src;
  if (src.startsWith("//")) return "https:" + src;
  if (src.startsWith("/")) {
    const base = new URL(baseUrl);
    return `${base.protocol}//${base.host}${src}`;
  }
  return src;
}

function extractThumbnail(item: RssItem, baseUrl: string): string | null {
  const media = item["media:content"];
  if (media) {
    const m = Array.isArray(media) ? media[0] : media;
    if (m?.$?.url) return resolveUrl(m.$.url, baseUrl);
  }
  if (item.enclosure?.url) return resolveUrl(item.enclosure.url, baseUrl);
  const content = item["content:encoded"] ?? item["content"];
  if (content) {
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1]) return resolveUrl(match[1], baseUrl);
  }
  return null;
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Devian/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();
    const match = html.match(/<meta[^>]+(?:property="og:image"|name="og:image")[^>]+content="([^"]+)"/i)
      ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+(?:property="og:image"|name="og:image")/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function extractSummary(item: RssItem): string | null {
  if (item.contentSnippet) return item.contentSnippet.slice(0, 300);
  const raw = item["content:encoded"] ?? item["content"];
  if (raw) return stripHtml(raw);
  return null;
}

function isEnglish(text: string): boolean {
  const korean = (text.match(/[가-힣]/g) ?? []).length;
  const ascii = (text.match(/[a-zA-Z]/g) ?? []).length;
  return ascii > korean * 2 && ascii > 10;
}

let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

async function translateToKorean(title: string, summary: string | null): Promise<{ title: string; summary: string | null }> {
  if (!process.env.OPENAI_API_KEY) return { title, summary };
  if (!isEnglish(title)) return { title, summary };
  try {
    const input = summary ? `제목: ${title}\n요약: ${summary}` : `제목: ${title}`;
    const res = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "기술 블로그 글의 제목과 요약을 자연스러운 한국어로 번역해줘. JSON으로만 응답해: {\"title\":\"...\",\"summary\":\"...\"}. summary가 없으면 null로.",
        },
        { role: "user", content: input },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });
    const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
    return {
      title: parsed.title ?? title,
      summary: parsed.summary ?? summary,
    };
  } catch {
    return { title, summary };
  }
}

async function fetchRssBlog(source: BlogSource): Promise<Omit<Article, "id" | "created_at">[]> {
  const baseUrl = source.rssUrl!;
  try {
    const feed = await parser.parseURL(baseUrl);
    const items = (feed.items ?? []).slice(0, 20);
    return await Promise.all(
      items.map(async (item) => {
        const url = extractUrl(item);
        let thumbnail = extractThumbnail(item, baseUrl);
        if (!thumbnail && url) thumbnail = await fetchOgImage(url);

        const rawSummary = extractSummary(item);
        const { title, summary } = await translateToKorean(item.title ?? "제목 없음", rawSummary);

        return {
          blog_id: source.id,
          title,
          url,
          published_at: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : item.updated
            ? new Date(item.updated).toISOString()
            : new Date().toISOString(),
          summary,
          thumbnail,
          tags: await autoTag(title, summary),
        };
      })
    );
  } catch (e) {
    console.error(`[${source.id}] RSS fetch error:`, e);
    return [];
  }
}

export async function fetchAndSaveAll() {
  const supabase = getSupabaseServer();
  const results: { blogId: string; count: number; error?: string }[] = [];

  for (const source of BLOG_SOURCES) {
    try {
      const articles = await fetchRssBlog(source);
      if (articles.length === 0) {
        results.push({ blogId: source.id, count: 0 });
        continue;
      }

      const { error } = await supabase.from("articles").upsert(
        articles,
        { onConflict: "url", ignoreDuplicates: false }
      );

      if (error) {
        results.push({ blogId: source.id, count: 0, error: error.message });
      } else {
        results.push({ blogId: source.id, count: articles.length });
      }
    } catch (e) {
      results.push({ blogId: source.id, count: 0, error: String(e) });
    }
  }

  return results;
}
