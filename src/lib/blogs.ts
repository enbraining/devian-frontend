export interface BlogSource {
  id: string;
  name: string;
  logoUrl: string;
  color: string;
  rssUrl?: string;
  type: "rss" | "scrape";
}

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export const BLOG_SOURCES: BlogSource[] = [
  {
    id: "toss",
    name: "토스",
    logoUrl: favicon("toss.tech"),
    color: "#0064FF",
    rssUrl: "https://toss.tech/rss.xml",
    type: "rss",
  },
  {
    id: "naver",
    name: "네이버 D2",
    logoUrl: "https://d2.naver.com/favicon.ico",
    color: "#03C75A",
    rssUrl: "https://d2.naver.com/d2.atom",
    type: "rss",
  },
  {
    id: "line",
    name: "라인",
    logoUrl: favicon("linecorp.com"),
    color: "#00B900",
    rssUrl: "https://engineering.linecorp.com/ko/feed",
    type: "rss",
  },
  {
    id: "woowahan",
    name: "우아한형제들",
    logoUrl: favicon("woowahan.com"),
    color: "#2AC1BC",
    rssUrl: "https://techblog.woowahan.com/feed",
    type: "rss",
  },
  {
    id: "daangn",
    name: "당근",
    logoUrl: favicon("daangn.com"),
    color: "#FF7E36",
    rssUrl: "https://medium.com/feed/daangn",
    type: "rss",
  },
  {
    id: "coupang",
    name: "쿠팡",
    logoUrl: favicon("coupang.com"),
    color: "#C2001A",
    rssUrl: "https://medium.com/feed/coupang-engineering",
    type: "rss",
  },
  {
    id: "kurly",
    name: "컬리",
    logoUrl: favicon("kurly.com"),
    color: "#5F0080",
    rssUrl: "https://helloworld.kurly.com/rss.xml",
    type: "rss",
  },
  {
    id: "kakaoenterprise",
    name: "카카오엔터프라이즈",
    logoUrl: favicon("kakaoenterprise.com"),
    color: "#FEE500",
    rssUrl: "https://kakaoenterprise.github.io/feed.xml",
    type: "rss",
  },
  {
    id: "hyperconnect",
    name: "하이퍼커넥트",
    logoUrl: favicon("hyperconnect.com"),
    color: "#FF4040",
    rssUrl: "https://hyperconnect.github.io/feed.xml",
    type: "rss",
  },
  {
    id: "buzzvil",
    name: "버즈빌",
    logoUrl: favicon("buzzvil.com"),
    color: "#FF6B00",
    rssUrl: "https://tech.buzzvil.com/feed.xml",
    type: "rss",
  },
  {
    id: "devsisters",
    name: "데브시스터즈",
    logoUrl: favicon("devsisters.com"),
    color: "#FF5A00",
    rssUrl: "https://tech.devsisters.com/rss.xml",
    type: "rss",
  },
  {
    id: "watcha",
    name: "왓챠",
    logoUrl: favicon("watcha.com"),
    color: "#FF0558",
    rssUrl: "https://medium.com/feed/watcha",
    type: "rss",
  },
  {
    id: "musinsa",
    name: "무신사",
    logoUrl: favicon("musinsa.com"),
    color: "#1A1A1A",
    rssUrl: "https://medium.com/feed/musinsa-tech",
    type: "rss",
  },
  {
    id: "29cm",
    name: "29CM",
    logoUrl: favicon("29cm.co.kr"),
    color: "#1A1A1A",
    rssUrl: "https://medium.com/feed/29cm",
    type: "rss",
  },
  {
    id: "netflix",
    name: "넷플릭스",
    logoUrl: favicon("netflix.com"),
    color: "#E50914",
    rssUrl: "https://medium.com/feed/netflix-techblog",
    type: "rss",
  },
];
