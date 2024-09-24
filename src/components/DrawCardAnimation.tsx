import React, { useEffect, useState } from "react";
import Card from "./Card";
import "./DrawCardAnimation.css";
import { cardData } from "../constain/data";
import {
  explainTarotCard,
  TarotCardExplanation,
} from "../services/translateService";
import { useLoading } from "../contexts/loading.context"; // Thêm import context loading

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
}> = ({ getCardNames, getIsFlipped }) => {
  const { setLoading } = useLoading(); // Sử dụng context loading
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [index, setIndex] = useState(0);
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
    const containerWidth = 300;
    const containerHeight = 400;
    const cardWidth = 100;
    const cardHeight = 200;
    if (isShuffling) {
      setTarotCards((prevCards) =>
        prevCards.map((card) => ({
          ...card,
          position: {
            top: Math.random() * (containerHeight - cardHeight),
            left: Math.random() * (containerWidth - cardWidth),
          },
        }))
      );
    }
  }, [isShuffling]);

  const shuffleCards = () => {
    resetSelectedCards();
    setExplainResult([]); // Đặt explainResult về mảng rỗng khi xáo bài
    setIsShuffling(true);
    setShuffleCount((prevCount) => prevCount + 1);
    let currentIndex = tarotCards.length - 1;
    console.log("Bắt đầu xáo bài, số lượng lá bài:", tarotCards.length);

    const shuffleStep = () => {
      if (currentIndex <= 0) {
        setIsShuffling(false);
        return;
      }

      setTarotCards((prevCards) => {
        const newCards = [...prevCards];
        const randomIndex = Math.floor(Math.random() * currentIndex);
        console.log(
          "Đang xáo bài, chỉ số hiện tại:",
          currentIndex,
          "chỉ số ngẫu nhiên:",
          randomIndex
        );

        const tempCard = newCards[currentIndex];
        newCards[currentIndex] = {
          ...newCards[randomIndex],
          zIndex: tempCard.zIndex,
        };
        newCards[randomIndex] = {
          ...tempCard,
          zIndex: newCards[randomIndex].zIndex,
        };

        return newCards.map((card) => ({
          ...card,
          isFlipped: false,
          position: {
            top: Math.random() * (400 - 240),
            left: Math.random() * (300 - 160),
          },
        }));
      });

      currentIndex--;
      setTimeout(shuffleStep, 300);
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
            console.log("Đã lật lá bài:", card.name);
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
    const randomCards = tarotCards
      .sort(() => 0.5 - Math.random())
      .slice(0, quality)
      .map((card) => ({ ...card, isFlipped: true, zIndex: 102 }));
    setSelectedCards(randomCards);
  };

  const handleExplainTarotCard = async (index: number) => {
    const selectedCard = selectedCards[index];
    if (selectedCard) {
      setLoading(true); // Bắt đầu loading khi gọi API
      const existingIndex = explainResult.findIndex(item => item.index === index);
      if (existingIndex === -1) {
        const result = await explainTarotCard(selectedCard.name);
        setIsExplain(true);
        setExplainResult([...explainResult, { index, explainResult: result }]);
      } else {
        console.log("Chưa tìm thấy index =", index, "trong explainResult");
      }
      setLoading(false); // Kết thúc loading sau khi nhận được kết quả
    }
  };

  return (
    <>
      {isExplain && explainResult.length > 0 && (
        <div className="explain-result">
          <div className="explain-result-content">
            <p>
              <strong>Giải thích lá bài:</strong> {explainResult.find(item => item.index === index)?.explainResult?.general}
            </p>
            <p>
                <strong>Tình yêu:</strong> {explainResult.find(item => item.index === index)?.explainResult?.love}
            </p>
            <p>
              <strong>Nghề nghiệp:</strong> {explainResult.find(item => item.index === index)?.explainResult?.career}
            </p>
            <p>
              <strong>Tài chính:</strong> {explainResult.find(item => item.index === index)?.explainResult?.finance}
            </p>
            <p>
              <strong>Lời khuyên:</strong> {explainResult.find(item => item.index === index)?.explainResult?.advice}
            </p>
          </div>
          <button className="close-button" onClick={() => setIsExplain(false)}>
            Đóng
          </button>
        </div>
      )}
      <div className="card-animation">
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
          <span
            style={{
              color: "white",
              position: "absolute",
              bottom: 10,
              left: 30,
            }}
          >
            Click chọn để lật lá bài
          </span>
        )}
      </div>
      <button
        className="shuffle-button"
        onClick={shuffleCards}
        disabled={isShuffling}
      >
        {isShuffling ? "Đang xáo bài..." : "Xáo bài"}
      </button>
      {!isShuffling && shuffleCount !== 0 && selectedCards.length === 0 && (
        <>
          <button
            className="draw-card-button"
            onClick={() => drawSelectedCards(2)}
          >
            Lấy bài
          </button>
        </>
      )}
    </>
  );
};

export default DrawCardAnimation;
