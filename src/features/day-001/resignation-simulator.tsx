"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ResignationChallenge } from "./resignation-challenge";
import styles from "./resignation-simulator.module.css";

const FAILURE_LIMIT = 10;

const obstacles = [
  { icon: "💸", sender: "인사팀 · 긴급 제안", title: "연봉 올려드릴게요. 진짜로.", body: "무려 3% 인상! 물가는 5% 올랐지만 마음만은 업계 최고입니다.", note: "※ 내년부터 검토 예정. 확정 아님. 아무튼 아님.", action: "검토는 제가 할게요. 퇴사합니다", log: "연봉 +3% 제안 거절 (구두 약속)", label: "연봉 협상" },
  { icon: "🥹", sender: "팀장님 · 읽음 1", title: "우리 가족 같은 사이잖아.", body: "네가 나가면 이 일 누가 해? 물론 충원 계획은 없어. 가족은 뽑는 게 아니니까.", note: "팀장님이 입력 중입니다… 3년째…", action: "저희 가족은 집에 있어요", log: "가족관계 정리 완료", label: "감정 호소" },
  { icon: "🏦", sender: "아무은행 · 친절한 알림", title: "고객님, 대출은 출근합니다.", body: "고객님이 쉬시는 동안에도 이자는 성실하게 근무해요. 이번 달 결제 예정액 1,247,890원.", note: "잔액: 32,180원 · 숫자는 모두 가상인데 왜 아프죠?", action: "제 마음 잔고가 더 부족해요", log: "대출 알림을 흐린 눈으로 통과", label: "현실 확인" },
  { icon: "🍕", sender: "복지위원회 · 전사 공지", title: "오늘 저녁 피자 시킨대요.", body: "퇴사하면 이거 못 먹는데? 라지 두 판이야. 인원은 열여덟 명이지만.", note: "참석 조건: 야근 · 1인당 올리브 2개 보장", action: "제 몫 올리브는 팀장님 드세요", log: "올리브 2개 포기", label: "복지 공세" },
  { icon: "📋", sender: "인사팀 · 업무 협조", title: "인수인계만 하고 가세요.", body: "간단해요. 업무 매뉴얼, 거래처 목록, 그리고 본인과 똑같이 일하는 사람 한 명만 만들어주시면 됩니다.", note: "첨부파일: 인수인계_최종_진짜최종_v92.xlsx", action: "제 복제는 유료 서비스입니다", log: "분신술 요청 반려", label: "인수인계" },
  { icon: "👑", sender: "대표님 · 특별 면담", title: "자네, 리더가 될 상인데.", body: "직함을 드릴게. 책임도 드릴게. 일도 드릴게. 급여는… 우리 돈 얘기는 좀 나중에 하자.", note: "승진 패키지: 책임 +200% / 권한 +0%", action: "저는 자유인이 될 상입니다", log: "명예직 부장 승진 거절", label: "긴급 승진" },
  { icon: "🖨️", sender: "전자결재 · 시스템 알림", title: "퇴사 신청은 종이로만 됩니다.", body: "디지털 혁신 선도 기업입니다. 출력 후 도장을 받아 팩스로 보내주세요. 프린터는 고장입니다.", note: "오류 코드: STAY_WITH_US_404", action: "마음속으로 출력했습니다", log: "마음의 프린터로 사직서 출력", label: "행정의 벽" },
  { icon: "🚪", sender: "인사팀 · 마지막 확인", title: "정말, 정말, 진짜 나가세요?", body: "이 버튼을 누르면 회사가 당신 없이도 돌아간다는 사실을 알게 됩니다. 조금 서운할 수 있습니다.", note: "퇴사 사유: 더 이상 회사의 귀여운 ATM이고 싶지 않음", action: "네. 이제 제 인생에 출근할게요", log: "최종 결재 완료. 자유를 획득했습니다", label: "최종 결재" },
] as const;

