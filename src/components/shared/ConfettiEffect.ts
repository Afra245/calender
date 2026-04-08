import confetti from "canvas-confetti";

export const triggerConfetti = (originY = 0.6) => {
  if (typeof window === "undefined") return;

  const duration = 2500;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000, disableForReducedMotion: true };

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() - 0.2, y: Math.random() - 0.2 + originY } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random() + 0.2, y: Math.random() - 0.2 + originY } }));
  }, 250);
};

export const triggerSingleConfetti = () => {
   if (typeof window === "undefined") return;
   confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 1000
   });
};
