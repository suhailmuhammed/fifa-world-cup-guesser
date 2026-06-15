const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const FALLBACK_FILE = path.join(__dirname, 'db_fallback.json');

let isFallback = true;
let localDb = {
  users: [],
  predictions: [],
  adminLogs: []
};

// Load initial local DB if it exists
function loadLocalDb() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf8');
      localDb = JSON.parse(data);
      if (!localDb.users) localDb.users = [];
      if (!localDb.predictions) localDb.predictions = [];
      if (!localDb.adminLogs) localDb.adminLogs = [];
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
const AdminLog = require('./models/AdminLog');

async function createUser(userData) {
  if (!isFallback) {
    const user = new User({
      name: userData.name,
      selectedTeam: userData.selectedTeam,
      pin: userData.pin || null
    });
    return await user.save();
  } else {
    const newUser = {
      _id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: userData.name,
      selectedTeam: userData.selectedTeam,
      pin: userData.pin || null,
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

async function getPredictorsByOption(field, value) {
  if (!isFallback) {
    const escapedValue = value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const predictions = await Prediction.find({
      [field]: { $regex: new RegExp('^' + escapedValue + '$', 'i') }
    }).populate('userId');
    return predictions
      .filter(p => p.userId)
      .map(p => ({
        _id: p.userId._id,
        name: p.userId.name,
        selectedTeam: p.userId.selectedTeam,
        createdAt: p.createdAt
      }));
  } else {
    const predictions = localDb.predictions.filter(
      p => p[field] && p[field].toLowerCase() === value.toLowerCase()
    );
    return predictions.map(p => {
      const user = localDb.users.find(u => u._id === p.userId);
      return {
        _id: p.userId,
        name: user ? user.name : 'Unknown User',
        selectedTeam: user ? user.selectedTeam : 'Unknown Team',
        createdAt: p.createdAt
      };
    });
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

async function getUserByNameAndTeam(name, team) {
  if (!isFallback) {
    return await User.findOne({
      name: { $regex: new RegExp('^' + name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') },
      selectedTeam: { $regex: new RegExp('^' + team.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') }
    });
  } else {
    return localDb.users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.selectedTeam.toLowerCase() === team.toLowerCase()) || null;
  }
}

async function updateUserPin(userId, pin) {
  if (!isFallback) {
    return await User.findByIdAndUpdate(userId, { pin }, { new: true });
  } else {
    const user = localDb.users.find(u => u._id === userId);
    if (user) {
      user.pin = pin;
      saveLocalDb();
      return user;
    }
    return null;
  }
}

async function createAdminLog(action, details) {
  if (!isFallback) {
    const log = new AdminLog({ action, details });
    return await log.save();
  } else {
    const newLog = {
      _id: 'l_' + Math.random().toString(36).substr(2, 9),
      action,
      details,
      timestamp: new Date().toISOString()
    };
    if (!localDb.adminLogs) {
      localDb.adminLogs = [];
    }
    localDb.adminLogs.push(newLog);
    saveLocalDb();
    return newLog;
  }
}

async function getAdminLogs() {
  if (!isFallback) {
    return await AdminLog.find({}).sort({ timestamp: -1 });
  } else {
    if (!localDb.adminLogs) {
      localDb.adminLogs = [];
    }
    return [...localDb.adminLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
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
  getPredictorsByOption,
  deleteUser,
  getUserByNameAndTeam,
  updateUserPin,
  createAdminLog,
  getAdminLogs,
  isFallback: () => isFallback
};