export function ResignationSimulator() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(-1);
  const [chosenEnding, setEnding] = useState<"free" | "stay" | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const forcedStay = mistakes >= FAILURE_LIMIT;
  const ending = forcedStay ? "stay" : chosenEnding;
  const remaining = Math.max(0, FAILURE_LIMIT - mistakes);
  const [copied, setCopied] = useState("");
  const current = step >= 0 ? obstacles[step] : null;
  const attempts = step + 1;
  const progress = ending === "free" ? 100 : Math.round((Math.max(step, 0) / obstacles.length) * 100);
  const logs = obstacles.slice(0, ending === "free" ? obstacles.length : Math.max(step, 0));

  useEffect(() => {
    if (step < 0 && !ending) return;
    if (window.matchMedia("(max-width: 680px)").matches) {
      sceneRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [step, ending]);

  function advance() {
    if (ending) return;
    if (step === obstacles.length - 1) setEnding("free");
    else setStep(step + 1);
  }

  function reset() {
    setMistakes(0);
    setStep(-1);
    setEnding(null);
    setCopied("");
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(`퇴사 버튼 시뮬레이터 | ${ending === "free" ? ` ${mistakes}번 반려당하고 퇴사 성공!` : forcedStay ? `${FAILURE_LIMIT}회 반려로 강제 잔류. 회사의 붙박이장이 되었습니다…` : "퇴사 대신 내일도 출근합니다…"}\n${window.location.origin}/days/day-001`);
      setCopied("결과와 링크를 복사했어요!");
    } catch {
      setCopied("복사가 어려워요. 주소창의 링크를 복사해 주세요.");
    }
  }

  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="작품 탐색"><Link href="/">← AMUGEONA</Link><span>DAILY TOY / 001</span><span className={styles.online}><i /> {ending === "free" ? "탈출 성공" : "정상 근무 중"}</span></nav>
      <div className={styles.layout}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>DAY 01 <span>INTERACTIVE OFFICE DRAMA</span></p>
          <h1>퇴사 버튼<br /><span>시뮬레이터<span className={styles.dot}>.</span></span></h1>
          <p className={styles.intro}>나가는 문은 하나인데,<br />붙잡는 사람은 왜 이렇게 많아.</p>
          <div className={styles.employee}><span className={styles.avatar}>🪪</span><div><strong>익명의 직장인 님</strong><small>소속: 일단다녀 주식회사 / 직급: 버티는 중</small></div><span className={styles.tag}>재직 {ending === "free" ? "종료" : "중"}</span></div>
        </header>
        <section className={styles.window} aria-label="퇴사 전자결재">
          <div className={styles.toolbar}><span><i /><i /><i /></span><span>일단다녀 전자결재 시스템</span><span>↗</span></div>
          <div className={styles.windowBody}>
            <div className={styles.documentHeader}><span>인사관리 / 퇴직 신청</span><span className={styles.documentId}>DOC—0001</span></div>
            <div className={styles.status}><span>{ending === "free" ? "탈출 완료" : ending === "stay" ? (forcedStay ? "강제 잔류 확정" : "신청 철회") : "퇴사 결재 진행률"}</span><strong>{progress}%</strong></div>
            <div className={styles.progress} role="progressbar" aria-label="퇴사 결재 진행률" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${progress}%` }} /></div>
            <div ref={sceneRef} className={styles.scene} key={`${step}-${ending}`} aria-live="polite" aria-atomic="true">
              <span className={styles.sceneIcon} aria-hidden="true">{ending === "free" ? "🕊️" : ending === "stay" ? "🫠" : current?.icon ?? "🚪"}</span>
              <p className={styles.sender}>{ending ? "전자결재 · 처리 결과" : current?.sender ?? "사직서 제출 전 확인해 주세요"}</p>
              <h2>{ending === "free" ? "퇴사 처리가 완료되었습니다." : ending === "stay" ? (forcedStay ? "축하합니다. 회사의 붙박이장이 되셨습니다." : "내일도 잘 부탁드립니다 ^^") : current?.title ?? "오늘은 진짜로 나간다."}</h2>
              <p className={styles.body}>{ending === "free" ? `8단계 방해 공작, ${mistakes}번의 반려를 뚫었습니다. 당신의 집념에 인사팀이 먼저 퇴사했습니다.` : ending === "stay" ? (forcedStay ? `누적 ${FAILURE_LIMIT}회 반려로 퇴사 신청권이 소진되었습니다. 사직서는 파쇄했고, 내일 오전 9시 회의는 잡아뒀어요. 오래오래 함께해요 ♡` : "사직서는 안전하게 파쇄했어요. 방금 업무가 추가 배정되었습니다. 역시 믿고 있었다고요!") : current?.body ?? "버튼은 도망가고, 도장은 삐뚤어지고, 퇴사 메뉴는 숨었습니다. 8단계 인사팀 방해 공작을 직접 뚫으세요."}</p>
              <p className={styles.note}>{ending === "free" ? "획득 칭호: 대출보다 강한 의지 / 소속: 내 인생" : ending === "stay" ? "획득 칭호: 명예 사내 가구 / 퇴사 의지: 내일 다시 충전" : current?.note ?? "전 관문 누적 10회 실패하면 강제 잔류 · 재도전하면 초기화"}</p>
            </div>
            {!ending && <div className={`${styles.failureBudget} ${remaining <= 3 ? styles.failureDanger : ""}`} role="status">
              <strong>반려 {mistakes}/{FAILURE_LIMIT}회 · 남은 기회 {remaining}회</strong>
              <span>{remaining <= 3 ? `경고: ${remaining}번 더 실패하면 강제 잔류입니다. 인사팀이 웃고 있습니다.` : "관문이 바뀌어도 반려 횟수는 누적됩니다. 10회면 퇴사 신청 종료."}</span>
            </div>}
            {ending ? <div className={styles.actions}><button className={styles.primary} onClick={reset}>{ending === "stay" ? "다시 퇴사 도전하기 ↺" : "다시 입사하기 ↺"}</button><button className={styles.secondary} onClick={share}>결과 자랑하기 ↗</button><p className={styles.copyStatus} role="status">{copied}</p></div> : <div className={styles.actions}>{step < 0 ? <button className={styles.primary} onClick={advance}>퇴사 전쟁 시작하기 ↗</button> : <ResignationChallenge key={step} stage={step} onComplete={advance} onMistake={() => setMistakes((n) => Math.min(FAILURE_LIMIT, n + 1))} />}<button className={styles.secondary} onClick={() => setEnding("stay")}>{step < 0 ? "아니요… 월급날까지만 다닐게요" : "알겠어요… 그냥 다닐게요"}</button></div>}
            <div className={styles.bottomLine}><span>🔒 사직서는 마음속에만 저장됩니다</span><span>관문 {String(attempts).padStart(2, "0")} / 반려 {mistakes}회</span></div>
          </div>
        </section>
        <aside className={styles.sidebar}>
          <div className={styles.memo}><span className={styles.memoLabel}>📌 인사팀에서 알려드립니다</span><h2>퇴사는 자유입니다<span>*</span></h2><p>* 자유롭게 신청하실 수 있다는 뜻입니다.<br />수락은 별개의 문제입니다.</p><div className={styles.signature}>인사팀 드림 ♡</div></div>
          <div className={styles.log}><div className={styles.logTitle}><h2>결재 히스토리</h2><span>LIVE</span></div><ol><li><i />퇴사 생각 감지됨<span>방금 전</span></li>{logs.map((item) => <li key={item.label}><i />{item.log}<span>처리 완료</span></li>)}{current && !ending && <li className={styles.activeLog}><i />{current.label}에서 붙잡히는 중<span>대기</span></li>}{ending === "stay" && <li><i />{forcedStay ? "반려 한도 초과. 강제 잔류 확정." : "신청 철회. 회사가 좋아합니다."}<span>처리 완료</span></li>}</ol></div>
          <p className={styles.asideNote}>회사는 당신을 놓치고 싶지 않습니다.<br />특히 인수인계 문서를.</p>
        </aside>
        <footer className={styles.footer}><span>아무거나 만들었는데, 퇴사는 못 하겠네.</span><span>가상의 회사 · 진짜 같은 기분 / AMUGEONA © 2026</span></footer>
      </div>
    </main>
  );
}
