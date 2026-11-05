import type { Metadata } from "next";
import Link from "next/link";
import { EscapeButtonGame } from "@/features/day-000/escape-button-game";
export const metadata: Metadata = { title: "DAY 000 — 도망가는 버튼", description: "공동 개발 환경 확인용 테스트 작품입니다." };
export default function Day000Page() { return <main className="min-h-screen bg-[#fff7ee] px-4 py-5 text-[#17211d] sm:px-8 sm:py-8"><div className="mx-auto max-w-3xl"><Link href="/" className="inline-flex rounded-full border border-[#17211d] bg-white px-3 py-2 text-sm font-bold transition hover:bg-[#d9f75b]">← 갤러리로</Link><EscapeButtonGame /></div></main>; }
