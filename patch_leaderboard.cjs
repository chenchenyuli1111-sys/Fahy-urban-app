const fs = require("fs");
let code = fs.readFileSync("src/routes/leaderboard.tsx", "utf8");
code = code.replace(
  `// If not enough users, pad with some demo data`,
  `        // Find user if not in top 10\n        if (user && !fetchedUsers.some(u => u.isMe)) {\n           const userDoc = await getDocs(query(usersRef, orderBy(sortBy, "desc")));\n           const userIndex = userDoc.docs.findIndex(d => d.id === user.uid);\n           if (userIndex !== -1) {\n             const data = userDoc.docs[userIndex].data();\n             fetchedUsers.push({\n               rank: userIndex + 1,\n               name: data.username || "Anonymous",\n               score: sortBy === "points" ? (data.points || 0) : (data.level || 1),\n               level: data.level || 1,\n               isMe: true,\n               photoURL: data.photoURL\n             });\n           }\n        }\n        // If not enough users, pad with some demo data`,
);
fs.writeFileSync("src/routes/leaderboard.tsx", code);
