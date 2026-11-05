<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AMUGEONA 작업 규칙

AMUGEONA는 AI 바이브 코딩으로 매일 만든 작은 웹 장난감을 공개하는 Next.js 16, React 19, TypeScript, Tailwind CSS 4 프로젝트다. npm과 기존 Vercel·GitHub 연결을 유지한다.

- 라우트: `src/app`, 공용 UI: `src/components`, DAY별 독립 구현: `src/features/day-XXX`, 프로젝트 데이터: `src/data/projects.ts`.
- 파일·폴더는 kebab-case, 컴포넌트는 PascalCase, 타입은 `src/types`에 둔다. 브랜드 설정은 `src/config/site.ts`에서 변경한다.
- 새 DAY는 feature, route page, projects 데이터 순서로 추가한다. `draft`는 갤러리 노출 제어일 뿐 실제 접근 제어가 아니다.
- TypeScript 타입 안전성을 지키고 `any`를 피한다. 서버 컴포넌트를 기본으로 하며 클라이언트 컴포넌트는 상호작용 범위로 제한한다.
- 모바일 우선, 키보드·포커스·터치 접근성을 고려한다. 공용 UI는 Tailwind, 작품 전용 복잡한 스타일은 CSS Module을 사용한다.
- 외부 라이브러리는 최소화하고 기존 DAY를 임의로 수정하지 않는다.
- 작업은 `feat/`, `fix/`, `docs/` 브랜치에서 수행하고 PR로 검토한다. main에 직접 푸시·병합하지 않는다.
- 변경 후 `npm run lint`, `npx tsc --noEmit`, `npm run build`를 실행한다.
- 토큰·키·개인정보는 커밋하지 않는다. 환경변수는 `.env.local`에 두며 공개 가능한 값에만 `NEXT_PUBLIC_`을 사용한다.
