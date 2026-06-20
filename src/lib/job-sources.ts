export interface JobSource {
  id: string;
  name: string;
  logoUrl: string;
  color: string;
  type: "greenhouse";
  slug: string;
  // department 필터 (포함하는 키워드) - 없으면 전체
  departmentFilter?: string[];
}

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export const JOB_SOURCES: JobSource[] = [
  {
    id: "daangn",
    name: "당근",
    logoUrl: favicon("daangn.com"),
    color: "#FF7E36",
    type: "greenhouse",
    slug: "daangn",
  },
  {
    id: "coupang",
    name: "쿠팡",
    logoUrl: favicon("coupang.com"),
    color: "#C2001A",
    type: "greenhouse",
    slug: "coupang",
    departmentFilter: ["Engineer", "Software", "Data", "Backend", "Frontend", "Mobile", "Infrastructure", "Security", "Machine Learning", "AI", "Platform", "DevOps", "SRE", "Architecture", "개발", "엔지니어", "데이터"],
  },
  {
    id: "krafton",
    name: "크래프톤",
    logoUrl: favicon("krafton.com"),
    color: "#1A1A1A",
    type: "greenhouse",
    slug: "krafton",
    departmentFilter: ["Engineer", "Software", "Data", "Backend", "Frontend", "Server", "Client", "AI", "Platform", "개발", "엔지니어", "프로그래머"],
  },
];
