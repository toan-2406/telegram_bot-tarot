import React, { useEffect, useState, useRef, useCallback } from "react";
import Card from "./Card";
import "./DrawCardAnimation.css";
import { cardData } from "../constain/data";
import { explainTarotCard, TarotCardExplanation } from "../services/api";
import { useLoading } from "../contexts/loading.context";
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
  const [tarotCards, setTarotCards] = useState<TarotCard[]>(() =>
    cardData.map((card, index) => ({
      name: card.name,
      imageFront: card.img,
      isFlipped: false,
      zIndex: cardData.length - index,
    }))
  );
  const [fakeCards, setFakeCards] = useState<TarotCard[]>(() =>
    Array(10).fill(null).map((_, index) => ({
      name: `Fake Card ${index + 1}`,
      imageFront: "path/to/fake/card/image.jpg",
      isFlipped: false,
      zIndex: 10 - index,
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
  }, [selectedCards, getCardNames]);

  useEffect(() => {
    if (isShuffling) {
      const containerWidth = containerRef.current?.offsetWidth ?? 280;
      const containerHeight = containerRef.current?.offsetHeight ?? 320;
      const cardWidth = 160;
      const cardHeight = 240;
      setFakeCards((prevCards) =>
        prevCards.map((card) => ({
          ...card,
          position: {
            top: (containerHeight - cardHeight) / 2 + Math.random() * (containerHeight / 2 - cardHeight / 2),
            left: (containerWidth - cardWidth) / 2 + Math.random() * (containerWidth / 2 - cardWidth / 2),
          },
        }))
      );
    }
  }, [isShuffling]);

  const handleShake = useCallback((event: DeviceMotionEvent) => {
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration) {
      const { x = 0, y = 0, z = 0 } = acceleration;
      if (Math.abs(x || 0) > 30 || Math.abs(y || 0) > 30 || Math.abs(z || 0) > 30) {
        shuffleCards();
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("devicemotion", handleShake);
    return () => {
      window.removeEventListener("devicemotion", handleShake);
    };
  }, [handleShake]);

  const shuffleCards = useCallback(() => {
    resetSelectedCards();
    setExplainResult([]);
    setIsShuffling(true);

    // Xáo trộn các lá bài giả
    const shuffledFakeCards = [...fakeCards].sort(() => Math.random() - 0.5);
    setFakeCards(shuffledFakeCards);

    // Xáo trộn các lá bài thật (không hiển thị)
    const shuffledRealCards = [...tarotCards].sort(() => Math.random() - 0.5);
    setTarotCards(shuffledRealCards);

    getIsFlipped(false);
    setShuffleCount((prevCount) => prevCount + 1);
    let currentIndex = fakeCards.length - 1;
    let recursionCount = 0;

    const shuffleStep = () => {
      if (currentIndex <= 0 || recursionCount >= 20) {
        setIsShuffling(false);
        return;
      }

      setFakeCards((prevCards) => {
        const newCards = [...prevCards];
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        [newCards[currentIndex], newCards[randomIndex]] = [newCards[randomIndex], newCards[currentIndex]];
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
      recursionCount++;

      setTimeout(shuffleStep, 250);
    };
    shuffleStep();
  }, [fakeCards, tarotCards, setLoading]);

  const resetSelectedCards = useCallback(() => {
    setSelectedCards([]);
  }, []);

  const flipCard = useCallback((index: number) => {
    if (!isShuffling) {
      setTarotCards((prevCards) => {
        let cardFlipped = false;
        return prevCards.map((card, i) => {
          if (cardFlipped) return card;
          if (selectedCards.some((selectedCard) => selectedCard.name === card.name && i === index)) {
            setIndex(index);
            getIsFlipped(true);
            cardFlipped = true;
            return { ...card, isFlipped: true, zIndex: 102 };
          }
          return card;
        });
      });
    }
  }, [isShuffling, selectedCards, getIsFlipped]);

  const drawSelectedCards = useCallback((quality: number) => {
    const shuffledCards = [...tarotCards].sort(() => Math.random() * tarotCards.length - Math.random() * tarotCards.length);
    const randomCards = shuffledCards.slice(0, quality).map((card) => ({
      ...card,
      isFlipped: true,
      zIndex: 102
    }));
    setSelectedCards(randomCards);
  }, [tarotCards]);

  const handleExplainTarotCard = useCallback(async (index: number) => {
    const selectedCard = selectedCards[index];
    if (selectedCard) {
      setLoading(true);
      const existingIndex = explainResult.findIndex((item) => item.index === index);
      if (existingIndex === -1) {
        const result = await explainTarotCard(selectedCard.name);
        setIsExplain(true);
        setExplainResult((prev) => [...prev, { index, explainResult: result }]);
      } else {
        setIsExplain(true);
      }
      setLoading(false);
    }
  }, [selectedCards, explainResult, setLoading]);

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
            {['general', 'love', 'career', 'finance', 'advice'].map((field) => (
              <div key={field} className="mb-4">
                <p className="font-inter text-sm font-normal text-[#c0c0c0]">
                  <strong className="font-archivo text-sm font-bold text-[#FFFFFF] underline decoration-yellow-500 decoration-2 underline-offset-2">
                    {field.charAt(0).toUpperCase() + field.slice(1)}:{" "}
                  </strong>{" "}
                  <br />{" "}
                  {explainResult.find((item) => item.index === index)?.explainResult?.[field as keyof TarotCardExplanation]}
                </p>
              </div>
            ))}
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
        {isShuffling ? fakeCards.map((card, index) => (
          <Card
            key={index}
            card={card}
            index={index}
            isShuffling={isShuffling}
            selectedCards={[]}
            length={index}
            flipCard={() => {}}
            handleExplainTarotCard={() => {}}
          />
        )) : tarotCards.map((card, index) => (
          <Card
            key={index}
            card={card}
            index={index}
            isShuffling={isShuffling}
            selectedCards={selectedCards.map((card) => card.name)}
            length={index}
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
          <button
            className="btn btn-outline-vintage"
            onClick={() => drawSelectedCards(2)}
          >
            <FaHandPointUp /> Lấy 2 lá bài
          </button>
        )}
      </div>
    </>
  );
};

export default DrawCardAnimation;
