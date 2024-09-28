import React, { useEffect, useState } from "react";
import cloudinary from "../constain/cloudinaryConfig";
import { TarotCard } from "./DrawCardAnimation";

interface CardProps {
  card: TarotCard;
  index: number;
  isShuffling: boolean;
  selectedCards: string[];
  flipCard: (index: number) => void;
  length: number;
  handleExplainTarotCard: (index: number) => void;
}

const Card: React.FC<CardProps> = ({
  card,
  index,
  isShuffling,
  selectedCards,
  flipCard,
  handleExplainTarotCard,
  length,
}) => {
  const isSelected = selectedCards.includes(card.name);
  const [showDetailButton, setShowDetailButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDetailButton(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  const imageUrl = cloudinary.url(card.imageFront);

  return (
    <div
      key={index}
      className={`card-${
        index + 1
      } w-[160px] h-[240px] perspective-[400px] absolute rounded-lg overflow-hidden`}
      style={{
        zIndex:
          isSelected && !isShuffling
            ? card.zIndex
            : Math.floor(Math.random() * length),
        transition: "all 0.3s",
        transform:
          !isShuffling && isSelected
            ? `rotateY(${card.isFlipped ? 180 : 0}deg) translateY(${
                isSelected ? 20 : 0
              }px)`
            : undefined,
        cursor: isShuffling ? "default" : "pointer",
        transformStyle: "preserve-3d",
        position: isSelected && !isShuffling ? "relative" : "absolute",
        top: isShuffling ? `${card.position?.top ?? 0}px` : 10,
        left: isShuffling ? `${card.position?.left ?? 0}px` : undefined,
        gridColumn: isSelected && !isShuffling ? `span 1` : undefined,
        gridRow: isSelected && !isShuffling ? `span 1` : undefined,
        margin: isSelected && !isShuffling ? `10px` : undefined, // Thêm spacing giữa các card selectedCards
      }}
      onClick={() => {
        flipCard(index);
      }}
    >
      <div
        className="card-back"
        style={{
          backgroundColor: "black",
          width: "100%",
          height: "100%",
          backfaceVisibility: card.isFlipped ? "hidden" : "unset",
          position: "absolute",
        }}
      >
        <img
          src="https://res.cloudinary.com/imt-media/image/upload/v1727514583/back-card.png"
          alt="back_card"
        />
      </div>
      {showDetailButton && !isShuffling && isSelected && card.isFlipped && (
        <div className="button-card-detail bg-[#FEF9EEFF] text-black px-1 rounded-xs">
          <span onClick={() => handleExplainTarotCard(index)}>read card</span>
        </div>
      )}
      <div
        className="card-front"
        style={{
          backgroundColor: "black",
          width: "100%",
          height: "100%",
          backfaceVisibility: !card.isFlipped ? "hidden" : "unset",
          transform: "rotateY(180deg)",
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img src={imageUrl} alt={card.name} />
      </div>
    </div>
  );
};

export default Card;
