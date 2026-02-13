import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function App() {
  const [noClicks, setNoClicks] = useState(0);
  const [noPosition, setNoPosition] = useState({ top: "0%", left: "0%" });
  const [accepted, setAccepted] = useState(false);

  // No-button behavior
  const [noFreed, setNoFreed] = useState(false); // once true, No can move around
  const [noMode, setNoMode] = useState("move"); // 'shake' | 'move' | 'dodge'
  const [isShaking, setIsShaking] = useState(false);
  const noBtnRef = useRef(null);
  const lastDodgeRef = useRef(0); // throttle dodging

  // Emoji rain state
  const [drops, setDrops] = useState([]);
  const dropIdRef = useRef(0);

  // All praying emoji 🙏
  const EMOJIS = useMemo(() => ["🙏"], []);

  useEffect(() => {
    if (noClicks > 0 && noClicks < 6) {
      moveNoButton();
    }
  }, [noClicks]);

  // Soft dreamy — constant slow fall (home screen only)
  useEffect(() => {
    if (accepted) return;

    const spawn = () => {
      const id = ++dropIdRef.current;
      const emoji = EMOJIS[0];
      const left = Math.random() * 100; // vw
      const size = 26 + Math.random() * 28; // px
      const duration = 7 + Math.random() * 3; // constant but slow fall
      const drift = (Math.random() * 2 - 1) * 40; // very slight sideways drift
      const opacity = 0.6 + Math.random() * 0.4;

      setDrops((prev) => {
        const next = [
          ...prev,
          { id, emoji, left, size, duration, drift, opacity },
        ];
        return next.length > 120 ? next.slice(next.length - 120) : next;
      });

      window.setTimeout(() => {
        setDrops((prev) => prev.filter((d) => d.id !== id));
      }, Math.ceil(duration * 1000) + 200);
    };

    const t1 = window.setInterval(spawn, 260);
    return () => window.clearInterval(t1);
  }, [accepted, EMOJIS]);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const randomNoPos = () => {
    const top = clamp(Math.random() * 80, 8, 85);
    const left = clamp(Math.random() * 80, 8, 85);
    return { top: `${top}%`, left: `${left}%` };
  };

  const moveNoButton = () => {
    setNoPosition(randomNoPos());
  };

  const pickRandomMode = () => {
    // Random order each interaction, but no hover-triggered move
    const modes = ["shake", "move", "dodge"];
    const next = modes[Math.floor(Math.random() * modes.length)];
    setNoMode(next);

    if (next === "shake") {
      setIsShaking(true);
      window.setTimeout(() => setIsShaking(false), 450);
    }

    if (next === "move") {
      moveNoButton();
    }
  };

  const handleNoMouseMove = (e) => {
    if (!noFreed) return;
    if (noMode !== "dodge") return;

    const now = Date.now();
    if (now - lastDodgeRef.current < 700) return; // reduce frequency

    const el = noBtnRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);

    // Dodge only if cursor is very close
    if (dist < 90) {
      lastDodgeRef.current = now;
      moveNoButton();
    }
  };

  const handleNoClick = () => {
    if (!noFreed) setNoFreed(true);
    if (noClicks < 6) {
      setNoClicks((prev) => prev + 1);
    }
    pickRandomMode();
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

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
            You make life brighter and happier every single day. I’m grateful for
            you more than words can say.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-pink-50 relative overflow-hidden">
      {/* Emoji rain overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {drops.map((d) => (
          <span
            key={d.id}
            style={{
              position: "absolute",
              left: `${d.left}vw`,
              top: "-12vh",
              fontSize: `${d.size}px`,
              opacity: d.opacity,
              animation: `emojiFall ${d.duration}s linear forwards`,
              "--drift": `${d.drift}px`,
            }}
          >
            {d.emoji}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes emojiFall {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(var(--drift), 120vh, 0); }
        }
      `}</style>

      <div className="flex flex-col items-center justify-center text-center gap-8 z-10">
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
            <motion.button
              ref={noBtnRef}
              onClick={handleNoClick}
              onMouseMove={handleNoMouseMove}
              animate={{
                top: noFreed ? noPosition.top : undefined,
                left: noFreed ? noPosition.left : undefined,
                x: isShaking ? [0, -6, 6, -6, 6, 0] : 0,
                y: isShaking ? [0, 2, -2, 2, -2, 0] : 0,
              }}
              transition={{
                top: { type: "spring", stiffness: 140, damping: 14 },
                left: { type: "spring", stiffness: 140, damping: 14 },
                x: { duration: 0.45 },
                y: { duration: 0.45 },
              }}
              style={{
                position: noFreed ? "absolute" : "static",
              }}
              className="px-8 py-4 bg-black text-white rounded-2xl shadow-lg text-lg font-semibold"
            >
              No
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
