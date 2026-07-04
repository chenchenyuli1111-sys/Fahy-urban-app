const fs = require("fs");
let code = fs.readFileSync("src/routes/culture.tsx", "utf8");
code = code.replace(
  `</button>\n                )}\n              </div>`,
  `</button>\n                  </>\n                ) : (\n                  <div className="flex items-center gap-2 text-forest/40">\n                    <Lock className="w-4 h-4" />\n                    <span className="text-sm font-bold">Locked</span>\n                  </div>\n                )}\n              </div>`,
);
fs.writeFileSync("src/routes/culture.tsx", code);
