import type { Metadata } from "next";
import Link from "next/link";
import { AngryCalculator } from "@/features/day-002/angry-calculator";

export const metadata: Metadata = { title: "DAY 002 — 킹받는 계산기", description: "계산은 정확하지만 태도가 킹받는 계산기입니다." };

export default function Day002Page() {
  return <main className="min-h-screen bg-[#fff7ee] px-4 py-5 text-[#17211d] sm:px-8 sm:py-8"><div className="mx-auto max-w-3xl"><Link href="/" className="inline-flex rounded-full border border-[#17211d] bg-white px-3 py-2 text-sm font-bold transition hover:bg-[#d9f75b]">← 갤러리로</Link><AngryCalculator /></div></main>;
}
