
const express = require("express");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let player = {
  name: "Explorer",
  fuel: 100,
  xp: 0,
  credits: 500,
  rank: "Cadet",
  currentLocation: "Earth"
};

const planets = [
  {
    id: 1,
    name: "Mercury",
    fuelCost: 5,
    xpReward: 50,
    threatLevel: "Low",
    description: "Closest planet to the Sun"
  },
  {
    id: 2,
    name: "Venus",
    fuelCost: 8,
    xpReward: 75,
    threatLevel: "Medium",
    description: "Hottest planet in the Solar System"
  },
  {
    id: 3,
    name: "Earth",
    fuelCost: 0,
    xpReward: 100,
    threatLevel: "Safe",
    description: "Our home planet"
  },
  {
    id: 4,
    name: "Mars",
    fuelCost: 10,
    xpReward: 150,
    threatLevel: "Medium",
    description: "The Red Planet"
  },
  {
    id: 5,
    name: "Jupiter",
    fuelCost: 20,
    xpReward: 250,
    threatLevel: "High",
    description: "Largest planet"
  },
  {
    id: 6,
    name: "Saturn",
    fuelCost: 30,
    xpReward: 400,
    threatLevel: "High",
    description: "Famous for its rings"
  },
  {
    id: 7,
    name: "Uranus",
    fuelCost: 45,
    xpReward: 600,
    threatLevel: "Extreme",
    description: "Ice giant"
  },
  {
    id: 8,
    name: "Neptune",
    fuelCost: 50,
    xpReward: 700,
    threatLevel: "Extreme",
    description: "Deep blue world"
  }
];

const missions = [
  {
    id: 1,
    title: "Solar Heat Scan",
    location: "Mercury",
    reward: 100
  },
  {
    id: 2,
    title: "Atmosphere Analysis",
    location: "Venus",
    reward: 150
  },
  {
    id: 3,
    title: "Launch Preparation",
    location: "Earth",
    reward: 200
  },
  {
    id: 4,
    title: "Search For Water",
    location: "Mars",
    reward: 300
  },
  {
    id: 5,
    title: "Great Red Spot Study",
    location: "Jupiter",
    reward: 450
  },
  {
    id: 6,
    title: "Ring Mapping Mission",
    location: "Saturn",
    reward: 600
  },
  {
    id: 7,
    title: "Ice Giant Research",
    location: "Uranus",
    reward: 800
  },
  {
    id: 8,
    title: "Deep Space Signal Detection",
    location: "Neptune",
    reward: 1000
  }
];

const discoveries = [
  {
    title: "Alien Signal",
    reward: 100
  },
  {
    title: "Rare Crystal Deposit",
    reward: 200
  },
  {
    title: "Ancient Artifact",
    reward: 300
  },
  {
    title: "Unknown Energy Source",
    reward: 400
  }
];

function updateRank() {
  if (player.xp >= 3000) {
    player.rank = "Galaxy Commander";
  } else if (player.xp >= 2000) {
    player.rank = "Commander";
  } else if (player.xp >= 1000) {
    player.rank = "Navigator";
  } else if (player.xp >= 500) {
    player.rank = "Explorer";
  } else {
    player.rank = "Cadet";
  }
}

app.get("/", (req, res) => {
  res.send("Galactic Odyssey API Running");
});

app.get("/api/player", (req, res) => {
  res.json(player);
});

app.get("/api/planets", (req, res) => {
  res.json(planets);
});

app.get("/api/missions", (req, res) => {
  res.json(missions);
});

app.post("/api/travel", (req, res) => {
  const { planetName } = req.body;

  const planet = planets.find(
    p => p.name.toLowerCase() === planetName.toLowerCase()
  );

  if (!planet) {
    return res.status(404).json({
      success: false,
      message: "Planet not found"
    });
  }

  if (player.fuel < planet.fuelCost) {
    return res.status(400).json({
      success: false,
      message: "Not enough fuel"
    });
  }

  player.fuel -= planet.fuelCost;
  player.xp += planet.xpReward;
  player.credits += planet.xpReward;
  player.currentLocation = planet.name;

  updateRank();

  res.json({
    success: true,
    player
  });
});

app.post("/api/discover", (req, res) => {
  const discovery =
    discoveries[Math.floor(Math.random() * discoveries.length)];

  player.xp += discovery.reward;
  player.credits += discovery.reward;

  updateRank();

  res.json({
    success: true,
    discovery,
    player
  });
});

app.post("/api/refuel", (req, res) => {
  player.fuel = 100;

  res.json({
    success: true,
    fuel: player.fuel
  });
});

app.post("/api/reset", (req, res) => {
  player = {
    name: "Explorer",
    fuel: 100,
    xp: 0,
    credits: 500,
    rank: "Cadet",
    currentLocation: "Earth"
  };

  res.json({
    success: true,
    player
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
