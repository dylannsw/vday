import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function App() {
  const [noClicks, setNoClicks] = useState(0);
  const [noPosition, setNoPosition] = useState({ top: "0%", left: "0%" });
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (noClicks > 0 && noClicks < 6) {
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
      setNoClicks((prev) => prev + 1);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  // Increase growth per click (exponential instead of linear)
  const yesScale = Math.pow(1.6, noClicks);
  const yesFullScreen = noClicks >= 6;

  if (accepted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-pink-100">
        <div className="text-center max-w-xl px-6">
          <h1 className="text-4xl font-bold mb-6 text-pink-600">
            Thank You ❤️
          </h1>
          <p className="text-lg text-gray-700">
            Thank you for saying yes. It would truly be my pleasure to celebrate Valentine’s Day with you. I look forward to spending a meaningful and memorable day together.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-pink-50 relative overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center gap-8">
        <img
          src="src="/Frame 183.jpg""
          alt="Valentine"
          className="w-56 h-56 object-cover rounded-2xl shadow-xl"
        />

        <h1 className="text-3xl md:text-4xl font-bold text-pink-600">
          Will you be my Valentines?
        </h1>

        <div className="flex gap-6 items-center justify-center">
          <motion.button
            onClick={() => {
              triggerConfetti();
              setAccepted(true);
            }}
            animate={{ scale: yesFullScreen ? 20 : yesScale }}
            transition={{ type: "spring", stiffness: 120 }}
            className={`px-8 py-4 bg-pink-500 text-white rounded-2xl shadow-lg text-lg font-semibold ${
              yesFullScreen ? "fixed inset-0 w-full h-full rounded-none" : ""
            }`}
          >
            Yes
          </motion.button>

          {!yesFullScreen && (
            <button
              onClick={handleNoClick}
              style={{
                position: noClicks === 0 ? "static" : "absolute",
                top: noPosition.top,
                left: noPosition.left,
              }}
              className="px-8 py-4 bg-black text-white rounded-2xl shadow-lg text-lg font-semibold"
            >
              No
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
