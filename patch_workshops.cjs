const fs = require("fs");
let code = fs.readFileSync("src/routes/workshops.tsx", "utf8");
code = code.replace(
  `import { useState } from "react";`,
  `import { useState, useEffect } from "react";\nimport { collection, doc, getDocs, setDoc, updateDoc, onSnapshot } from "firebase/firestore";\nimport { db } from "@/lib/firebase";\nimport { useAuth } from "@/lib/AuthContext";`,
);
code = code.replace(`const WORKSHOPS = [`, `const INITIAL_WORKSHOPS = [`);
code = code.replace(
  `function Workshops() {`,
  `function Workshops() {\n  const { user } = useAuth();\n  const [loading, setLoading] = useState(true);`,
);
code = code.replace(
  `const [workshops, setWorkshops] = useState(WORKSHOPS);`,
  `const [workshops, setWorkshops] = useState<any[]>([]);\n\n  useEffect(() => {\n    const unsub = onSnapshot(collection(db, "workshops"), (snap) => {\n      if (snap.empty) {\n        INITIAL_WORKSHOPS.forEach(w => setDoc(doc(db, "workshops", String(w.id)), w));\n      } else {\n        setWorkshops(snap.docs.map(d => d.data() as any));\n      }\n      setLoading(false);\n    });\n    return unsub;\n  }, []);`,
);
code = code.replace(
  `const handleEnroll = (id: number) => {\n    setWorkshops(prev => prev.map(w => w.id === id ? { ...w, enrolled: true } : w));\n    setShowModal(true);\n  };`,
  `const handleEnroll = async (id: number, reward: number) => {\n    if (!user) return;\n    const workshopRef = doc(db, "workshops", String(id));\n    const w = workshops.find(x => x.id === id);\n    if (w && w.spots > 0) {\n      await updateDoc(workshopRef, { spots: w.spots - 1, enrolled: true });\n      await addCoins(reward, "Workshop Enrollment");\n      setShowModal(true);\n    }\n  };`,
);
code = code.replace(
  `onClick={() => handleEnroll(w.id)}`,
  `onClick={() => handleEnroll(w.id, w.reward)}`,
);
code = code.replace(
  `<section className="px-5 mt-4 space-y-4 pb-8">`,
  `<section className="px-5 mt-4 space-y-4 pb-8">\n        {loading && <p className="text-center text-xs text-forest/50">Loading...</p>}`,
);
fs.writeFileSync("src/routes/workshops.tsx", code);
