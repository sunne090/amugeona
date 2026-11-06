import type { Project } from "@/types/project";
export const projects: Project[] = [{
  id: "day-001",
  day: 1,
  slug: "day-001",
  title: "퇴사 버튼 시뮬레이터",
  description: "퇴사 버튼을 누를 때마다 연봉 인상, 상사의 만류, 대출금 알림이 등장. 오늘은 진짜 나갈 수 있을까?",
  creator: "언니",
  status: "draft",
  thumbnail: "/thumbnails/day-001.svg",
  publishedAt: null,
}, { id: "day-000", day: 0, slug: "day-000", title: "도망가는 버튼", description: "잡을 수 있을 것 같지만, 절대 쉽지는 않은 버튼.", creator: "공동", status: "draft", thumbnail: "/thumbnails/day-000.svg", publishedAt: null }];
