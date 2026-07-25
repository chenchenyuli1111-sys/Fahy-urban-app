// Retro 8-bit Game Sound Synthesizer using Web Audio API
// Fully safe, lazily initialized, and respects mute settings.

let audioCtx: AudioContext | null = null;
let isMuted = false;

// Initialize Audio Context on first user click
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // Standard and vendor prefixed versions
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export const gameSounds = {
  getMute(): boolean {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("fahy_sound_muted") === "true";
    }
    return isMuted;
  },

  setMute(muted: boolean) {
    isMuted = muted;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("fahy_sound_muted", String(muted));
    }
  },

  toggleMute(): boolean {
    const next = !this.getMute();
    this.setMute(next);
    this.play("click");
    return next;
  },

  play(
    type:
      | "click"
      | "coin"
      | "levelUp"
      | "water"
      | "eat"
      | "shake"
      | "success"
      | "fail",
  ) {
    if (this.getMute()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      switch (type) {
        case "click": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case "coin": {
          // Double note arpeggio
          [0, 0.08].forEach((delay, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            const freq = idx === 0 ? 987.77 : 1318.51; // B5 -> E6
            osc.frequency.setValueAtTime(freq, now + delay);

            gain.gain.setValueAtTime(0.06, now + delay);
            gain.gain.linearRampToValueAtTime(0.001, now + delay + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.16);
          });
          break;
        }

        case "levelUp": {
          // Joyful ascending scale
          const scale = [
            523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5,
          ]; // C5 to C6
          scale.forEach((freq, idx) => {
            const delay = idx * 0.08;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + delay);

            gain.gain.setValueAtTime(0.08, now + delay);
            gain.gain.linearRampToValueAtTime(0.001, now + delay + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.13);
          });
          break;
        }

        case "water": {
          // Bubbling splash sound
          for (let i = 0; i < 5; i++) {
            const delay = i * 0.06;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(
              300 + Math.random() * 600,
              now + delay,
            );
            osc.frequency.exponentialRampToValueAtTime(100, now + delay + 0.1);

            gain.gain.setValueAtTime(0.05, now + delay);
            gain.gain.linearRampToValueAtTime(0.001, now + delay + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.11);
          }
          break;
        }

        case "eat": {
          // Cute chewing crunch sounds
          [0, 0.12, 0.24].forEach((delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(150 + Math.random() * 50, now + delay);
            osc.frequency.exponentialRampToValueAtTime(50, now + delay + 0.08);

            gain.gain.setValueAtTime(0.12, now + delay);
            gain.gain.linearRampToValueAtTime(0.001, now + delay + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.09);
          });
          break;
        }

        case "shake": {
          // Rattle effect
          [0, 0.07, 0.14, 0.21, 0.28].forEach((delay) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(
              100 + Math.random() * 100,
              now + delay,
            );

            gain.gain.setValueAtTime(0.04, now + delay);
            gain.gain.linearRampToValueAtTime(0.001, now + delay + 0.05);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.06);
          });
          break;
        }

        case "success": {
          // Bright positive chord
          [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.4);

            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.45);
          });
          break;
        }

        case "fail": {
          // Sad slide-down beep
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(80, now + 0.35);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }
      }
    } catch (e) {
      console.warn("Sound play failed", e);
    }
  },
};
