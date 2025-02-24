import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
import { explainTarotCard, TarotCardExplanation } from "../services/api";
import { useLoading } from "../contexts/loading.context";
import { cardData } from "../constain/data";
import "./DrawCardAnimation.css";

export interface TarotCard {
  name: string;
  imageFront: string;
  isFlipped: boolean;
  position?: {
    top: number;
    left: number;
    rotate?: number;
    scale?: number;
  };
  zIndex: number;
}

interface DrawCardAnimationProps {
  getCardNames: (cardNames: string[]) => void;
  getIsFlipped: (isFlipped: boolean) => boolean;
  getIsShuffling: (isShuffling: boolean) => void;
}

const DrawCardAnimation: React.FC<DrawCardAnimationProps> = ({
  getCardNames,
  getIsFlipped,
  getIsShuffling,
}) => {
  const { setLoading } = useLoading();
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isExplain, setIsExplain] = useState(false);
  const [result, setResult] = useState<TarotCardExplanation | null>(null);

  useEffect(() => {
    const tarotCards = cardData.map((card, index) => ({
      name: card.name,
      imageFront: card.img,
      isFlipped: false,
      zIndex: cardData.length - index,
      position: {
        top: 0,
        left: 0,
        rotate: 0,
        scale: 1
      }
    }));

    setCards(tarotCards);
  }, []);

  const getRandomPosition = (index: number, total: number) => {
    const radius = 150;
    const angle = (index / total) * 2 * Math.PI;
    const randomOffset = Math.random() * 30 - 15;

    return {
      top: Math.sin(angle) * radius + randomOffset,
      left: Math.cos(angle) * radius + randomOffset,
      rotate: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4
    };
  };

  const getFanPosition = (index: number, total: number) => {
    const fanAngle = 120; // Góc của hình nón (120 độ)
    const startAngle = -fanAngle / 2; // Góc bắt đầu
    const angleStep = fanAngle / (total - 1); // Bước góc giữa các lá bài
    const currentAngle = startAngle + (index * angleStep);
    const radius = 300; // Bán kính của hình nón

    // Tính toán vị trí dựa trên góc
    const radian = (currentAngle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * (radius / 3); // Chia 3 để làm phẳng hình nón

    return {
      left: x,
      top: y,
      rotate: currentAngle, // Xoay lá bài theo góc
      scale: 1
    };
  };

  const shuffleCards = () => {
    setIsShuffling(true);
    getIsShuffling(true);
    setSelectedCards([]);
    setIsExplain(false);
    setResult(null);

    // Animation 1: Scatter cards
    const scatteredCards = [...cards].sort(() => Math.random() - 0.5).map((card, index) => ({
      ...card,
      isFlipped: false,
      position: getRandomPosition(index, cards.length)
    }));
    setCards(scatteredCards);

    // Animation 2: Gather cards after delay
    setTimeout(() => {
      const gatheredCards = scatteredCards.map((card, index) => ({
        ...card,
        position: {
          top: Math.random() * 20 - 10,
          left: Math.random() * 20 - 10,
          rotate: Math.random() * 360, // Full rotation
          scale: 1.2 // Slightly larger during gathering
        },
        zIndex: cards.length - index
      }));
      setCards(gatheredCards);
    }, 1000);

    // Animation 3: Fan out cards in a cone shape
    setTimeout(() => {
      const fannedCards = scatteredCards.map((card, index) => ({
        ...card,
        position: getFanPosition(index, cards.length),
        zIndex: index
      }));
      setCards(fannedCards);
      setIsShuffling(false);
      getIsShuffling(false);
    }, 2000);
  };

  const flipCard = (index: number) => {
    if (isShuffling) return;

    const selectedCard = cards[index];
    if (selectedCards.includes(selectedCard.name)) {
      return;
    }

    if (selectedCards.length >= 2) {
      return;
    }

    const updatedCards = [...cards];
    updatedCards[index] = {
      ...selectedCard,
      isFlipped: true,
      zIndex: 1000 + selectedCards.length,
      position: {
        top: -60, // Cùng độ cao cho cả hai lá bài
        left: selectedCards.length === 0 ? -92 : 92, // (160px + 24px) / 2 = 92px
        rotate: 0,
        scale: 1.1
      }
    };

    // Cập nhật vị trí của lá bài đã chọn trước đó (nếu có)
    if (selectedCards.length === 1) {
      const firstSelectedCardIndex = cards.findIndex(card => selectedCards.includes(card.name));
      if (firstSelectedCardIndex !== -1) {
        updatedCards[firstSelectedCardIndex] = {
          ...updatedCards[firstSelectedCardIndex],
          position: {
            top: -60,
            left: -92,
            rotate: 0,
            scale: 1.1
          }
        };
      }
    }

    setCards(updatedCards);
    setSelectedCards([...selectedCards, selectedCard.name]);
    getCardNames([...selectedCards, selectedCard.name]);
    getIsFlipped(selectedCards.length === 1);
  };

  const handleExplainTarotCard = async (index: number) => {
    setLoading(true);
    const result = await explainTarotCard(cards[index].name);
    setResult(result);
    setLoading(false);
    setIsExplain(true);
  };

  const quickReshuffle = () => {
    // Nhanh chóng thu hồi các lá bài đã chọn và sắp xếp lại
    const resetCards = [...cards].map((card) => ({
      ...card,
      isFlipped: false,
      position: {
        top: 0,
        left: 0,
        rotate: 0,
        scale: 1
      }
    }));

    // Đảo vị trí các lá bài
    const shuffledIndexes = [...Array(cards.length).keys()].sort(() => Math.random() - 0.5);
    const newCards = shuffledIndexes.map((newIndex, currentIndex) => ({
      ...resetCards[newIndex],
      position: getFanPosition(currentIndex, cards.length),
      zIndex: currentIndex
    }));

    setCards(newCards);
    setSelectedCards([]);
    getCardNames([]);
    getIsFlipped(false);
  };

  return (
    <div className="relative w-full">
      <motion.div 
        className="flex justify-center items-center min-h-[60vh] relative perspective-[1000px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {!isShuffling && cards.length > 0 && (
          <motion.div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {selectedCards.length < 2 && (
              <motion.div
                className="bg-vintage-primary/90 px-6 py-3 rounded-full
                         border-2 border-vintage-accent shadow-vintage text-vintage-light 
                         font-cormorant text-lg text-center"
              >
                {selectedCards.length === 0 ? "Chọn lá bài đầu tiên" : "Chọn lá bài thứ hai"}
              </motion.div>
            )}
            
            {selectedCards.length === 2 && (
              <motion.button
                className="bg-vintage-primary/90 px-6 py-2 rounded-full
                         border-2 border-vintage-accent shadow-vintage text-vintage-light 
                         font-cormorant text-lg hover:bg-vintage-primary
                         transition-all duration-300"
                onClick={quickReshuffle}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Chọn lại
              </motion.button>
            )}
          </motion.div>
        )}
        
        <div className="relative w-[160px] h-[240px]">
          <AnimatePresence>
            {cards.map((card, index) => (
              <Card
                key={card.name}
                card={card}
                index={index}
                isShuffling={isShuffling}
                selectedCards={selectedCards}
                flipCard={flipCard}
                handleExplainTarotCard={handleExplainTarotCard}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div 
        className="flex justify-center mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          className="bg-vintage-accent text-vintage-primary px-8 py-3 rounded-full
                   font-playfair text-lg shadow-vintage hover:shadow-vintage-hover
                   border-2 border-vintage-gold transition-all duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={shuffleCards}
          disabled={isShuffling}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isShuffling ? "Đang xáo bài..." : "Xáo bài"}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {result && isExplain && (
          <motion.div
            className="fixed inset-0 bg-vintage-dark/95 px-5 py-11 z-[1000] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-playfair text-2xl font-bold text-vintage-light text-center mb-6">
                Ý nghĩa lá bài
              </h2>
              
              <motion.div 
                className="bg-vintage-primary/80 rounded-2xl p-6 border-2 border-vintage-accent shadow-vintage"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="space-y-6">
                  {Object.entries(result).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <h3 className="font-playfair text-xl text-vintage-accent mb-2 capitalize">
                        {key.replace('_', ' ')}
                      </h3>
                      <p className="font-cormorant text-lg text-vintage-light">
                        {value as string}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.button
                className="fixed bottom-8 left-1/2 transform -translate-x-1/2 
                         bg-vintage-accent text-vintage-primary px-6 py-2 rounded-full
                         font-playfair text-lg shadow-vintage hover:shadow-vintage-hover
                         border-2 border-vintage-gold"
                onClick={() => setIsExplain(false)}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Đóng
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DrawCardAnimation;
