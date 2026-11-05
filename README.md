# amugeona

매일 AI 바이브 코딩으로 만든 작고 이상한 웹 장난감을 직접 체험하는 갤러리입니다. 현업 개발자 언니와 개발 취업 준비생 동생이 함께 만듭니다.

## 시작하기

Node.js LTS와 npm이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 품질 확인은 `npm run lint`, `npx tsc --noEmit`, `npm run build` 순서로 실행합니다.

## 협업 방식

- 작업마다 `feat/` 또는 `fix/` 브랜치를 만들고 PR로 `main`에 제안합니다.
- 기존 DAY 작품은 작성자 동의 없이 수정하지 않습니다.
- `.env*` 파일, 토큰, 배포 키는 커밋하지 않습니다.

## 새 작품 추가하기

1. `src/features/day-XXX/`에 작품 전용 컴포넌트·스타일을 만듭니다.
2. `src/app/days/day-XXX/page.tsx`에서 해당 작품을 렌더링합니다.
3. `src/data/projects.ts`에 `id`, `day`, `slug`, `title`, `description`, `creator`, `status`, `thumbnail`, `publishedAt`을 추가합니다.
4. 준비 중에는 `status: "draft"`로 두고, 공개할 때만 `published`로 변경합니다.

`published`는 갤러리 링크 노출을 제어합니다. URL을 아는 사용자의 직접 접근을 막는 권한 제어가 아니므로, 비공개 콘텐츠를 이 프로젝트에 올리지 마세요.

## Vercel 배포

이 저장소는 기존 Vercel 프로젝트와 연결되어 있습니다. `main`에 병합된 변경사항은 해당 연결의 기존 배포 흐름을 따릅니다. 이 저장소에서는 Vercel 설정을 관리하거나 변경하지 않습니다.
