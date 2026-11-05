import { siteConfig } from "@/config/site";
export function SiteFooter() { return <footer className="border-t border-[var(--ink)] px-5 py-7 text-center font-mono text-xs text-[var(--muted)] sm:px-8">© {siteConfig.name}. Made one tiny thing at a time.</footer>; }
