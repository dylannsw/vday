import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function App() {
  const [noClicks, setNoClicks] = useState(0);
  const [noPosition, setNoPosition] = useState({ top: "0%", left: "0%" });
  const [accepted, setAccepted] = useState(false);

  // Word-by-word typing for the Yes page message
  const fullYesMessage =
    "It would truly be my pleasure to celebrate Valentine’s Day with you. I look forward to spending a meaningful and memorable day together.";
  const [typedYesMessage, setTypedYesMessage] = useState("");

  // No-button behavior
  const [noFreed, setNoFreed] = useState(false);
  const [noMode, setNoMode] = useState("move");
  const [isShaking, setIsShaking] = useState(false);
  const noBtnRef = useRef(null);
  const lastDodgeRef = useRef(0);

  // Cursor tracking for eyes
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);

  // Emoji rain state
  const [drops, setDrops] = useState([]);
  const dropIdRef = useRef(0);

  // Home page emoji (praying)
  const HOME_EMOJIS = useMemo(() => ["🙏"], []);
  // Yes page emoji (hearts, fire, bomb)
  const YES_EMOJIS = useMemo(() => ["❤️", "💖", "💘", "🔥", "💥", "💣"], []);

  const panic = noClicks >= 4 && noClicks < 6;

  useEffect(() => {
    if (noClicks > 0 && noClicks < 6) moveNoButton();
  }, [noClicks]);

  useEffect(() => {
    const onMove = (e) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Word-by-word typing when entering the Yes page
  useEffect(() => {
    if (!accepted) {
      setTypedYesMessage("");
      return;
    }

    const words = fullYesMessage.split(/\s+/);
    let i = 0;
    setTypedYesMessage("");

    const t = window.setInterval(() => {
      i += 1;
      setTypedYesMessage(words.slice(0, i).join(" "));
      if (i >= words.length) window.clearInterval(t);
    }, 180);

    return () => window.clearInterval(t);
  }, [accepted]);

  // Emoji rain — active on BOTH pages now
  useEffect(() => {
    const EMOJIS = accepted ? YES_EMOJIS : HOME_EMOJIS;

    const spawn = () => {
      const id = ++dropIdRef.current;
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const left = Math.random() * 100;
      const size = 26 + Math.random() * 28;
      const duration = 7 + Math.random() * 3;
      const drift = (Math.random() * 2 - 1) * 40;
      const opacity = 0.6 + Math.random() * 0.4;

      setDrops((prev) => {
        const next = [...prev, { id, emoji, left, size, duration, drift, opacity }];
        return next.length > 160 ? next.slice(next.length - 160) : next;
      });

      window.setTimeout(() => {
        setDrops((prev) => prev.filter((d) => d.id !== id));
      }, Math.ceil(duration * 1000) + 200);
    };

    const t1 = window.setInterval(spawn, accepted ? 140 : 260);
    return () => window.clearInterval(t1);
  }, [accepted, HOME_EMOJIS, YES_EMOJIS]);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const randomNoPos = () => {
    const top = clamp(Math.random() * 80, 8, 85);
    const left = clamp(Math.random() * 80, 8, 85);
    return { top: `${top}%`, left: `${left}%` };
  };

  const moveNoButton = () => setNoPosition(randomNoPos());

  const pickRandomMode = () => {
    const modes = ["shake", "move", "dodge"];
    const next = modes[Math.floor(Math.random() * modes.length)];
    setNoMode(next);

    if (next === "shake") {
      setIsShaking(true);
      window.setTimeout(() => setIsShaking(false), 450);
    }
    if (next === "move") moveNoButton();
  };

  const handleNoMouseMove = (e) => {
    if (!noFreed || noMode !== "dodge") return;

    const now = Date.now();
    const cooldown = panic ? 450 : 700;
    if (now - lastDodgeRef.current < cooldown) return;

    const el = noBtnRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);

    const threshold = panic ? 105 : 85;
    if (dist < threshold) {
      lastDodgeRef.current = now;
      moveNoButton();
    }
  };

  const handleNoClick = () => {
    if (!noFreed) setNoFreed(true);
    if (noClicks < 6) setNoClicks((prev) => prev + 1);
    pickRandomMode();
  };

  const triggerConfetti = () => {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
  };

  const yesScale = Math.pow(1.6, noClicks);
  const yesFullScreen = noClicks >= 6;

  const xAnim = isShaking
    ? [0, -6, 6, -6, 6, 0]
    : panic
    ? [0, -1.5, 1.5, -1.5, 1.5, 0]
    : 0;
  const yAnim = isShaking
    ? [0, 2, -2, 2, -2, 0]
    : panic
    ? [0, 1, -1, 1, -1, 0]
    : 0;
  const shakeTransition = isShaking
    ? { duration: 0.45 }
    : panic
    ? { duration: 0.6, repeat: Infinity, repeatType: "loop" }
    : { duration: 0.3 };

  const pupilOffset = (eyeEl) => {
    if (!eyeEl) return { x: 0, y: 0 };
    const rect = eyeEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = cursor.x - cx;
    const dy = cursor.y - cy;
    const angle = Math.atan2(dy, dx);
    const max = rect.width * 0.22;
    return { x: Math.cos(angle) * max, y: Math.sin(angle) * max };
  };

  const leftPupil = pupilOffset(leftEyeRef.current);
  const rightPupil = pupilOffset(rightEyeRef.current);

  if (accepted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-pink-100 relative overflow-hidden">
        {/* Soft vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0)_40%,rgba(0,0,0,0.18)_100%)]" />

        {/* Gentle pink glow */}
        <div className="absolute inset-0 pointer-events-none animate-pulse bg-[radial-gradient(circle_at_center,rgba(255,182,193,0.35),rgba(255,182,193,0)_60%)]" />

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

        {/* KEYFRAMES needed on this page too */}
        <style>{`
          @keyframes emojiFall {
            0%   { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(var(--drift), 120vh, 0); }
          }
        `}</style>

        {/* Subtle sparkle particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-white opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `sparkle ${2 + Math.random() * 2}s ease-in-out infinite`,
              }}
            >
              ✨
            </span>
          ))}
        </div>

        <style>{`
          @keyframes sparkle {
            0%, 100% { transform: scale(0.6); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 1; }
          }
        `}</style>

        <div className="text-center max-w-xl px-6 z-10 backdrop-blur-[2px]">
          <h1 className="text-4xl font-bold mb-6 text-pink-600 drop-shadow-[0_3px_12px_rgba(0,0,0,0.35)]">
            Thank You ❤️
          </h1>
          <p className="text-lg text-gray-700 mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            {typedYesMessage || " "}
          </p>

          <a
            href="https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MjA3OWlzNWR2Y2FyYnA1czVwcDNwMmJiZW0gOWNlZmNlYWU2YTMzOTljOGNhYWU1MWRhNzIyYmRjNGI1N2Y2ZjE2ZDBkM2MwMmUzN2MxYzZhZmFiNDY2ZjAyNEBn&tmsrc=9cefceae6a3399c8caae51da722bdc4b57f6f16d0d3c02e37c1c6afab466f024%40group.calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-pink-500 text-white rounded-2xl shadow-lg text-lg font-semibold hover:bg-pink-600 transition"
          >📅 Add to Calendar</a>
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
        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.15); }
        }
      `}</style>

      <div className="flex flex-col items-center justify-center text-center gap-8 z-10">
        <img
          src="/Frame183.png"
          alt="Valentine"
          className="w-56 h-56 object-cover rounded-2xl shadow-xl"
        />

        <h1 className="text-3xl md:text-4xl font-bold text-pink-600">
          Dear Yee Xuean Ng. Would you be my Valentine?
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
                x: xAnim,
                y: yAnim,
              }}
              transition={{
                top: { type: "spring", stiffness: 140, damping: 14 },
                left: { type: "spring", stiffness: 140, damping: 14 },
                x: shakeTransition,
                y: shakeTransition,
              }}
              style={{ position: noFreed ? "absolute" : "static" }}
              className="relative overflow-hidden px-8 py-4 bg-black text-white rounded-2xl shadow-lg text-lg font-semibold"
            >
              {/* Eyes */}
              <span
                aria-hidden
                className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1"
              >
                <span
                  ref={leftEyeRef}
                  className="relative w-3 h-3 bg-white rounded-full overflow-hidden"
                  style={{ animation: "blink 4.2s infinite" }}
                >
                  <span
                    className="absolute w-1.5 h-1.5 bg-black rounded-full"
                    style={{
                      left: `calc(50% + ${leftPupil.x}px)`,
                      top: `calc(50% + ${leftPupil.y}px)`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </span>
                <span
                  ref={rightEyeRef}
                  className="relative w-3 h-3 bg-white rounded-full overflow-hidden"
                  style={{ animation: "blink 4.2s infinite 0.2s" }}
                >
                  <span
                    className="absolute w-1.5 h-1.5 bg-black rounded-full"
                    style={{
                      left: `calc(50% + ${rightPupil.x}px)`,
                      top: `calc(50% + ${rightPupil.y}px)`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </span>
              </span>

              <span className="inline-block pl-5">No</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
