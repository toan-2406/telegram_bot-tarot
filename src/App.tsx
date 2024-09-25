import { useState } from "react";
import "./App.css";
import DrawCardAnimation from "./components/DrawCardAnimation";
import { cardTalkAboutYou, TarotResponse } from "./services/api";
import { useLoading } from "./contexts/loading.context";

interface Hints {
  love: string;
  career: string;
  health: string;
  finance: string;
  personal_growth: string;
  other: string;
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
    { value: "other", label: "Yêu cầu khác" },
  ];
  const [names, setNames] = useState<string[]>([]);
  const [result, setResult] = useState<TarotResponse | null>(null);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isExplain, setIsExplain] = useState<boolean>(false);
  const [optionSelected, setOptionSelected] = useState<
    {
      value: HintType;
      label: string;
    }[]
  >([]);
  const [inputValue, setInputValue] = useState<string>(""); // Render optionSelected vào inputValue

  const fetchResult = async (
    cardNames: string[],
    hints: { value: HintType; label: string }[],
    other: string
  ) => {
    console.log(cardNames, hints, other);
    setLoading(true); // Bắt đầu tải
    const result = await cardTalkAboutYou(cardNames, hints, other);
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

  const handleGetIsShuffling = (isShuffling: boolean) => {
    if (isShuffling) {
      setOptionSelected([]);
      setInputValue("");
      setResult(null);
      setIsExplain(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <div className="w-full h-screen">
      <div className="p-3 bg-[#0e0c06]">
        <h1 className="font-archivo text-2xl font-bold text-white text-left">
          Tarot Reader
        </h1>
      </div>
      <div className="px-5 flex justify-center items-center flex-col">
        <DrawCardAnimation
          getIsShuffling={handleGetIsShuffling}
          getCardNames={getCardNames}
          getIsFlipped={handleGetIsFlipped}
        />
      </div>

      {names.length > 0 && isFlipped && (
        <div className="fixed bottom-0 left-0 w-full px-5 py-3 bg-[#0e0c06] rounded-t-lg">
          <div className="flex flex-col gap-2">
            <p className="text-white text-xs ">Chọn gợi ý:</p>
            <div className=" flex flex-wrap gap-2">
              {hintOptions
                .filter((option) => option.value !== "other")
                .map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setOptionSelected((prev) => {
                        if (prev?.some((opt) => opt.value === option.value)) {
                          return prev.filter(
                            (opt) => opt.value !== option.value
                          );
                        }
                        return [...prev, option];
                      });
                    }}
                    className={`btn btn-vintage text-white ${
                      optionSelected?.some((opt) => opt.value === option.value)
                        ? "opacity-100"
                        : "opacity-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg py-1 px-2 bg-gray-800">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Bạn muốn biết thêm về gì?"
                className="flex-grow bg-transparent text-white text-xs outline-none"
                maxLength={100}
              />
              <span className="text-white text-xs font-normal">
                {inputValue.length > 100 ? 100 : inputValue.length}/100
              </span>
              <button
                className="ml-2 bg-yellow-500 text-white rounded-full px-1"
                onClick={() => {
                  fetchResult(names, optionSelected, inputValue);
                }}
              >
                <span>➤</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {result && isExplain && (
        <div className="fixed bottom-0 left-0 w-full h-screen px-5 py-11 bg-[#1D2128FF] rounded-md z-[1000]">
          <h2 className="font-archivo text-lg font-bold text-white text-center">
            Kết quả bài Tarot của bạn
          </h2>
          <p className="font-inter text-sm font-normal text-[#F3F4F6] mb-2">
            Những lá bài liên quan thế nào đến gợi ý của bạn?
          </p>
          <div className="max-h-[70vh] overflow-y-auto bg-[#171A1FFF] rounded-lg p-2">
            <div className="mb-4">
              <p className="font-inter text-sm font-normal text-[#c0c0c0]">
                <strong className="font-archivo text-sm font-bold text-[#FFFFFF] underline decoration-yellow-500 decoration-2 underline-offset-2">
                  Phân tích:{" "}
                </strong>{" "}
                <br /> {result.analysis}
              </p>
            </div>
            {optionSelected.map((option) => (
              <div className="mb-4" key={option.value}>
                <p className="font-inter text-sm font-normal text-[#c0c0c0]">
                  <strong className="font-archivo text-sm font-bold text-[#FFFFFF] underline decoration-yellow-500 decoration-2 underline-offset-2">
                    {option.label}:{" "}
                  </strong>{" "}
                  <br /> {result[option.value]}
                </p>
              </div>
            ))}
            <div className="mb-4">
              <p className="font-inter text-sm font-normal text-[#c0c0c0]">
                <strong className="font-archivo text-sm font-bold text-[#FFFFFF] underline decoration-yellow-500 decoration-2 underline-offset-2">
                  Điều bạn muốn biết thêm:{" "}
                </strong>{" "}
                <br /> {result.other}
              </p>
            </div>
          </div>
          <button
            className="rounded-full bg-black px-3 py-1 absolute bottom-5 right-1/2 translate-x-1/2"
            onClick={() => setIsExplain(false)}
          >
            <span className="text-white">X</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
