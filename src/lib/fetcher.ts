import Parser from "rss-parser";
import { BLOG_SOURCES, BlogSource } from "./blogs";
import { getSupabaseServer } from "./supabase-server";
import { Article } from "./supabase";
import { autoTag } from "./tagger";

type RssItem = {
  title?: string;
  link?: string;
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
    item: ["media:content", "content:encoded", "content", "enclosure", "updated"],
  },
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 300);
}

function extractThumbnail(item: RssItem): string | null {
  const media = item["media:content"];
  if (media) {
    const m = Array.isArray(media) ? media[0] : media;
    if (m?.$?.url) return m.$.url;
  }
  if (item.enclosure?.url) return item.enclosure.url;
  const content = item["content:encoded"] ?? item["content"];
  if (content) {
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractSummary(item: RssItem): string | null {
  if (item.contentSnippet) return item.contentSnippet.slice(0, 300);
  const raw = item["content:encoded"] ?? item["content"];
  if (raw) return stripHtml(raw);
  return null;
}

async function fetchRssBlog(source: BlogSource): Promise<Omit<Article, "id" | "created_at">[]> {
  try {
    const feed = await parser.parseURL(source.rssUrl!);
    const items = (feed.items ?? []).slice(0, 20);
    return await Promise.all(
      items.map(async (item) => {
        const summary = extractSummary(item);
        return {
          blog_id: source.id,
          title: item.title ?? "제목 없음",
          url: item.link ?? "",
          published_at: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : item.updated
            ? new Date(item.updated).toISOString()
            : new Date().toISOString(),
          summary,
          thumbnail: extractThumbnail(item),
          tags: await autoTag(item.title ?? "", summary),
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
