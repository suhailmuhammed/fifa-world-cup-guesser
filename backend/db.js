const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const FALLBACK_FILE = path.join(__dirname, 'db_fallback.json');

let isFallback = true;
let localDb = {
  users: [],
  predictions: []
};

// Load initial local DB if it exists
function loadLocalDb() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8');
      localDb = JSON.parse(data);
    } else {
      saveLocalDb();
    }
  } catch (err) {
    console.error('Error reading fallback DB file, initializing empty:', err);
  }
}

function saveLocalDb() {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing fallback DB file:', err);
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri);
      isFallback = false;
      console.log('Successfully connected to MongoDB Atlas!');
    } catch (err) {
      console.error('Failed to connect to MongoDB Atlas. Falling back to local JSON database.', err);
      isFallback = true;
      loadLocalDb();
    }
  } else {
    console.log('MONGODB_URI not found in env. Running in local JSON database mode.');
    isFallback = true;
    loadLocalDb();
  }
}

// User methods
const User = require('./models/User');

async function createUser(userData) {
  if (!isFallback) {
    const user = new User({
      name: userData.name,
      selectedTeam: userData.selectedTeam
    });
    return await user.save();
  } else {
    const newUser = {
      _id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      selectedTeam: userData.selectedTeam,
      createdAt: new Date().toISOString()
    };
    localDb.users.push(newUser);
    saveLocalDb();
    return newUser;
  }
}

async function getUsers() {
  if (!isFallback) {
    return await User.find({}).sort({ createdAt: -1 });
  } else {
    return [...localDb.users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

async function getUserById(id) {
  if (!isFallback) {
    return await User.findById(id);
  } else {
    return localDb.users.find(u => u._id === id) || null;
  }
}

async function getUsersByTeam(teamName) {
  if (!isFallback) {
    return await User.find({ selectedTeam: teamName }).sort({ name: 1 });
  } else {
    return localDb.users
      .filter(u => u.selectedTeam.toLowerCase() === teamName.toLowerCase())
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}

async function getTeamSupporterCount(teamName) {
  if (!isFallback) {
    return await User.countDocuments({ selectedTeam: teamName });
  } else {
    return localDb.users.filter(u => u.selectedTeam.toLowerCase() === teamName.toLowerCase()).length;
  }
}

// Prediction methods
const Prediction = require('./models/Prediction');

async function createPrediction(predictionData) {
  if (!isFallback) {
    const prediction = new Prediction({
      userId: predictionData.userId,
      champion: predictionData.champion,
      runnerUp: predictionData.runnerUp,
      finalScore: {
        homeGoals: parseInt(predictionData.finalScore.homeGoals),
        awayGoals: parseInt(predictionData.finalScore.awayGoals)
      },
      goldenBoot: predictionData.goldenBoot,
      goldenBall: predictionData.goldenBall,
      mostGoalsTeam: predictionData.mostGoalsTeam,
      biggestDisappointment: predictionData.biggestDisappointment
    });
    return await prediction.save();
  } else {
    const newPrediction = {
      _id: 'p_' + Math.random().toString(36).substr(2, 9),
      userId: predictionData.userId,
      champion: predictionData.champion,
      runnerUp: predictionData.runnerUp,
      finalScore: {
        homeGoals: parseInt(predictionData.finalScore.homeGoals) || 0,
        awayGoals: parseInt(predictionData.finalScore.awayGoals) || 0
      },
      goldenBoot: predictionData.goldenBoot,
      goldenBall: predictionData.goldenBall,
      mostGoalsTeam: predictionData.mostGoalsTeam,
      biggestDisappointment: predictionData.biggestDisappointment,
      createdAt: new Date().toISOString()
    };
    localDb.predictions.push(newPrediction);
    saveLocalDb();
    return newPrediction;
  }
}

async function getPredictions() {
  if (!isFallback) {
    return await Prediction.find({}).sort({ createdAt: -1 });
  } else {
    return [...localDb.predictions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

async function getPredictionByUserId(userId) {
  if (!isFallback) {
    return await Prediction.findOne({ userId });
  } else {
    return localDb.predictions.find(p => p.userId === userId) || null;
  }
}

async function deleteUser(id) {
  if (!isFallback) {
    await User.findByIdAndDelete(id);
    await Prediction.deleteMany({ userId: id });
  } else {
    localDb.users = localDb.users.filter(u => u._id !== id);
    localDb.predictions = localDb.predictions.filter(p => p.userId !== id);
    saveLocalDb();
  }
  return true;
}

module.exports = {
  connectDB,
  createUser,
  getUsers,
  getUserById,
  getUsersByTeam,
  getTeamSupporterCount,
  createPrediction,
  getPredictions,
  getPredictionByUserId,
  deleteUser,
  isFallback: () => isFallback
};
