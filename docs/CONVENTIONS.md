# 개발 규칙

- 라우트는 `src/app`, 공용 UI는 `src/components`, 작품별 UI·로직은 `src/features/day-XXX`에 둡니다.
- 파일과 폴더는 소문자 kebab-case, React 컴포넌트는 PascalCase를 사용합니다.
- 프로젝트 정보의 단일 원본은 `src/data/projects.ts`입니다.
- TypeScript를 우선하며 `any`를 추가하지 않습니다. 기본은 서버 컴포넌트이고 상호작용 최소 범위만 `"use client"`를 사용합니다.
- Tailwind 유틸리티를 우선하고, 작품 전용 복잡한 스타일은 해당 feature의 CSS Module에 둡니다.
- 모바일 우선, 키보드 포커스, 의미 있는 버튼·링크, 충분한 대비를 확인합니다.
- 외부 라이브러리는 표준 API로 해결할 수 없을 때만 사전 합의 후 추가합니다.
- 다른 DAY를 수정하지 않고 새 DAY를 추가합니다. 공개된 작품 변경은 별도 PR로 작성자와 합의합니다.
- `main`에 직접 푸시하지 않습니다. PR에는 변경 범위와 `npm run lint`, `npx tsc --noEmit`, `npm run build` 결과를 남깁니다.
- 비밀 값은 `.env.local`에만 두고, `NEXT_PUBLIC_` 접두사는 공개 가능한 값에만 사용합니다.
