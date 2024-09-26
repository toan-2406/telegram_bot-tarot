import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import "./DrawCardAnimation.css";
import { cardData } from "../constain/data";
import { explainTarotCard, TarotCardExplanation } from "../services/api";
import { useLoading } from "../contexts/loading.context"; // Thêm import context loading
import { FaHandPointUp, FaShuffle } from "react-icons/fa6";

export interface TarotCard {
  name: string;
  imageFront: string;
  isFlipped: boolean;
  zIndex: number;
  position?: { top: number; left: number };
}

interface ExplainResult {
  index: number;
  explainResult: TarotCardExplanation | null;
}

const DrawCardAnimation: React.FC<{
  getCardNames: (cardNames: string[]) => void;
  getIsFlipped: (isFlipped: boolean) => void;
  getIsShuffling: (isShuffling: boolean) => void;
}> = ({ getCardNames, getIsFlipped, getIsShuffling }) => {
  const { setLoading } = useLoading();
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tarotCards, setTarotCards] = useState<TarotCard[]>(
    cardData.map((card, index) => ({
      name: card.name,
      imageFront: card.img,
      isFlipped: false,
      zIndex: cardData.length - index,
    }))
  );
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isExplain, setIsExplain] = useState(false);
  const [explainResult, setExplainResult] = useState<ExplainResult[]>([]);

  useEffect(() => {
    if (selectedCards.length > 0) {
      getCardNames(selectedCards.map((card) => card.name));
    }
  }, [selectedCards]);

  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth ?? 280;
    const containerHeight = containerRef.current?.offsetHeight ?? 320;
    const cardWidth = 160;
    const cardHeight = 240;
    if (isShuffling) {
      setTarotCards((prevCards) =>
        prevCards.map((card) => ({
          ...card,
          position: {
            top:
              (containerHeight - cardHeight) / 2 +
              Math.random() * (containerHeight / 2 - cardHeight / 2),
            left:
              (containerWidth - cardWidth) / 2 +
              Math.random() * (containerWidth / 2 - cardWidth / 2),
          },
        }))
      );
    }
  }, [isShuffling]);

  // Bắt sự kiện lắc điện thoại để xáo bài
  useEffect(() => {
    const handleShake = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity; // Sử dụng accelerationIncludingGravity
      if (acceleration) {
        const {
          x = 0,
          y = 0,
          z = 0,
        }: {
          x: number | null;
          y: number | null;
          z: number | null;
        } = acceleration;
        if (
          Math.abs(x || 0) > 30 || // Lắc mạnh mới kích hoạt
          Math.abs(y || 0) > 30 || // Lắc mạnh mới kích hoạt
          Math.abs(z || 0) > 30 // Lắc mạnh mới kích hoạt
        ) {
          shuffleCards();
        }
      }
    };

    window.addEventListener("devicemotion", handleShake);
    return () => {
      window.removeEventListener("devicemotion", handleShake);
    };
  }, []);

  const shuffleCards = () => {
    resetSelectedCards();
    setExplainResult([]);
    getIsShuffling(true);
    setIsShuffling(true);
    getIsFlipped(false);
    setShuffleCount((prevCount) => prevCount + 1);
    let currentIndex = tarotCards.length - 1;
    let recursionCount = 0; // Biến đếm số lần gọi đệ quy

    const shuffleStep = () => {
      if (currentIndex <= 0 || recursionCount >= 20) {
        // Giới hạn số lần gọi đệ quy
        setIsShuffling(false);
        return;
      }

      setTarotCards((prevCards) => {
        const newCards = [...prevCards];
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));

        const tempCard = newCards[currentIndex];
        newCards[currentIndex] = newCards[randomIndex];
        newCards[randomIndex] = tempCard;

        return newCards.map((card) => ({
          ...card,
          isFlipped: false,
          position: {
            top: (320 - 240) / 2 + Math.random() * (320 / 2 - 240 / 2),
            left: (280 - 160) / 2 + Math.random() * (280 / 2 - 160 / 2),
          },
        }));
      });
      currentIndex--;
      recursionCount++; // Tăng biến đếm

      setTimeout(shuffleStep, 250);
    };
    shuffleStep();
  };

  const resetSelectedCards = () => {
    setSelectedCards([]);
  };

  const flipCard = (index: number) => {
    if (!isShuffling) {
      setTarotCards((prevCards) => {
        let cardFlipped = false;
        return prevCards.map((card, i) => {
          if (cardFlipped) return card;
          if (
            selectedCards.some(
              (selectedCard) => selectedCard.name === card.name && i === index
            )
          ) {
            setIndex(index);
            getIsFlipped(true);
            cardFlipped = true;
            return { ...card, isFlipped: true, zIndex: 102 };
          }
          return card;
        });
      });
    }
  };

  const drawSelectedCards = (quality: number) => {
    const randomCards = tarotCards.slice(0, quality).map((card, index) => {
      if (index < quality) {
        return { ...card, isFlipped: true, zIndex: 102 };
      }
      return { ...card, isFlipped: false, zIndex: 0 };
    });
    setSelectedCards(randomCards.filter((card) => card.isFlipped));
  };

  // Hàm handleExplainTarotCard nhận vào một chỉ số (index) của lá bài được chọn
  const handleExplainTarotCard = async (index: number) => {
    // Lấy lá bài đã chọn dựa trên chỉ số
    const selectedCard = selectedCards[index];
    // Kiểm tra xem lá bài đã chọn có tồn tại không
    if (selectedCard) {
      // Bắt đầu trạng thái tải
      setLoading(true);
      // Tìm chỉ số của kết quả giải thích đã tồn tại trong explainResult
      const existingIndex = explainResult.findIndex(
        (item) => item.index === index
      );
      // Nếu không tìm thấy kết quả giải thích cho lá bài này
      if (existingIndex === -1) {
        // Gọi hàm explainTarotCard để lấy kết quả giải thích cho lá bài đã chọn
        const result = await explainTarotCard(selectedCard.name);
        // Đặt trạng thái giải thích là true
        setIsExplain(true);
        // Cập nhật explainResult với kết quả mới
        setExplainResult([...explainResult, { index, explainResult: result }]);
      } else {
        // Nếu đã có kết quả giải thích, chỉ cần đặt trạng thái giải thích là true
        setIsExplain(true);
      }
      // Kết thúc trạng thái tải
      setLoading(false);
    }
  };

  return (
    <>
      {isExplain && explainResult.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full h-screen px-5 py-11 bg-[#1D2128FF] rounded-md z-[1000]">
          <h2 className="font-archivo text-sm font-light text-gray-300 text-center">
            Thông tin lá bài
          </h2>
          <p className="font-inter text-sm font-bold text-primary text-center mb-2">
            {selectedCards[index].name}
          </p>
          <div className="max-h-[70vh] overflow-y-auto bg-[#171A1FFF] rounded-lg p-2">
            <div className="mb-4">
              <p className="font-inter text-sm font-normal text-[#c0c0c0]">
                <strong className="font-archivo text-sm font-bold text-[#FFFFFF] underline decoration-yellow-500 decoration-2 underline-offset-2">
                  Giải thích lá bài:{" "}
                </strong>{" "}
                <br />{" "}
                {
                  explainResult.find((item) => item.index === index)
                    ?.explainResult?.general
                }
              </p>
            </div>
            <div className="mb-4">
              <p className="font-inter text-sm font-normal text-[#c0c0c0]">
                <strong className="font-archivo text-sm font-bold text-[#FFFFFF] underline decoration-yellow-500 decoration-2 underline-offset-2">
                  Tình yêu:{" "}
                </strong>{" "}
                <br />{" "}
                {
                  explainResult.find((item) => item.index === index)
                    ?.explainResult?.love
                }
              </p>
            </div>
            <div className="mb-4">
              <p className="font-inter text-sm font-normal text-[#c0c0c0]">
                <strong className="font-archivo text-sm font-bold text-[#FFFFFF] underline decoration-yellow-500 decoration-2 underline-offset-2">
                  Nghề nghiệp:{" "}
                </strong>{" "}
                <br />{" "}
                {
                  explainResult.find((item) => item.index === index)
                    ?.explainResult?.career
                }
              </p>
            </div>
            <div className="mb-4">
              <p className="font-inter text-sm font-normal text-[#c0c0c0]">
                <strong className="font-archivo text-sm font-bold text-[#FFFFFF] underline decoration-yellow-500 decoration-2 underline-offset-2">
                  Tài chính:{" "}
                </strong>{" "}
                <br />{" "}
                {
                  explainResult.find((item) => item.index === index)
                    ?.explainResult?.finance
                }
              </p>
            </div>
            <div className="mb-4">
              <p className="font-inter text-sm font-normal text-[#c0c0c0]">
                <strong className="font-archivo text-sm font-bold text-[#FFFFFF] underline decoration-yellow-500 decoration-2 underline-offset-2">
                  Lời khuyên:{" "}
                </strong>{" "}
                <br />{" "}
                {
                  explainResult.find((item) => item.index === index)
                    ?.explainResult?.advice
                }
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
      <div
        ref={containerRef}
        className="relative h-[360px] mx-auto w-full flex items-center justify-center rounded-10 max-w-450 "
      >
        {tarotCards.map((card, index) => (
          <Card
            key={index}
            card={card}
            index={index}
            isShuffling={isShuffling}
            selectedCards={selectedCards.map((card) => card.name)}
            length={index++}
            flipCard={flipCard}
            handleExplainTarotCard={handleExplainTarotCard}
          />
        ))}
        {selectedCards.length > 0 && (
          <span className="text-white absolute bottom-0 left-1/2 transform -translate-x-1/2 ">
            Click chọn để lật lá bài
          </span>
        )}
      </div>
      <div className="flex justify-center flex-col items-center gap-2 mt-2">
        <button
          className="btn btn-filled-vintage text-center "
          onClick={shuffleCards}
          disabled={isShuffling}
        >
          <FaShuffle /> {isShuffling ? "Đang xáo bài..." : "Xáo bài & Lắc điện thoại"}
        </button>
        {!isShuffling && shuffleCount !== 0 && selectedCards.length === 0 && (
          <>
            <button
              className="btn btn-outline-vintage"
              onClick={() => drawSelectedCards(2)}
            >
              <FaHandPointUp /> Lấy 2 lá bài
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default DrawCardAnimation;
