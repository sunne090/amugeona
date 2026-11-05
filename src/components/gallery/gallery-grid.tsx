import type { Project } from "@/types/project";
import { ProjectCard } from "./project-card";
export function GalleryGrid({ projects }: { projects: Project[] }) { return <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>; }
