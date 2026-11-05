export type Creator = "언니" | "동생" | "공동";
export type ProjectStatus = "draft" | "published";
export type Project = { id: string; day: number; slug: string; title: string; description: string; creator: Creator; status: ProjectStatus; thumbnail: string; publishedAt: string | null };
