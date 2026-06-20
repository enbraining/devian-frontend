import OpenAI from "openai";

// ── 카테고리 태그 (임베딩 기반) ──────────────────────────────────────────────
const CATEGORY_TAGS: Record<string, string> = {
  "AI/ML":
    "인공지능 머신러닝 딥러닝 LLM GPT 자연어처리 NLP 컴퓨터 비전 모델 학습 추론 임베딩 RAG 트랜스포머 파인튜닝 생성형 AI",
  백엔드:
    "서버 API Spring Java Kotlin Python Node.js 마이크로서비스 REST gRPC GraphQL 백엔드 서비스 아키텍처",
  프론트엔드:
    "React Vue Angular Next.js TypeScript JavaScript CSS UI UX 웹 프론트엔드 렌더링 컴포넌트 디자인시스템",
  인프라:
    "Kubernetes k8s Docker 컨테이너 AWS GCP Azure 클라우드 DevOps CI/CD GitHub Actions Terraform Ansible Helm 인프라 서버리스 배포 운영 SRE 플랫폼엔지니어링",
  데이터:
    "데이터 Spark Kafka 데이터파이프라인 ETL 데이터웨어하우스 Airflow 배치처리 스트리밍 분석 데이터엔지니어링",
  모바일:
    "iOS Android Swift Flutter React Native 앱 모바일 Kotlin Multiplatform 크로스플랫폼",
  보안: "보안 인증 OAuth JWT 암호화 취약점 Zero Trust SSL TLS 접근제어 사이버보안",
  성능: "성능 최적화 레이턴시 처리량 캐시 부하테스트 트래픽 병목 튜닝 응답시간",
  데이터베이스:
    "MySQL PostgreSQL Redis MongoDB Elasticsearch 데이터베이스 SQL NoSQL 쿼리 인덱스 트랜잭션",
  오픈소스: "오픈소스 GitHub 기여 라이브러리 프레임워크 컨트리뷰션 커뮤니티",
};

// ── 기술 태그 (키워드 매칭) ────────────────────────────────────────────────
// [매칭할 패턴들, 표시할 태그명] 순서
const TECH_TAG_RULES: [RegExp, string][] = [
  // 인프라/클라우드
  [/\bkubernetes\b|쿠버네티스|\bk8s\b/i, "Kubernetes"],
  [/\bdocker\b|도커/i, "Docker"],
  [/\baws\b/i, "AWS"],
  [/\bgcp\b|google cloud/i, "GCP"],
  [/\bazure\b/i, "Azure"],
  [/\bterraform\b/i, "Terraform"],
  [/\bhelm\b/i, "Helm"],
  [/\bargoc[d]?\b|argo cd/i, "ArgoCD"],
  [/\bistio\b/i, "Istio"],
  [/\bnginx\b/i, "Nginx"],
  [/\bprometheus\b/i, "Prometheus"],
  [/\bgrafana\b/i, "Grafana"],
  [/\bgithub actions\b|github action/i, "GitHub Actions"],
  // 백엔드
  [/\bspring\b|스프링/i, "Spring"],
  [/\bjava\b(?!script)/i, "Java"],
  [/\bkotlin\b|코틀린/i, "Kotlin"],
  [/\bpython\b|파이썬/i, "Python"],
  [/\bgo(?:lang)?\b/i, "Go"],
  [/\brust\b/i, "Rust"],
  [/\bnode\.?js\b/i, "Node.js"],
  [/\bfastapi\b/i, "FastAPI"],
  [/\bdjango\b/i, "Django"],
  [/\bgrpc\b/i, "gRPC"],
  [/\bgraphql\b/i, "GraphQL"],
  // 프론트엔드
  [/\breact\b(?! native)/i, "React"],
  [/\bvue\.?js?\b/i, "Vue"],
  [/\bnext\.?js\b/i, "Next.js"],
  [/\bsvelte\b/i, "Svelte"],
  [/\btypescript\b/i, "TypeScript"],
  [/\bwebassembly\b|\bwasm\b/i, "WebAssembly"],
  // 데이터
  [/\bkafka\b/i, "Kafka"],
  [/\bspark\b/i, "Spark"],
  [/\bflink\b/i, "Flink"],
  [/\bairflow\b/i, "Airflow"],
  [/\bdbt\b/i, "dbt"],
  [/\bbigquery\b/i, "BigQuery"],
  [/\bhadoop\b/i, "Hadoop"],
  // 데이터베이스
  [/\bmysql\b/i, "MySQL"],
  [/\bpostgresql\b|\bpostgres\b/i, "PostgreSQL"],
  [/\bredis\b/i, "Redis"],
  [/\bmongodb\b/i, "MongoDB"],
  [/\belasticsearch\b|\bopensearch\b/i, "Elasticsearch"],
  [/\bclickhouse\b/i, "ClickHouse"],
  [/\bcassandra\b/i, "Cassandra"],
  [/\bdynamodb\b/i, "DynamoDB"],
  // AI/ML
  [/\bpytorch\b/i, "PyTorch"],
  [/\btensorflow\b/i, "TensorFlow"],
  [/\blangchain\b/i, "LangChain"],
  [/\bllm\b|large language model/i, "LLM"],
  [/\brag\b(?!\w)/i, "RAG"],
  // 모바일
  [/\bflutter\b/i, "Flutter"],
  [/\bswift(?:ui)?\b/i, "Swift"],
  [/\breact native\b/i, "React Native"],
  [/\bcompose\b.*android|android.*\bcompose\b/i, "Jetpack Compose"],
];

const CATEGORY_NAMES = Object.keys(CATEGORY_TAGS);

let client: OpenAI | null = null;
let tagEmbeddingsCache: number[][] | null = null;

function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function getCategoryEmbeddings(): Promise<number[][]> {
  if (tagEmbeddingsCache) return tagEmbeddingsCache;
  const res = await getClient().embeddings.create({
    model: "text-embedding-3-small",
    input: Object.values(CATEGORY_TAGS),
  });
  tagEmbeddingsCache = res.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
  return tagEmbeddingsCache;
}

function extractTechTags(text: string): string[] {
  const found: string[] = [];
  for (const [pattern, tag] of TECH_TAG_RULES) {
    if (pattern.test(text) && !found.includes(tag)) found.push(tag);
  }
  return found;
}

export async function autoTag(title: string, summary: string | null): Promise<string[]> {
  const text = `${title} ${summary ?? ""}`;

  // 기술 태그는 API 키 없어도 동작
  const techTags = extractTechTags(text);

  if (!process.env.OPENAI_API_KEY) return techTags;

  try {
    const [categoryEmbeddings, articleRes] = await Promise.all([
      getCategoryEmbeddings(),
      getClient().embeddings.create({
        model: "text-embedding-3-small",
        input: [text.slice(0, 500)],
      }),
    ]);

    const articleVec = articleRes.data[0].embedding;
    const categoryTags = categoryEmbeddings
      .map((te, i) => ({ tag: CATEGORY_NAMES[i], score: cosine(articleVec, te) }))
      .sort((a, b) => b.score - a.score)
      .filter((s) => s.score >= 0.2)
      .slice(0, 2)
      .map((s) => s.tag);

    // 카테고리 먼저, 기술 태그 뒤에
    return [...new Set([...categoryTags, ...techTags])];
  } catch (e) {
    console.error("[tagger] embedding error:", e);
    return techTags;
  }
}
