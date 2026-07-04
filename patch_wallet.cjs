const fs = require("fs");
let code = fs.readFileSync("src/routes/wallet.tsx", "utf8");
code = code.replace(
  `import { useAppState } from "@/lib/AppState";`,
  `import { useAppState } from "@/lib/AppState";\nimport { useState, useEffect } from "react";\nimport { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";\nimport { db } from "@/lib/firebase";\nimport { useAuth } from "@/lib/AuthContext";`,
);
code = code.replace(
  `function Wallet() {`,
  `function Wallet() {\n  const { user } = useAuth();\n  const [transactions, setTransactions] = useState<any[]>([]);\n  useEffect(() => {\n    if (!user) return;\n    const q = query(collection(db, "users", user.uid, "transactions"), orderBy("timestamp", "desc"), limit(5));\n    return onSnapshot(q, (snapshot) => {\n      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));\n    });\n  }, [user]);`,
);
code = code.replace(
  `const success = await deductCoins(cost);`,
  `const success = await deductCoins(cost, k(r.key));`,
);
code = code.replace(
  `<div className="mt-8">\n        <CoCreatorStrip />\n      </div>`,
  `      <section className="px-5 mt-8">\n        <h2 className="font-display font-bold text-lg leading-none mb-4">Transaction History</h2>\n        <div className="bg-white border border-black/5 rounded-3xl p-5 shadow-xs">\n          {transactions.length === 0 ? (\n            <p className="text-xs text-forest/50 text-center">No transactions yet</p>\n          ) : (\n            <div className="space-y-4">\n              {transactions.map(tx => (\n                <div key={tx.id} className="flex justify-between items-center">\n                  <div>\n                    <p className="font-bold text-sm">{tx.reason}</p>\n                    <p className="text-[10px] text-forest/50">{tx.timestamp?.toDate().toLocaleString() || 'Just now'}</p>\n                  </div>\n                  <p className={\`font-bold \${tx.amount > 0 ? 'text-sage-deep' : 'text-peach'}\`}>\n                    {tx.amount > 0 ? '+' : ''}{tx.amount}\n                  </p>\n                </div>\n              ))}\n            </div>\n          )}\n        </div>\n      </section>\n      <div className="mt-8">\n        <CoCreatorStrip />\n      </div>`,
);
fs.writeFileSync("src/routes/wallet.tsx", code);
