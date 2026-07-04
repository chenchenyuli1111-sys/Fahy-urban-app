const fs = require("fs");
let code = fs.readFileSync("src/routes/report.tsx", "utf8");

code = code.replace(
  `import { Camera, MapPin, Trash2, Sprout, AlertTriangle, Check, XCircle } from "lucide-react";`,
  `import { Camera, MapPin, Trash2, Sprout, AlertTriangle, Check, XCircle } from "lucide-react";\nimport { useEffect } from "react";\nimport { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";\nimport { ref, uploadBytes, getDownloadURL } from "firebase/storage";\nimport { db, storage } from "@/lib/firebase";\nimport { useAuth } from "@/lib/AuthContext";`,
);

// We need to change the function Report() to fetch real reports and handle upload
code = code.replace(
  `function Report() {`,
  `function Report() {\n  const { user } = useAuth();\n  const [reports, setReports] = useState<any[]>([]);\n  const [uploading, setUploading] = useState(false);\n\n  useEffect(() => {\n    const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));\n    return onSnapshot(q, (snap) => {\n      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));\n    });\n  }, []);`,
);

code = code.replace(
  `  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate the time the photo was taken (must be within last 5 minutes to prevent cheating)
    const now = Date.now();
    const timeDiff = now - file.lastModified;
    
    // 5 minutes in milliseconds
    const FIVE_MINUTES = 5 * 60 * 1000;
    
    if (timeDiff > FIVE_MINUTES) {
      setErrorMsg("Image rejected: Photo must be taken live to prevent cheating.");
      setSubmitted(false);
    } else {
      setErrorMsg("");
      setSubmitted(true);
      addCoins(5);
      addXp(20);
    }
  };`,
  `  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const now = Date.now();
    const timeDiff = now - file.lastModified;
    const FIVE_MINUTES = 5 * 60 * 1000;
    
    if (timeDiff > FIVE_MINUTES) {
      setErrorMsg("Image rejected: Photo must be taken live to prevent cheating.");
      setSubmitted(false);
      return;
    }
    
    setUploading(true);
    try {
      const storageRef = ref(storage, \`reports/\${user.uid}_\${Date.now()}\`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await addDoc(collection(db, "reports"), {
        userId: user.uid,
        imageUrl: url,
        status: "pending",
        timestamp: serverTimestamp(),
        lat: 22.3255 + (Math.random() - 0.5) * 0.005,
        lng: 114.1706 + (Math.random() - 0.5) * 0.005
      });
      
      setErrorMsg("");
      setSubmitted(true);
      // Removed immediate coin reward, it stays pending until verification.
    } catch (err) {
      setErrorMsg("Failed to upload report.");
    } finally {
      setUploading(false);
    }
  };`,
);

// Map over real reports instead of `recent`.
code = code.replace(
  `{recent.map((r, i) => (
            <div key={i} className="flex justify-between items-center bg-forest/5 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${r.restored ? 'bg-sage/30 text-sage-deep' : 'bg-fahy-yellow/30 text-fahy-yellow'}\`}>
                  <r.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-forest leading-tight">{k(r.kindKey)}</p>
                  <p className="text-[10px] text-forest/50">{k(r.whereKey)}</p>
                </div>
              </div>
              {r.restored ? (
                <span className="bg-sage/20 text-sage-deep text-[10px] px-2 py-0.5 rounded-full font-bold">Restored</span>
              ) : (
                <span className="bg-peach/20 text-peach text-[10px] px-2 py-0.5 rounded-full font-bold">Pending</span>
              )}
            </div>
          ))}`,
  `{reports.length === 0 && <p className="text-center text-xs text-forest/50">No recent reports</p>}
          {reports.map((r, i) => (
            <div key={r.id || i} className="flex justify-between items-center bg-forest/5 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={\`w-10 h-10 overflow-hidden rounded-full flex items-center justify-center \${r.status === 'verified' ? 'bg-sage/30 text-sage-deep' : 'bg-fahy-yellow/30 text-fahy-yellow'}\`}>
                  {r.imageUrl ? <img src={r.imageUrl} className="w-full h-full object-cover" /> : <Camera className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-sm text-forest leading-tight">Reported Issue</p>
                  <p className="text-[10px] text-forest/50">{r.timestamp?.toDate().toLocaleString() || 'Just now'}</p>
                </div>
              </div>
              {r.status === 'verified' ? (
                <span className="bg-sage/20 text-sage-deep text-[10px] px-2 py-0.5 rounded-full font-bold">Verified</span>
              ) : (
                <span className="bg-peach/20 text-peach text-[10px] px-2 py-0.5 rounded-full font-bold">Pending</span>
              )}
            </div>
          ))}`,
);

// We need to also map the real reports on the map!
code = code.replace(
  `{recent.map((r, i) => (
                <AdvancedMarker key={i} position={{ lat: r.lat, lng: r.lng }}>
                  <Pin background={r.restored ? '#8DAA91' : '#E6A382'} borderColor="#223E30" glyphColor="#223E30" />
                </AdvancedMarker>
              ))}`,
  `{reports.map((r, i) => (
                r.lat && r.lng ? (
                <AdvancedMarker key={r.id || i} position={{ lat: r.lat, lng: r.lng }}>
                  <Pin background={r.status === 'verified' ? '#8DAA91' : '#E6A382'} borderColor="#223E30" glyphColor="#223E30" />
                </AdvancedMarker>
                ) : null
              ))}`,
);

// Map restriction for flower market
code = code.replace(
  `defaultCenter={{ lat: 22.325, lng: 114.172 }}`,
  `defaultCenter={{ lat: 22.3255, lng: 114.1706 }} restriction={{ latLngBounds: { north: 22.328, south: 22.323, east: 114.173, west: 114.168 }, strictBounds: false }}`,
);

// Show "Uploading..." on the button
code = code.replace(
  `Take Photo to Report`,
  `{uploading ? "Uploading..." : "Take Photo to Report"}`,
);

fs.writeFileSync("src/routes/report.tsx", code);
