import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ValentinesPage() {
  const [noClicks, setNoClicks] = useState(0);
  const [noPosition, setNoPosition] = useState({ top: "60%", left: "55%" });
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (noClicks > 0) {
      moveNoButton();
    }
  }, [noClicks]);

  const moveNoButton = () => {
    const randomTop = Math.floor(Math.random() * 80);
    const randomLeft = Math.floor(Math.random() * 80);
    setNoPosition({
      top: `${randomTop}%`,
      left: `${randomLeft}%`,
    });
  };

  const handleNoClick = () => {
    if (noClicks < 6) {
      setNoClicks(noClicks + 1);
    }
  };

  const yesScale = 1 + noClicks * 0.5;
  const yesFullScreen = noClicks >= 6;

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-100 px-6">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-bold mb-6 text-pink-600">
            Thank You ❤️
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            You make life brighter, warmer, and so much more meaningful. 
            I’m grateful for every laugh, every moment, and every memory we create together. 
            I’m really lucky to have you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1518199266791-5375a83190b7"
        alt="Valentines"
        className="w-64 h-64 object-cover rounded-2xl shadow-xl mb-8"
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-pink-600 text-center">
        Will you be my Valentines?
      </h1>

      <motion.button
        onClick={() => setAccepted(true)}
        animate={{ scale: yesFullScreen ? 20 : yesScale }}
        transition={{ type: "spring", stiffness: 120 }}
        className={`px-8 py-4 bg-pink-500 text-white rounded-2xl shadow-lg text-lg font-semibold z-10 ${
          yesFullScreen ? "fixed inset-0 w-full h-full rounded-none" : ""
        }`}
      >
        Yes
      </motion.button>

      {!yesFullScreen && (
        <button
          onClick={handleNoClick}
          style={{ position: "absolute", ...noPosition }}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl shadow"
        >
          No
        </button>
      )}
    </div>
  );
}
