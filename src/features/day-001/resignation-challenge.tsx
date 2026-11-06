"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./resignation-simulator.module.css";

const decoys = ["퇴사 취소", "퇴사 보류", "퇴사 안 함", "평생 근무", "퇴사 철회", "팀장님 사랑해요", "연봉 동결 동의", "야근 신청", "퇴사 재검토", "출근 확정", "휴가 반납"];
const folders = ["급여명세서", "사내 동호회", "복지 안내", "조직도", "회식 사진", "프린터 매뉴얼", "공지사항", "구내식당", "사내 규정", "경조사", "휴가 신청", "기타", "지난 공지", "양식 모음", "업무 자료", "보관함"];
const phrase = "연봉도 피자도 필요 없습니다. 저는 퇴사하겠습니다.";

export function ResignationChallenge({ stage, onComplete, onMistake }: { stage: number; onComplete: () => void; onMistake: () => void }) {
  const [count, setCount] = useState(0);
  const [misses, setMisses] = useState(0);
  const [message, setMessage] = useState("인사팀이 당신의 도전을 응원하지 않습니다.");
  const [position, setPosition] = useState({ x: 35, y: 40 });
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 36));
  const [opened, setOpened] = useState<number[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [input, setInput] = useState("");
  const [slow, setSlow] = useState(false);
  const [needle, setNeedle] = useState(0);
  const [holding, setHolding] = useState(false);
  const [held, setHeld] = useState(0);
  const heldStart = useRef(0);
  const holdActive = useRef(false);
  const finished = useRef(false);
  const needleRef = useRef(0);
  const completeRef = useRef(onComplete);
  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);

  function finish() {
    if (finished.current) return;
    finished.current = true;
    onComplete();
  }
  function fail(text: string) {
    onMistake();
    setMisses((n) => n + 1);
    setMessage(text);
  }

  useEffect(() => {
    if (stage !== 5) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      const phase = ((performance.now() - started) / (slow ? 3600 : 1300)) % 2;
      const value = (phase <= 1 ? phase : 2 - phase) * 100;
      needleRef.current = value;
      setNeedle(value);
    }, 30);
    return () => window.clearInterval(timer);
  }, [stage, slow]);

  useEffect(() => {
    if (!holding) return;
    const cancelHold = () => { holdActive.current = false; setHolding(false); setHeld(0); };
    const onVisibility = () => { if (document.hidden) cancelHold(); };
    window.addEventListener("blur", cancelHold);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const elapsed = performance.now() - heldStart.current;
      setHeld(Math.min(100, elapsed / 60));
      if (elapsed >= 6000 && !finished.current) {
        finished.current = true;
        completeRef.current();
      }
    }, 40);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("blur", cancelHold);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [holding]);

  function dodge() {
    if (count >= 9) return;
    setPosition((p) => ({ x: p.x < 40 ? 85 : 5, y: (count * 29 + 17) % 76 }));
    setCount((n) => n + 1);
    setMessage(["버튼도 퇴근하고 싶대요.", "손이 느리면 근속연수가 늘어납니다.", "인사팀: 못 누르셨으니 재직 동의입니다."][count % 3]);
  }
  function catchButton() {
    if (count < 9) { dodge(); return; }
    if (count >= 11) finish();
    else { setCount(count + 1); setPosition({ x: count === 9 ? 3 : 92, y: count === 9 ? 75 : 5 }); setMessage("잡았다고 끝인 줄 알았죠? 접수 확인도 잡으세요."); }
  }
  function choose(index: number) {
    if (index === target) {
      if (count === 2) finish();
      else { setCount(count + 1); setTarget((previous) => (previous + 13) % 36); setMessage("확인하셨네요. 확인의 확인도 부탁드립니다. 위치는 바꿨어요 ♡"); }
    } else {
      fail("방금 선택은 회사에 유리하게 해석되었습니다. 동의 횟수 초기화!");
      setCount(0);
      setTarget((previous) => (previous + 13) % 36);
    }
  }
  function stamp() {
    if (needleRef.current >= 44 && needleRef.current <= 56) {
      if (count === 2) finish();
      else { setCount(count + 1); setMessage("도장 인정. 다음 결재자도 정확히 찍어주세요."); }
    } else { setCount(0); fail("도장이 0.1mm 삐뚤어졌습니다. 결재 3개 전부 다시 받으세요."); }
  }
  function release() {
    if (!holdActive.current || finished.current) return;
    holdActive.current = false;
    setHolding(false); setHeld(0);
    fail("손 떼셨네요? 퇴사 의지가 부족하여 전송이 취소되었습니다.");
  }

  return <div className={styles.challenge}>
    <div className={styles.challengeHeader}><strong>인사팀 방해 공작 {stage + 1}/8</strong><span>반려 {misses}회</span></div>
    {stage === 0 && <>
      <p>도망가는 퇴사 버튼을 잡으세요. 지치면 잠깐 멈춥니다.<br /><small>마우스 접근 / 터치 / Enter 모두 가능 · 추격 {Math.min(count, 9)}/9 · 접수 {Math.max(0, count - 9)}/3</small></p>
      <div className={styles.chaseArena}><div className={styles.movingSlot} style={{ left: `${position.x}%`, top: `${position.y}%`, transform: `translateX(-${position.x}%)` }}><button className={styles.runaway} onPointerEnter={(e) => { if (e.pointerType === "mouse") dodge(); }} onClick={catchButton}>{count < 9 ? "퇴사하기 🚪" : "접수 확인!"}</button></div><span className={styles.arenaLabel}>사직서 접수처 (이동식)</span></div>
    </>}
    {(stage === 1 || stage === 3) && <>
      <p>{stage === 1 ? "36개 선택지 중 ‘퇴사 확정’을 찾아 3번 연속 선택하세요." : "피자에 현혹되지 말고 ‘피자 포기’를 3번 연속 찾으세요."}<br /><small>오답이면 연속 확인 초기화 · {count}/3</small></p>
      <div className={styles.choiceGrid}>{Array.from({ length: 36 }, (_, i) => <button key={i} onClick={() => choose(i)}>{i === target ? (stage === 1 ? "퇴사 확정" : "피자 포기") : stage === 3 ? ["피자 추가", "퇴사 포기", "야근 확정", "피자 대기", "퇴사 보류", "피자 먹기"][i % 6] : decoys[i % decoys.length]}</button>)}</div>
    </>}
    {stage === 2 && <>
      <p>대출 알림 12개를 <strong>번호가 작은 순서대로</strong> 닫으세요.<br /><small>순서가 틀리면 전부 다시 옵니다. 친절하죠? {count}/12</small></p>
      <div className={styles.loanGrid}>{[7, 2, 10, 5, 1, 9, 4, 12, 6, 3, 11, 8].map((n) => <button key={n} disabled={n <= count} onClick={() => { if (n === count + 1) { if (n === 12) finish(); else { setCount(n); setMessage(`알림 ${n}번 해제. 이자는 해제되지 않았습니다.`); } } else { setCount(0); fail("알림 순서 오류. 대출은 인내심도 심사합니다."); } }}><strong>🏦 알림 {String(n).padStart(2, "0")}</strong><span>{n <= count ? "확인 완료" : "이자 납부 예정 ×"}</span></button>)}</div>
    </>}
    {stage === 4 && <>
      <p><strong>‘인계 완료’로 끝나는 항목만</strong> 모두 체크하세요.<br /><small>오타와 ‘미완료’를 잘 보세요. 회사는 잘 보고 있습니다.</small></p>
      <div className={styles.checkList}>{["업무 문서 인계 완료", "주말 근무 동의", "비밀번호 인계 완로", "거래처 목록 인계 완료", "연차 포기 동의", "평생 재직 동의", "진행 업무 인계 완료", "급여 반납 동의", "업무 문서 인계 미완료", "장비 목록 인계 완료", "퇴사 철회 동의", "담당자 연락처 인계 완료"].map((label, i) => <label key={label}><input type="checkbox" checked={checked.includes(i)} onChange={() => setChecked((items) => items.includes(i) ? items.filter((item) => item !== i) : [...items, i])} />{label}</label>)}</div>
      <button className={styles.primary} onClick={() => { if (checked.length === 5 && [0, 3, 6, 9, 11].every((i) => checked.includes(i))) finish(); else { setChecked([]); fail("부적절한 동의가 발견되었습니다. 체크를 전부 지워드렸어요 ^^ "); } }}>서류 심사 요청</button>
    </>}
    {stage === 5 && <>
      <p>바늘이 초록색 칸에 들어왔을 때 도장을 찍으세요.<br /><small>팀장 → 본부장 → 대표, 3연속 성공. 삐끗하면 처음부터.</small></p>
      <div className={styles.seals}>{["팀장", "본부장", "대표"].map((label, i) => <span key={label} className={i < count ? styles.sealed : ""}>{i < count ? "승인" : label}</span>)}</div>
      <div className={styles.stampTrack} aria-label="도장 위치 표시"><span className={styles.safeZone} /><span className={styles.needle} style={{ left: `${needle}%` }} /></div>
      <button className={styles.primary} onClick={stamp}>쾅! 도장 찍기 ({count}/3)</button>
      <label className={styles.slowMode}><input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} /> 손목 보호 모드 — 바늘 속도 낮추기</label>
    </>}
    {stage === 6 && <>
      <p>퇴사 버튼이 서류 더미에 숨어 있습니다. 문서를 열어 찾으세요.<br /><small>총 16개 · 확인한 서류 {opened.length}개 · 단서: 오래된 자료일수록 수상합니다.</small></p>
      <div className={styles.folderGrid}>{folders.map((label, i) => <button key={label} disabled={opened.includes(i)} onClick={() => { setOpened([...opened, i]); if (i !== 15) fail(["회식 사진만 384장입니다.", "‘퇴사’ 검색 결과: 퇴사 금지 캠페인.", "양식이 없습니다. 담당자는 휴가입니다."][i % 3]); else setMessage("보관함 발견. 아래 작은 글씨까지 꼼꼼히 읽어보세요."); }}>📁 {label}{opened.includes(i) ? " ✓" : ""}</button>)}</div>
      {opened.includes(15) && <div className={styles.finePrint}><strong>구 시스템 이용약관 / 2011년 개정</strong><p>본 시스템은 Internet Explorer 6에 최적화되어 있습니다. 재직 유지가 기본값입니다. 개인정보 담당자도 퇴사했습니다. 문의는 받지 않습니다.</p><button onClick={finish}>[구 버전 퇴사 신청 계속]</button><p>위 메뉴는 회사의 사정에 따라 더 깊숙이 숨겨질 수 있습니다.</p></div>}
    </>}
    {stage === 7 && <>
      <p>마지막으로 아래 문장을 <strong>띄어쓰기·마침표까지</strong> 입력하세요.</p>
      <blockquote className={styles.copyPhrase}>{phrase}</blockquote>
      <label className={styles.inputLabel}>퇴사 의지 확인<textarea value={input} onChange={(e) => { setInput(e.target.value); holdActive.current = false; setHolding(false); setHeld(0); }} autoCapitalize="off" autoCorrect="off" spellCheck={false} placeholder="인사팀이 한 글자씩 보고 있습니다…" rows={3} /></label>
      <p className={styles.matchStatus}>{input === phrase ? "문장 일치. 이제 아래 버튼을 6초 동안 꾹 누르세요." : `${input.length}/${phrase.length}자 · 정확히 일치해야 전송할 수 있습니다.`}</p>
      <button className={`${styles.primary} ${styles.holdButton}`} disabled={input !== phrase} onPointerDown={(e) => { if (e.button !== 0) return; e.currentTarget.setPointerCapture(e.pointerId); if (!holding) { holdActive.current = true; heldStart.current = performance.now(); setHolding(true); } }} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); holdActive.current = true; heldStart.current = performance.now(); setHolding(true); } }} onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(); } }} onBlur={release}> {holding ? `사직서 전송 중 ${Math.floor(held)}% — 손 떼지 마세요` : "6초 꾹 눌러 최종 퇴사"}</button>
      <div className={styles.progress} role="progressbar" aria-label="최종 퇴사 전송" aria-valuenow={Math.floor(held)} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${held}%` }} /></div>
      <small>터치·마우스 또는 Enter/Space 길게 누르기. 손을 떼면 0%.</small>
    </>}
    <p className={styles.challengeMessage} role="status">{message}</p>
  </div>;
}
