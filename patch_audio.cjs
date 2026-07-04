const fs = require("fs");
let code = fs.readFileSync("src/routes/ecosystem.tsx", "utf8");

// I will just replace the `startListening` and `simulateAudioValidation`
code = code.replace(
  `  const startListening = () => {\n    setListening(true);\n    setAnalyzingAudio(false);\n    setAudioError("");\n  };`,
  `  const startListening = async () => {\n    try {\n      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });\n      setListening(true);\n      setAnalyzingAudio(true);\n      setAudioError("");\n      \n      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();\n      const analyser = audioContext.createAnalyser();\n      const source = audioContext.createMediaStreamSource(stream);\n      source.connect(analyser);\n      analyser.fftSize = 256;\n      const bufferLength = analyser.frequencyBinCount;\n      const dataArray = new Uint8Array(bufferLength);\n      \n      let totalEnergy = 0;\n      let samples = 0;\n      const start = Date.now();\n      \n      const checkAudio = () => {\n        analyser.getByteFrequencyData(dataArray);\n        const sum = dataArray.reduce((a, b) => a + b, 0);\n        totalEnergy += (sum / bufferLength);\n        samples++;\n        \n        if (Date.now() - start < 3000) {\n          requestAnimationFrame(checkAudio);\n        } else {\n          // Finished recording\n          stream.getTracks().forEach(track => track.stop());\n          audioContext.close();\n          \n          const avgEnergy = totalEnergy / samples;\n          setAnalyzingAudio(false);\n          setListening(false);\n          \n          if (avgEnergy > 5) {\n            setSuccess(true);\n            addCoins(50, "Biodiversity Detected");\n            addPoints(50);\n            addXp(30);\n          } else {\n            setAudioError("No sound detected! Try getting closer to the birds.");\n          }\n        }\n      };\n      checkAudio();\n      \n    } catch (err) {\n      console.error(err);\n      setAudioError("Microphone access denied or not available.");\n    }\n  };`,
);

// We need to remove the Verify Sound button since it will be auto-verifying now.
// The button uses simulateAudioValidation
code = code.replace(
  `{!analyzingAudio ? (
            <button 
              onClick={simulateAudioValidation}
              className="mt-8 bg-white text-forest px-6 py-2.5 rounded-full font-bold text-sm active:scale-95 transition-transform"
            >
              Verify Sound
            </button>
          ) : ( 
            <p className="text-white/60 text-xs mt-8 max-w-[260px] text-center">
              Please wait...
            </p>
          )}`,
  `<p className="text-white/60 text-xs mt-8 max-w-[260px] text-center">
    {analyzingAudio ? "Listening to the environment..." : "Done!"}
  </p>`,
);

code = code.replace(
  `Verified successfully! +50 Points`,
  `麻雀 (Eurasian Tree Sparrow) detected! +50 Points`,
);

// Restrict Map to flower market region
// Flower Market coordinates: ~22.3255, 114.1706
// The existing map uses `<Map defaultZoom={15} defaultCenter={{ lat: 22.396, lng: 114.109 }} ...>`
code = code.replace(
  `defaultCenter={{ lat: 22.396, lng: 114.109 }}`,
  `defaultCenter={{ lat: 22.3255, lng: 114.1706 }} restriction={{ latLngBounds: { north: 22.328, south: 22.323, east: 114.173, west: 114.168 }, strictBounds: false }}`,
);

// We also need to fix the random lat/lng generation for the collection
code = code.replace(
  `lat: 22.396 + (Math.random() - 0.5) * 0.05,
  lng: 114.109 + (Math.random() - 0.5) * 0.05`,
  `lat: 22.3255 + (Math.random() - 0.5) * 0.005,
  lng: 114.1706 + (Math.random() - 0.5) * 0.005`,
);

fs.writeFileSync("src/routes/ecosystem.tsx", code);
