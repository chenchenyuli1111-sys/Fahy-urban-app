const fs = require("fs");
let code = fs.readFileSync("src/routes/culture.tsx", "utf8");
code = code.replace(
  `import { MapPin, Play, Lock, ScanLine, XCircle, Check } from "lucide-react";`,
  `import { MapPin, Play, Lock, ScanLine, XCircle, Check, Shield } from "lucide-react";\nimport { doc, updateDoc, onSnapshot, getDoc, arrayUnion } from "firebase/firestore";\nimport { db } from "@/lib/firebase";\nimport { useAuth } from "@/lib/AuthContext";\nimport { useEffect } from "react";`,
);
code = code.replace(
  `unlocked: (catIndex === 0 && levelIndex < 3) || (catIndex === 1 && levelIndex < 2) || (catIndex === 2 && levelIndex < 1),`,
  `unlocked: false,`,
);
code = code.replace(
  `function Culture() {`,
  `function Culture() {\n  const { user } = useAuth();\n  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);\n  const [equippedBadge, setEquippedBadge] = useState<string>("");\n  \n  useEffect(() => {\n    if (!user) return;\n    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {\n      if (snap.exists()) {\n        const data = snap.data();\n        setUnlockedBadges(data.badges || []);\n        setEquippedBadge(data.equippedBadge || "");\n      }\n    });\n    return unsub;\n  }, [user]);\n  \n  const handleEquip = async (key: string) => {\n    if (!user) return;\n    await updateDoc(doc(db, "users", user.uid), { equippedBadge: key });\n  };`,
);
code = code.replace(
  `const [activeBadge, setActiveBadge] = useState<typeof badges[0] | null>(null);`,
  `const [activeBadge, setActiveBadge] = useState<typeof badges[0] | null>(null);`,
);
// replace unlocked reference in the badges map loop in the render:
code = code.replace(
  `const unlocked = badge.unlocked;`,
  `const unlocked = unlockedBadges.includes(badge.key);`,
);
// In the modal, add "Equip" button if it's unlocked:
code = code.replace(
  `<div className="mt-8 flex justify-center">\n                {activeBadge.unlocked ? (`,
  `<div className="mt-8 flex justify-center flex-col gap-2">\n                {unlockedBadges.includes(activeBadge.key) ? (\n                  <>\n                    <button className="bg-sage text-forest font-bold py-3 px-8 rounded-full shadow-md flex items-center gap-2 active:scale-95 transition-transform">\n                      <Play className="w-4 h-4 fill-forest" /> Play Oral History\n                    </button>\n                    <button onClick={() => handleEquip(activeBadge.key)} className="bg-peach/20 border border-peach/50 text-forest font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform">\n                      <Shield className="w-4 h-4" /> {equippedBadge === activeBadge.key ? "Equipped" : "Equip Badge"}\n                    </button>\n                  </>\n                ) : (`,
);
code = code.replace(
  `</button>\n                ) : (\n                  <div className="flex items-center gap-2 text-forest/40">\n                    <Lock className="w-4 h-4" />\n                    <span className="text-sm font-bold">Locked</span>\n                  </div>\n                )}\n              </div>`,
  `</button>\n                )}\n              </div>`,
);
fs.writeFileSync("src/routes/culture.tsx", code);
