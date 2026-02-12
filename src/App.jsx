import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

  const yesScale = 1 + noClicks * 0.4;
  const yesFullScreen = noClicks >= 6;

  if (accepted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-pink-100">
        <div className="text-center max-w-xl px-6">
          <h1 className="text-4xl font-bold mb-6 text-pink-600">
            Thank You ❤️
          </h1>
          <p className="text-lg text-gray-700">
            You make life brighter and happier every single day. 
            I’m grateful for you more than words can say.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-pink-50 relative overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center gap-8">
        <img
          src="https://images.unsplash.com/photo-1518199266791-5375a83190b7"
          alt="Valentine"
          className="w-56 h-56 object-cover rounded-2xl shadow-xl"
        />

        <h1 className="text-3xl md:text-4xl font-bold text-pink-600">
          Will you be my Valentines?
        </h1>

        <div className="flex gap-6 items-center justify-center">
          <motion.button
            onClick={() => setAccepted(true)}
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
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl shadow"
            >
              No
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
