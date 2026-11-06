"use client";

import { useRef, useState, type PointerEvent } from "react";
import styles from "./angry-calculator.module.css";

type Operator = "+" | "−" | "×" | "÷" | null;

const dialNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const;
const unlockStages = ["계산기 수평 맞추기", "짝맞추기", "도망가는 = 잡기"] as const;
const memoryCards = ["◒", "✦", "⌁", "◒", "✦", "⌁"] as const;
const memoryOrderStart = [0, 1, 2, 3, 4, 5];
const runawayPositions = [
  { top: 42, left: 8 },
  { top: 12, left: 62 },
  { top: 55, left: 58 },
  { top: 20, left: 26 },
] as const;

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "오류";
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6)));
}

export function AngryCalculator() {
  const [display, setDisplay] = useState("0");
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForValue, setWaitingForValue] = useState(false);
  const [hiddenResult, setHiddenResult] = useState<number | null>(null);
  const [dialNumber, setDialNumber] = useState<number | null>(null);
  const [dialProgress, setDialProgress] = useState(0);
  const [machineAngle, setMachineAngle] = useState(-12);
  const [unlockAttempts, setUnlockAttempts] = useState(0);
  const [unlockStage, setUnlockStage] = useState(0);
  const [memoryOrder, setMemoryOrder] = useState(memoryOrderStart);
  const [memorySelection, setMemorySelection] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [memoryLocked, setMemoryLocked] = useState(false);
  const [runawayCount, setRunawayCount] = useState(0);
  const [patience, setPatience] = useState(100);
  const [message, setMessage] = useState("숫자를 입력하세요. 키패드가 얌전할 때요.");
  const dialStartX = useRef(0);
  const machineStartX = useRef(0);
  const machineStartAngle = useRef(-12);
  const memoryResetTimer = useRef<number | null>(null);

  const nudgePatience = (amount = 6) => setPatience((value) => Math.max(8, value - amount));
  const resetMemoryGame = () => {
    if (memoryResetTimer.current !== null) window.clearTimeout(memoryResetTimer.current);
    memoryResetTimer.current = null;
    setMemoryOrder(memoryOrderStart);
    setMemorySelection([]);
    setMatchedCards([]);
    setMemoryLocked(false);
  };
  const clearHiddenResult = () => {
    setHiddenResult(null);
    setUnlockStage(0);
    setUnlockAttempts(0);
    resetMemoryGame();
    setRunawayCount(0);
  };

  const enterNumber = (number: string) => {
    clearHiddenResult();
    setDisplay((value) => {
      if (waitingForValue || value === "오류") return number;
      if (value.replace(".", "").length >= 10) return value;
      return value === "0" ? number : `${value}${number}`;
    });
    setWaitingForValue(false);
    nudgePatience(number === "0" ? 12 : 8);
    setMessage(`“${number}” 입력 완료. 다이얼이 천천히 제자리로 돌아옵니다.`);
  };

  const enterDecimal = () => {
    clearHiddenResult();
    if (waitingForValue || display === "오류") {
      setDisplay("0.");
      setWaitingForValue(false);
    } else if (!display.includes(".")) {
      setDisplay(`${display}.`);
    }
    nudgePatience(5);
    setMessage("소수점까지요? 키패드도 긴장하네요.");
  };

  const chooseOperator = (nextOperator: Exclude<Operator, null>) => {
    if (hiddenResult !== null) {
      setMessage("결과부터 훔쳐보세요. 모른 척 다음 계산으로 넘어갈 순 없어요.");
      return;
    }

    const nextValue = Number(display);
    if (storedValue !== null && operator && !waitingForValue) {
      const result = calculate(storedValue, nextValue, operator);
      setStoredValue(result);
      setDisplay(formatNumber(result));
    } else {
      setStoredValue(nextValue);
    }
    setOperator(nextOperator);
    setWaitingForValue(true);
    nudgePatience(7);
    setMessage(`“${nextOperator}” 선택 완료. 이건 안 섞어 드릴게요. 아직은.`);
  };

  const calculateResult = () => {
    if (hiddenResult !== null) {
      setMessage("결과 훔쳐보기 버튼이 바로 아래에 있는데요?");
      return;
    }
    if (storedValue === null || !operator || waitingForValue) {
      setMessage("숫자와 연산자를 먼저 골라 주세요. 순서라는 게 있어요.");
      return;
    }

    const result = calculate(storedValue, Number(display), operator);
    setStoredValue(null);
    setOperator(null);
    setWaitingForValue(true);
    nudgePatience(16);

    if (!Number.isFinite(result)) {
      setDisplay("오류");
      setMessage("0으로 나누면 안 됩니다. 이건 저도 못 우겨요.");
      return;
    }

    setHiddenResult(result);
    setMachineAngle(-12);
    setUnlockAttempts(0);
    setUnlockStage(0);
    resetMemoryGame();
    setRunawayCount(0);
    setDisplay("정답은…");
    setMessage("정답 보관함이 삐딱하게 잠겼습니다. 계산기부터 똑바로 돌려보세요.");
  };

  const advanceUnlockStage = (nextMessage: string) => {
    setUnlockStage((stage) => stage + 1);
    nudgePatience(8);
    setMessage(nextMessage);
  };

  const failUnlockStage = (nextMessage: string) => {
    setUnlockAttempts((count) => count + 1);
    nudgePatience(13);
    setMessage(nextMessage);
  };

  const completeUnlock = () => {
    if (hiddenResult === null) return;
    setDisplay(formatNumber(hiddenResult));
    setHiddenResult(null);
    nudgePatience(11);
    setMessage(hiddenResult === 42 ? "42. 우주의 답까지 훔쳐보셨네요." : "네, 그게 정답이에요. 생각보다 별거 없죠?");
  };

  const startMachineRotation = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    machineStartX.current = event.clientX;
    machineStartAngle.current = machineAngle;
  };

  const rotateMachine = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const nextAngle = Math.max(-15, Math.min(15, machineStartAngle.current + (event.clientX - machineStartX.current) / 12));
    setMachineAngle(nextAngle);
  };

  const finishMachineRotation = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (Math.abs(machineAngle) <= 1.5) {
      setMachineAngle(0);
      advanceUnlockStage("수평 맞춤 완료. 이제 뒤집힌 카드의 짝을 맞춰보세요.");
      return;
    }
    setMessage("아직 기울었어요. 계산기 본체를 조금 더 돌려보세요.");
  };

  const dialDistance = (number: number) => number === 0 ? 180 : 70 + number * 10;

  const startDial = (event: PointerEvent<HTMLButtonElement>, number: number) => {
    if (hiddenResult !== null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dialStartX.current = event.clientX;
    setDialNumber(number);
    setDialProgress(0);
    setMessage(`${number}번 구멍을 끝까지 돌리세요.`);
  };

  const rotateDial = (event: PointerEvent<HTMLButtonElement>) => {
    if (dialNumber === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setDialProgress(Math.min(dialDistance(dialNumber), Math.max(0, event.clientX - dialStartX.current)));
  };

  const finishDial = (event: PointerEvent<HTMLButtonElement>, number: number) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const completed = dialNumber === number && dialProgress >= dialDistance(number);
    setDialNumber(null);
    setDialProgress(0);
    if (!completed) {
      setMessage("끝까지 안 돌렸어요. 전화기는 대충 누르는 물건이 아니에요.");
      return;
    }
    enterNumber(String(number));
  };

  const chooseMemoryCard = (cardIndex: number) => {
    if (memoryLocked || matchedCards.includes(cardIndex) || memorySelection.includes(cardIndex)) return;

    if (memorySelection.length === 0) {
      setMemorySelection([cardIndex]);
      setMessage("첫 번째 카드를 열었어요. 제발 방금 본 걸 기억해 주세요.");
      return;
    }

    const firstCardIndex = memorySelection[0];
    const nextSelection = [firstCardIndex, cardIndex];
    setMemorySelection(nextSelection);

    if (memoryCards[firstCardIndex] === memoryCards[cardIndex]) {
      const nextMatchedCards = [...matchedCards, ...nextSelection];
      setMatchedCards(nextMatchedCards);
      setMemorySelection([]);

      if (nextMatchedCards.length === memoryCards.length) {
        advanceUnlockStage("짝맞추기 완료. 이제 = 버튼을 잡으면 결과를 보여줄게요. 아마도요.");
      } else {
        setMessage("짝을 맞췄네요. 그런데 아직 더 남았어요.");
      }
      return;
    }

    setMemoryLocked(true);
    failUnlockStage("틀린 짝이에요. 외운 카드 순서도 살짝 섞어 둘게요.");
    memoryResetTimer.current = window.setTimeout(() => {
      setMemorySelection([]);
      setMemoryLocked(false);
      setMemoryOrder((order) => [...order.slice(2), ...order.slice(0, 2)]);
      memoryResetTimer.current = null;
    }, 700);
  };

  const moveRunawayEquals = () => {
    if (runawayCount >= runawayPositions.length - 1) return;

    setRunawayCount((count) => count + 1);
    nudgePatience(4);
    setMessage(`= 버튼이 ${runawayCount + 1}번 도망갔어요. 이쯤 되면 계산기가 주인 같네요.`);
  };

  const catchRunawayEquals = () => {
    if (runawayCount < runawayPositions.length - 1) {
      moveRunawayEquals();
      return;
    }

    completeUnlock();
  };

  const reset = () => {
    setDisplay("0");
    setStoredValue(null);
    setOperator(null);
    setWaitingForValue(false);
    setHiddenResult(null);
    setDialNumber(null);
    setDialProgress(0);
    setMachineAngle(-12);
    setUnlockAttempts(0);
    setUnlockStage(0);
    resetMemoryGame();
    setRunawayCount(0);
    setPatience(100);
    setMessage("새로 시작합니다. 숫자들도 원래 자리로 돌아왔어요.");
  };

  const changeSign = () => {
    clearHiddenResult();
    setDisplay((value) => formatNumber(Number(value) * -1));
    setMessage("부호를 바꿨습니다. 마음도 바꾸실 건가요?");
  };

  const makePercent = () => {
    clearHiddenResult();
    setDisplay((value) => formatNumber(Number(value) / 100));
    setMessage("퍼센트요. 욕심은 조금 덜어냈고요.");
  };

  const expression = storedValue !== null && operator ? `${formatNumber(storedValue)} ${operator}` : hiddenResult !== null ? "계산기 보관함 · 잠김" : "계산 준비 완료";
  const currentUnlockStage = unlockStages[unlockStage];

  return (
    <section className={styles.calculator} aria-label="킹받는 계산기">
      <div className={styles.topline}>
        <p>DAY 002 · ANNOYING BUT ACCURATE</p>
        <span>인내심 {patience}%</span>
      </div>
      <div className={styles.patienceTrack} aria-hidden="true"><span style={{ width: `${patience}%` }} /></div>

      <header className={styles.intro}>
        <h1>킹받는 계산기</h1>
        <p>계산은 정확해요. 키패드의 협조는 장담 못 해요.</p>
      </header>

      <div className={hiddenResult !== null && unlockStage === 0 ? `${styles.machineFrame} ${styles.rotatingMachineFrame}` : styles.machineFrame}>
      <div className={styles.machine} style={{ transform: hiddenResult !== null && unlockStage === 0 ? `rotate(${machineAngle}deg)` : undefined }}>
        <div className={styles.display} aria-live="polite">
          <span className={styles.expression}>{expression}</span>
          <output className={hiddenResult !== null ? styles.redacted : undefined}>{display}</output>
        </div>
        <p className={styles.message} aria-live="polite">{message}</p>
        {hiddenResult !== null && <div className={styles.unlockPanel}>
          <div className={styles.unlockHeader}><span>{currentUnlockStage}</span><span>{unlockStage + 1}/{unlockStages.length}단계 · 시도 {unlockAttempts}회</span></div>
          <div className={styles.stageDots} aria-label={`정답 해제 ${unlockStage + 1}단계 진행 중`}>{unlockStages.map((stage, index) => <span key={stage} className={index < unlockStage ? styles.completedStage : index === unlockStage ? styles.currentStage : undefined}>{index + 1}</span>)}</div>
          {unlockStage === 0 && <>
            <p className={styles.challengeHint}>계산기 본체를 좌우로 끌어 수평으로 맞추세요.</p>
            <div className={styles.rotationPad} role="slider" aria-label="계산기 수평 조절" aria-valuemin={-15} aria-valuemax={15} aria-valuenow={Math.round(machineAngle)} tabIndex={0} onPointerDown={startMachineRotation} onPointerMove={rotateMachine} onPointerUp={finishMachineRotation}>
              <span>←</span><strong>{Math.round(machineAngle)}°</strong><span>→</span>
            </div>
          </>}
          {unlockStage === 1 && <>
            <p className={styles.challengeHint}>카드 세 쌍을 모두 맞추세요. 틀리면 순서가 조금 바뀝니다.</p>
            <div className={styles.memoryGrid}>
              {memoryOrder.map((cardIndex) => {
                const isRevealed = memorySelection.includes(cardIndex) || matchedCards.includes(cardIndex);
                return <button key={cardIndex} type="button" className={isRevealed ? styles.memoryCardRevealed : undefined} onClick={() => chooseMemoryCard(cardIndex)} aria-label={isRevealed ? `카드 ${memoryCards[cardIndex]}` : "뒤집힌 카드"} aria-pressed={isRevealed}>{isRevealed ? memoryCards[cardIndex] : "?"}</button>;
              })}
            </div>
          </>}
          {unlockStage === 2 && <>
            <p className={styles.challengeHint}>= 버튼이 세 번 도망가면 그때 잡을 수 있어요.</p>
            <div className={styles.runawayZone}>
              <button type="button" className={styles.runawayEquals} style={runawayPositions[runawayCount]} onPointerEnter={moveRunawayEquals} onClick={catchRunawayEquals}>=</button>
            </div>
          </>}
        </div>}

        <div className={styles.dialSection}>
          <p>숫자 구멍을 잡고 오른쪽으로 끝까지 돌리세요. 0은 특히 멀어요.</p>
          <div className={styles.rotaryDial} style={{ transform: `rotate(${dialNumber === null ? 0 : dialProgress / dialDistance(dialNumber) * 220}deg)` }}>
            <span className={styles.dialCenter}>☎</span>
            {dialNumbers.map((number, index) => {
              const angle = index * 36 - 90;
              const left = 50 + Math.cos(angle * Math.PI / 180) * 38;
              const top = 50 + Math.sin(angle * Math.PI / 180) * 38;
              return <button key={number} type="button" className={styles.dialHole} style={{ left: `${left}%`, top: `${top}%` }} onPointerDown={(event) => startDial(event, number)} onPointerMove={rotateDial} onPointerUp={(event) => finishDial(event, number)} onClick={(event) => { if (event.detail === 0) enterNumber(String(number)); }} aria-label={`${number}번 다이얼`}>{number}</button>;
            })}
          </div>
          <div className={styles.dialControls}>
            <button type="button" className={styles.utility} onClick={reset}>AC</button>
            <button type="button" className={styles.utility} onClick={changeSign}>+/−</button>
            <button type="button" className={styles.utility} onClick={makePercent}>%</button>
            <button type="button" className={styles.operator} onClick={() => chooseOperator("÷")}>÷</button>
            <button type="button" className={styles.operator} onClick={() => chooseOperator("×")}>×</button>
            <button type="button" className={styles.operator} onClick={() => chooseOperator("−")}>−</button>
            <button type="button" className={styles.operator} onClick={() => chooseOperator("+")}>+</button>
            <button type="button" onClick={enterDecimal}>.</button>
            <button type="button" className={styles.equals} onClick={calculateResult}>=</button>
          </div>
        </div>
      </div>
      </div>
      <p className={styles.tip}>팁: 숫자는 전화 다이얼을 끝까지 돌려 입력하세요. 0은 특히 오래 걸립니다.</p>
    </section>
  );
}

function calculate(left: number, right: number, operator: Exclude<Operator, null>) {
  switch (operator) {
    case "+": return left + right;
    case "−": return left - right;
    case "×": return left * right;
    case "÷": return left / right;
  }
}
