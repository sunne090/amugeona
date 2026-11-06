import type { Metadata } from "next";
import { ResignationSimulator } from "@/features/day-001/resignation-simulator";

export const metadata: Metadata = {
  title: "DAY 01 — 퇴사 버튼 시뮬레이터",
  description: "도망가는 버튼, 움직이는 도장, 36개 선택지, 숨겨진 퇴사 메뉴. 8단계 방해 공작을 뚫는 극악의 퇴사 시뮬레이터.",
};

export default function Day001Page() {
  return <ResignationSimulator />;
}
