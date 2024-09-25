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
    console.log(tarotCards);
  }, [tarotCards]);

  useEffect(() => {
    if (selectedCards.length > 0) {
      getCardNames(selectedCards.map((card) => card.name));
    }
  }, [selectedCards]);

  useEffect(() => {
    const containerWidth = 300;
    const containerHeight = 400;
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

  const shuffleCards = () => {
    resetSelectedCards();
    setExplainResult([]);
    setIsShuffling(true);
    setShuffleCount((prevCount) => prevCount + 1);
    let currentIndex = tarotCards.length - 1;

    const shuffleStep = () => {
      if (currentIndex <= 0) {
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
            top: (400 - 240) / 2 + Math.random() * (400 / 2 - 240 / 2),
            left: (300 - 160) / 2 + Math.random() * (300 / 2 - 160 / 2),
          },
        }));
      });
      currentIndex--;
      setTimeout(shuffleStep, 200);
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
        <div className="explain-result">
          <div className="explain-result-content">
            <p>
              <strong>Giải thích lá bài:</strong>{" "}
              {
                explainResult.find((item) => item.index === index)
                  ?.explainResult?.general
              }
            </p>
            <p>
              <strong>Tình yêu:</strong>{" "}
              {
                explainResult.find((item) => item.index === index)
                  ?.explainResult?.love
              }
            </p>
            <p>
              <strong>Nghề nghiệp:</strong>{" "}
              {
                explainResult.find((item) => item.index === index)
                  ?.explainResult?.career
              }
            </p>
            <p>
              <strong>Tài chính:</strong>{" "}
              {
                explainResult.find((item) => item.index === index)
                  ?.explainResult?.finance
              }
            </p>
            <p>
              <strong>Lời khuyên:</strong>{" "}
              {
                explainResult.find((item) => item.index === index)
                  ?.explainResult?.advice
              }
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
