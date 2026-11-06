"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./angry-calculator.module.css";

type Operator = "+" | "−" | "×" | "÷" | null;

const numberLayouts = [
  ["7", "8", "9", "4", "5", "6", "1", "2", "3"],
  ["1", "7", "4", "8", "2", "9", "5", "3", "6"],
  ["6", "2", "8", "3", "9", "1", "7", "4", "5"],
  ["5", "9", "3", "1", "6", "8", "4", "7", "2"],
] as const;

const unlockStages = ["타이밍 맞추기", "짝맞추기", "도망가는 = 잡기"] as const;
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
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [scannerPosition, setScannerPosition] = useState(0);
  const [unlockAttempts, setUnlockAttempts] = useState(0);
  const [unlockStage, setUnlockStage] = useState(0);
  const [memoryOrder, setMemoryOrder] = useState(memoryOrderStart);
  const [memorySelection, setMemorySelection] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [memoryLocked, setMemoryLocked] = useState(false);
  const [runawayCount, setRunawayCount] = useState(0);
  const [patience, setPatience] = useState(100);
  const [message, setMessage] = useState("숫자를 입력하세요. 키패드가 얌전할 때요.");
  const scannerDirection = useRef(1);
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

  useEffect(() => {
    if (hiddenResult === null || unlockStage !== 0) return;

    const scanner = window.setInterval(() => {
      setScannerPosition((position) => {
        const next = position + scannerDirection.current * 1.2;
        if (next >= 100) {
          scannerDirection.current = -1;
          return 100;
        }
        if (next <= 0) {
          scannerDirection.current = 1;
          return 0;
        }
        return next;
      });
    }, 30);

    return () => window.clearInterval(scanner);
  }, [hiddenResult, unlockStage]);

  const enterNumber = (number: string) => {
    clearHiddenResult();
    setDisplay((value) => {
      if (waitingForValue || value === "오류") return number;
      if (value.replace(".", "").length >= 10) return value;
      return value === "0" ? number : `${value}${number}`;
    });
    setWaitingForValue(false);
    setLayoutIndex((index) => (index + 1) % numberLayouts.length);
    nudgePatience(9);
    setMessage(`“${number}” 입력 완료. 숫자들이 자리를 바꿨어요. 다시 찾으세요.`);
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
    setScannerPosition(0);
    scannerDirection.current = 1;
    setUnlockAttempts(0);
    setUnlockStage(0);
    resetMemoryGame();
    setRunawayCount(0);
    setDisplay("정답은…");
    setMessage("정답 보관함이 잠겼습니다. 타이밍 좋게 해제해 보세요.");
  };

  const advanceUnlockStage = (nextMessage: string) => {
    setUnlockStage((stage) => stage + 1);
    setScannerPosition(0);
    scannerDirection.current = 1;
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

  const unlockByTiming = () => {
    if (hiddenResult === null) return;

    const hitTarget = scannerPosition >= 58 && scannerPosition <= 82;
    if (!hitTarget) {
      setScannerPosition(0);
      scannerDirection.current = 1;
      failUnlockStage("1단계 실패. 초록 구간에서 눌러야죠. 다시 집중하세요.");
      return;
    }

    advanceUnlockStage("타이밍은 통과. 이제 뒤집힌 카드의 짝을 맞춰보세요.");
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
    setLayoutIndex(0);
    setScannerPosition(0);
    scannerDirection.current = 1;
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
        <p>DAY 001 · ANNOYING BUT ACCURATE</p>
        <span>인내심 {patience}%</span>
      </div>
      <div className={styles.patienceTrack} aria-hidden="true"><span style={{ width: `${patience}%` }} /></div>

      <header className={styles.intro}>
        <h1>킹받는 계산기</h1>
        <p>계산은 정확해요. 키패드의 협조는 장담 못 해요.</p>
      </header>

      <div className={styles.machine}>
        <div className={styles.display} aria-live="polite">
          <span className={styles.expression}>{expression}</span>
          <output className={hiddenResult !== null ? styles.redacted : undefined}>{display}</output>
        </div>
        <p className={styles.message} aria-live="polite">{message}</p>
        {hiddenResult !== null && <div className={styles.unlockPanel}>
          <div className={styles.unlockHeader}><span>{currentUnlockStage}</span><span>{unlockStage + 1}/{unlockStages.length}단계 · 시도 {unlockAttempts}회</span></div>
          <div className={styles.stageDots} aria-label={`정답 해제 ${unlockStage + 1}단계 진행 중`}>{unlockStages.map((stage, index) => <span key={stage} className={index < unlockStage ? styles.completedStage : index === unlockStage ? styles.currentStage : undefined}>{index + 1}</span>)}</div>
          {unlockStage === 0 && <>
            <p className={styles.challengeHint}>초록 구간에서 해제 버튼을 누르세요.</p>
            <div className={styles.unlockTrack} role="meter" aria-label="정답 해제 게이지" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(scannerPosition)}>
              <span className={styles.unlockTarget} style={{ left: "58%", width: "24%" }} />
              <span className={styles.unlockScanner} style={{ left: `${scannerPosition}%` }} />
            </div>
            <button type="button" className={styles.unlockButton} onClick={unlockByTiming}>타이밍 해제!</button>
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

        <div className={styles.keypad}>
          <button type="button" className={styles.utility} onClick={reset}>AC</button>
          <button type="button" className={styles.utility} onClick={changeSign}>+/−</button>
          <button type="button" className={styles.utility} onClick={makePercent}>%</button>
          <button type="button" className={styles.operator} onClick={() => chooseOperator("÷")}>÷</button>
          {numberLayouts[layoutIndex].slice(0, 3).map((number) => <button key={number} type="button" className={styles.numberKey} onClick={() => enterNumber(number)}>{number}</button>)}
          <button type="button" className={styles.operator} onClick={() => chooseOperator("×")}>×</button>
          {numberLayouts[layoutIndex].slice(3, 6).map((number) => <button key={number} type="button" className={styles.numberKey} onClick={() => enterNumber(number)}>{number}</button>)}
          <button type="button" className={styles.operator} onClick={() => chooseOperator("−")}>−</button>
          {numberLayouts[layoutIndex].slice(6).map((number) => <button key={number} type="button" className={styles.numberKey} onClick={() => enterNumber(number)}>{number}</button>)}
          <button type="button" className={styles.operator} onClick={() => chooseOperator("+")}>+</button>
          <button type="button" className={styles.zero} onClick={() => enterNumber("0")}>0</button>
          <button type="button" onClick={enterDecimal}>.</button>
          <button type="button" className={styles.equals} onClick={calculateResult}>=</button>
        </div>
      </div>
      <p className={styles.tip}>팁: 숫자를 누를 때마다 1~9 키가 섞입니다. 결과 보관함도 매번 다른 방식으로 귀찮게 해요.</p>
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
