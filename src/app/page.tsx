import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/config/site";
import { projects } from "@/data/projects";

export default function Home() {
  const latestProjects = [...projects].sort((a, b) => b.day - a.day);

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--canvas)] text-[var(--ink)]">
      <SiteHeader />
      <main>
        <section className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute right-[-2.5rem] top-10 h-32 w-32 rounded-full border-[14px] border-[var(--lime)] opacity-55 sm:right-[-1rem] sm:top-14 sm:h-48 sm:w-48 sm:border-[16px] lg:right-[-2rem] lg:top-1/2 lg:h-60 lg:w-60 lg:-translate-y-1/2 lg:border-[18px] lg:opacity-75" />
          <div className="relative z-10 max-w-2xl lg:max-w-4xl">
            <p className="mb-4 inline-flex rounded-full border border-[var(--ink)] bg-[var(--paper)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.13em] sm:mb-5 sm:text-xs">tiny internet experiments · every day</p>
            <h1 className="text-title max-w-[22rem] text-[clamp(2.4rem,9vw,3.5rem)] font-black leading-[0.96] tracking-[-0.06em] sm:max-w-none sm:text-[clamp(3.5rem,5vw,5rem)]"><span className="sm:block">매일 한 조각의</span>{" "}<span className="sm:block">쓸데없는 재미.</span></h1>
            <p className="text-copy mt-6 max-w-2xl text-[0.98rem] leading-7 text-[var(--muted)] sm:mt-7 sm:text-lg sm:leading-8">{siteConfig.description}</p>
          </div>
        </section>

        <section id="projects" className="border-y border-[var(--ink)] bg-[var(--paper)]">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
            <div className="mb-8 grid gap-4 sm:mb-10 sm:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] sm:items-end sm:gap-8">
              <div><p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-[var(--coral)]">The shelf</p><h2 className="text-title mt-2 text-3xl font-black leading-tight tracking-[-0.045em] sm:text-4xl">오늘의 쓸데있는 장난감</h2></div>
              <p className="text-copy max-w-md text-sm leading-6 text-[var(--muted)] sm:justify-self-end">최신 DAY부터 차례로. 열려 있는 카드만 바로 체험할 수 있어요.</p>
            </div>
            <GalleryGrid projects={latestProjects} />
          </div>
        </section>

        <section id="about" className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div><p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-[var(--coral)]">About the lab</p><h2 className="text-title mt-3 text-3xl font-black tracking-[-0.045em] sm:text-4xl">매일 하나씩, 웃기는 걸 진지하게 만들어요.</h2></div>
          <div className="rounded-3xl bg-[var(--ink)] p-7 text-[var(--paper)] shadow-[7px_7px_0_var(--coral)]"><p className="font-bold"><span className="block text-lg">언니 × 동생</span><span className="mt-1 block whitespace-nowrap font-mono text-xs tracking-[-0.04em] text-white/75 sm:text-sm">two developers making tiny things</span></p><p className="mt-3 leading-7 text-white/75">현업 개발자 언니와 개발 취업 준비생 동생이 AI 바이브 코딩으로 만든 작은 웹 실험실입니다. 릴스와 쇼츠에서 본 장난감을 여기서 직접 눌러 보세요.</p></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
