import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import "@fontsource/playfair-display";
import "@fontsource/cormorant-garamond";
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
  const [inputValue, setInputValue] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [floatingCards, setFloatingCards] = useState<{ x: number; y: number; rotate: number }[]>([
    { x: -120, y: -80, rotate: -15 },
    { x: 120, y: -40, rotate: 15 },
    { x: -80, y: 60, rotate: 10 },
    { x: 80, y: 80, rotate: -10 },
  ]);
  const [score, setScore] = useState(0);

  const fetchResult = async (
    cardNames: string[],
    hints: { value: HintType; label: string }[],
    other: string
  ) => {
    setIsAnalyzing(true);
    setLoading(true);
    const result = await cardTalkAboutYou(cardNames, hints, other);
    setResult(result);
    setLoading(false);
    setIsAnalyzing(false);
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

  const handleCardClick = (index: number) => {
    setScore(prev => prev + 1);
    setFloatingCards(prev => {
      const newCards = [...prev];
      newCards[index] = {
        x: Math.random() * 240 - 120,
        y: Math.random() * 160 - 80,
        rotate: Math.random() * 30 - 15
      };
      return newCards;
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-vintage-dark bg-vintage-pattern"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <motion.header 
        className="p-6 bg-vintage-primary border-b-2 border-vintage-accent"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="font-playfair text-3xl font-bold text-vintage-light text-center">
          Tarot Reader
        </h1>
      </motion.header>

      <main className="px-5 py-8 flex justify-center items-center flex-col">
        <DrawCardAnimation
          getIsShuffling={handleGetIsShuffling}
          getCardNames={getCardNames}
          getIsFlipped={handleGetIsFlipped}
        />
      </main>

      <AnimatePresence>
        {names.length > 0 && isFlipped && (
          <motion.div
            className="fixed bottom-0 left-0 w-full px-5 py-6 bg-vintage-primary border-t-2 border-vintage-accent rounded-t-2xl shadow-vintage"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex flex-col gap-4">
              <motion.p 
                className="text-vintage-light font-cormorant text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Chọn gợi ý:
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {hintOptions
                  .filter((option) => option.value !== "other")
                  .map((option, index) => (
                    <motion.button
                      key={option.value}
                      onClick={() => {
                        setOptionSelected((prev) => {
                          if (prev?.some((opt) => opt.value === option.value)) {
                            return prev.filter((opt) => opt.value !== option.value);
                          }
                          return [...prev, option];
                        });
                      }}
                      className={`px-4 py-2 rounded-full font-cormorant text-base border-2 
                        ${optionSelected?.some((opt) => opt.value === option.value)
                          ? "bg-vintage-accent text-vintage-primary border-vintage-gold"
                          : "bg-transparent text-vintage-light border-vintage-accent"} 
                        transition-all duration-300 hover:shadow-vintage-hover`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {option.label}
                    </motion.button>
                  ))}
              </motion.div>

              <motion.div 
                className="flex items-center gap-2 bg-vintage-dark/50 rounded-full border-2 border-vintage-accent p-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Bạn muốn biết thêm về gì?"
                  className="flex-grow bg-transparent text-vintage-light font-cormorant text-lg px-4 outline-none placeholder-vintage-light/50"
                  maxLength={100}
                />
                <div className="flex items-center gap-2">
                  <span className="text-vintage-light/70 font-cormorant">
                    {inputValue.length}/100
                  </span>
                  <motion.button
                    className="bg-vintage-accent text-vintage-primary rounded-full w-10 h-10 flex items-center justify-center
                             shadow-vintage hover:shadow-vintage-hover"
                    onClick={() => fetchResult(names, optionSelected, inputValue)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-xl">➤</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            className="fixed inset-0 bg-vintage-dark/95 px-5 py-11 z-[99999] overflow-hidden flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="text-center relative w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {floatingCards.map((card, index) => (
                <motion.div
                  key={index}
                  className="absolute left-1/2 top-1/2 w-16 h-24 bg-vintage-accent/20 rounded-lg border-2 border-vintage-accent cursor-pointer"
                  initial={{ x: 0, y: 0, rotate: 0 }}
                  animate={{
                    x: card.x,
                    y: card.y,
                    rotate: card.rotate,
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCardClick(index)}
                >
                  <motion.div
                    className="w-full h-full bg-vintage-pattern rounded-lg opacity-50"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      transition: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
                  />
                </motion.div>
              ))}

              <motion.div
                className="w-16 h-16 border-4 border-vintage-accent border-t-transparent rounded-full mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.h2 
                className="font-playfair text-2xl font-bold text-vintage-light mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Đang phân tích...
              </motion.h2>
              <motion.p 
                className="font-cormorant text-lg text-vintage-light/80 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Xin vui lòng đợi trong giây lát
              </motion.p>
              <motion.p
                className="font-cormorant text-lg text-vintage-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Chạm vào các lá bài để thu thập năng lượng: {score}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && isExplain && !isAnalyzing && (
          <motion.div
            className="fixed inset-0 bg-vintage-dark/95 px-5 py-11 z-[999999] overflow-hidden"
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
                Kết quả bài Tarot của bạn
              </h2>
              
              <motion.div 
                className="bg-vintage-primary/80 rounded-2xl p-6 border-2 border-vintage-accent shadow-vintage"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="space-y-6">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-playfair text-xl text-vintage-accent mb-2">
                      Phân tích
                    </h3>
                    <p className="font-cormorant text-lg text-vintage-light">
                      {result.analysis}
                    </p>
                  </motion.div>

                  {optionSelected.map((option, index) => (
                    <motion.div
                      key={option.value}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <h3 className="font-playfair text-xl text-vintage-accent mb-2">
                        {option.label}
                      </h3>
                      <p className="font-cormorant text-lg text-vintage-light">
                        {result[option.value]}
                      </p>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + optionSelected.length * 0.1 }}
                  >
                    <h3 className="font-playfair text-xl text-vintage-accent mb-2">
                      Điều bạn muốn biết thêm
                    </h3>
                    <p className="font-cormorant text-lg text-vintage-light">
                      {result.other}
                    </p>
                  </motion.div>
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
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;
