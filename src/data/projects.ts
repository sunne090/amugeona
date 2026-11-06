import type { Project } from "@/types/project";
export const projects: Project[] = [
  { id: "day-001", day: 1, slug: "day-001", title: "킹받는 계산기", description: "계산은 정확하지만, 결과를 보려면 의지를 증명해야 해요.", creator: "공동", status: "published", thumbnail: "/thumbnails/day-001.svg", publishedAt: "2026-11-06" },
  { id: "day-000", day: 0, slug: "day-000", title: "도망가는 버튼", description: "잡을 수 있을 것 같지만, 절대 쉽지는 않은 버튼.", creator: "공동", status: "draft", thumbnail: "/thumbnails/day-000.svg", publishedAt: null },
];
