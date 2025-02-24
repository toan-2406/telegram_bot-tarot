import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cloudinary from "../constain/cloudinaryConfig";
import { TarotCard } from "./DrawCardAnimation";

interface CardProps {
  card: TarotCard;
  index: number;
  isShuffling: boolean;
  selectedCards: string[];
  flipCard: (index: number) => void;
  handleExplainTarotCard: (index: number) => void;
}

const Card: React.FC<CardProps> = ({
  card,
  index,
  isShuffling,
  selectedCards,
  flipCard,
  handleExplainTarotCard,
}) => {
  const isSelected = selectedCards.includes(card.name);
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = cloudinary.url(card.imageFront);

  const cardVariants = {
    initial: {
      scale: 1,
      rotateY: 0,
      y: 0,
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    },
    hover: {
      scale: 1.05,
      y: -5,
      boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
    selected: {
      scale: 1.1,
      y: card.position?.top || 0,
      x: card.position?.left || 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    flipped: {
      rotateY: 180,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    shuffling: {
      x: card.position?.left || 0,
      y: card.position?.top || 0,
      rotate: card.position?.rotate || 0,
      scale: card.position?.scale || 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    fanned: {
      x: card.position?.left || 0,
      y: card.position?.top || 0,
      rotate: card.position?.rotate || 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15,
      },
    },
    resetting: {
      x: card.position?.left || 0,
      y: card.position?.top || 0,
      rotate: card.position?.rotate || 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      },
    },
  };

  return (
    <motion.div
      key={index}
      className={`card-${index + 1} w-[160px] h-[240px] perspective-[1000px] absolute rounded-lg overflow-hidden 
                ${!isShuffling && !isSelected ? 'cursor-pointer hover:z-50' : ''}`}
      style={{
        zIndex: isSelected ? card.zIndex : index,
        transformStyle: "preserve-3d",
        transformOrigin: "bottom center",
        position: "absolute",
        margin: isSelected ? "10px" : undefined,
      }}
      variants={cardVariants}
      initial="initial"
      animate={
        isShuffling
          ? "shuffling"
          : isSelected
          ? ["selected", card.isFlipped ? "flipped" : ""]
          : card.position?.top === 0 && card.position?.left === 0
          ? "resetting"
          : ["fanned", card.isFlipped ? "flipped" : ""]
      }
      whileHover={!isShuffling && !isSelected ? "hover" : undefined}
      onClick={() => !isShuffling && flipCard(index)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="card-back absolute w-full h-full bg-vintage-primary rounded-lg border-2 border-vintage-accent"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
        }}
        initial={{ rotateY: 0 }}
        animate={{
          opacity: card.isFlipped ? 0 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
      >
        <motion.img
          src="https://res.cloudinary.com/imt-media/image/upload/v1727514583/back-card.png"
          alt="back_card"
          className="w-full h-full object-cover"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
        />
      </motion.div>

      <AnimatePresence>
        {isHovered && !isShuffling && isSelected && card.isFlipped && (
          <motion.button
            className="absolute inset-0 flex items-center justify-center bg-vintage-primary/40 backdrop-blur-sm
                     transition-all duration-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              handleExplainTarotCard(index);
            }}
          >
            <motion.div
              className="bg-vintage-accent text-vintage-primary px-4 py-2 rounded-full 
                       font-cormorant text-base font-semibold shadow-vintage hover:shadow-vintage-hover
                       border border-vintage-gold"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Thông tin lá bài
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      <motion.div
        className="card-front absolute w-full h-full bg-vintage-light rounded-lg border-2 border-vintage-accent"
        initial={{ rotateY: 180 }}
        animate={{
          opacity: card.isFlipped ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
      >
        <motion.img
          src={imageUrl}
          alt={card.name}
          className="w-full h-full object-contain p-2"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-vintage-primary/80 to-transparent
                   p-2 text-vintage-light font-cormorant text-center text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {card.name}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Card;
