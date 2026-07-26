import confetti from "canvas-confetti";
import { toast } from "sonner";
import { gameSounds } from "./sounds";

export function triggerLevelUpConfetti(newLevel?: number) {
  // Play 8-bit retro synth Level Up sound effect
  gameSounds.play("levelUp");

  // Show celebratory toast notification
  if (newLevel) {
    toast.success(`🎉 LEVEL UP! Fahy reached Level ${newLevel}!`, {
      duration: 5000,
      description:
        "Your Fahy mascot has evolved! Check out new forms and accessories in the Sanctuary.",
    });
  }

  // Multi-stage celebratory confetti animation
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Primary burst from center bottom
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ["#10B981", "#3B82F6", "#F59E0B"],
  });
  fire(0.2, {
    spread: 60,
    colors: ["#EC4899", "#8B5CF6", "#10B981"],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ["#F59E0B", "#10B981", "#6366F1"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    colors: ["#EF4444", "#3B82F6", "#FBBC05"],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ["#10B981", "#F59E0B", "#8B5CF6"],
  });

  // Cannon streams from left and right corners
  const duration = 2000;
  const animationEnd = Date.now() + duration;

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 20 * (timeLeft / duration);

    confetti({
      particleCount,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      zIndex: 9999,
      colors: ["#10B981", "#F59E0B", "#3B82F6", "#EC4899"],
    });
    confetti({
      particleCount,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      zIndex: 9999,
      colors: ["#10B981", "#F59E0B", "#3B82F6", "#EC4899"],
    });
  }, 200);
}
