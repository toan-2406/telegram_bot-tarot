import { useState } from "react";
import "./App.css";
import DrawCardAnimation from "./components/DrawCardAnimation";
import { cardTalkAboutYou, TarotResponse } from "./services/translateService";
import { useLoading } from "./contexts/loading.context";

interface Hints {
  love: string;
  career: string;
  health: string;
  finance: string;
  personal_growth: string;
}

export type HintType = keyof Hints;

function App() {
  const { setLoading } = useLoading();
  const hintOptions: { value: HintType; label: string }[] = [
    { value: "love", label: "Tình yêu" },
    { value: "career", label: "Sự nghiệp" },
    { value: "health", label: "Sức khỏe" },
    { value: "finance", label: "Tài chính" },
    { value: "personal_growth", label: "Phát triển cá nhân" },
  ];
  const [names, setNames] = useState<string[]>([]);
  const [result, setResult] = useState<TarotResponse | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isExplain, setIsExplain] = useState<boolean>(false);
  const [optionSelected, setOptionSelected] = useState<{
    value: HintType;
    label: string;
  } | null>(null);
  const fetchResult = async (
    cardNames: string[],
    hint: { value: HintType; label: string }
  ) => {
    console.log(cardNames, hint);
    setLoading(true); // Bắt đầu tải
    const result = await cardTalkAboutYou(cardNames, hint);
    setResult(result);
    setLoading(false); // Kết thúc tải
    setIsExplain(true);
  };

  const getCardNames = (cardNames: string[]) => {
    setNames(cardNames);
  };

  const handleGetIsFlipped = (isFlipped: boolean): boolean => {
    setIsFlipped(isFlipped);
    return isFlipped;
  };

  return (
    <div className="App">
      <h1 style={{ fontSize: 20 }}>Ứng dụng Tarot</h1>
      <DrawCardAnimation
        getCardNames={getCardNames}
        getIsFlipped={handleGetIsFlipped}
      />
      {names.length > 0 && isFlipped && (
        <div className="hint-container">
          <div className="hint-buttons">
            {hintOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setOptionSelected(option);
                  fetchResult(names, option);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {result && isExplain && (
        <div className="explain-main-result">
          <div className="explain-main-result-content">
            <p>
              {" "}
              <strong>Phân tích: </strong> {result.analysis}
            </p>
            <p>
              {" "}
              <strong>{optionSelected?.label}: </strong>{" "}
              {result[optionSelected?.value as keyof TarotResponse]}
            </p>
          </div>
          <button onClick={() => setIsExplain(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
