const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBgyo15EhuQ1KmpaNfPhxFXvt9365CLoDQ",
  authDomain: "urban-planner-494613.firebaseapp.com",
  projectId: "urban-planner-494613",
  storageBucket: "urban-planner-494613.firebasestorage.app",
  messagingSenderId: "825806542142",
  appId: "1:825806542142:web:f0d21bb934850cb2fa486f",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(
  app,
  "ai-studio-fahyurbanpulse-cc7f8170-5d4a-41bc-a181-be141cf6351a",
);

const WORKSHOPS = [
  {
    id: "1",
    title: "Plastic Bottle Planters",
    org: "Eco-Art HK",
    category: "Upcycling Art",
    date: "Sat, Oct 14 • 2:00 PM",
    location: "Fa Hui Park Community Center",
    spots: 5,
    reward: 50,
  },
  {
    id: "2",
    title: "Urban Composting 101",
    org: "Green Neighbors",
    category: "Gardening",
    date: "Sun, Oct 15 • 10:00 AM",
    location: "Community Garden West",
    spots: 12,
    reward: 30,
  },
  {
    id: "3",
    title: "Local Flora Identification",
    org: "Nature Watchers",
    category: "Education",
    date: "Sat, Oct 21 • 9:00 AM",
    location: "Fa Hui Park Trailhead",
    spots: 20,
    reward: 40,
  },
];

async function seed() {
  for (const w of WORKSHOPS) {
    await setDoc(doc(db, "workshops", w.id), w);
  }
  console.log("Seeded workshops");
  process.exit(0);
}
seed();
