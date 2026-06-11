const express = require('express');
const router = express.Router();
const db = require('../db');

// Create user / join fan club
router.post('/users', async (req, res) => {
  try {
    const { name, selectedTeam } = req.body;
    if (!name || !selectedTeam) {
      return res.status(400).json({ error: 'Name and Favorite Team are required' });
    }
    const user = await db.createUser({ name, selectedTeam });
    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get fan club details
router.get('/clubs/:teamName', async (req, res) => {
  try {
    const { teamName } = req.params;
    const count = await db.getTeamSupporterCount(teamName);
    const members = await db.getUsersByTeam(teamName);
    res.json({
      teamName,
      totalSupporters: count,
      members: members.map(m => m.name)
    });
  } catch (err) {
    console.error('Error getting club details:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all clubs and their members (public overview)
router.get('/clubs', async (req, res) => {
  try {
    const users = await db.getUsers();
    
    const teamPopularity = {};
    users.forEach(u => {
      if (!teamPopularity[u.selectedTeam]) {
        teamPopularity[u.selectedTeam] = [];
      }
      teamPopularity[u.selectedTeam].push(u.name);
    });
    
    res.json(teamPopularity);
  } catch (err) {
    console.error('Error getting public clubs overview:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Submit predictions
router.post('/predictions', async (req, res) => {
  try {
    const {
      userId,
      champion,
      runnerUp,
      finalScore,
      goldenBoot,
      goldenBall,
      mostGoalsTeam,
      biggestDisappointment
    } = req.body;

    if (!userId || !champion || !runnerUp || !finalScore || !goldenBoot || !goldenBall || !mostGoalsTeam || !biggestDisappointment) {
      return res.status(400).json({ error: 'All prediction fields are required' });
    }

    // Check if user exists
    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if prediction already exists for user
    const existing = await db.getPredictionByUserId(userId);
    if (existing) {
      return res.status(400).json({ error: 'Predictions already submitted for this user' });
    }

    const prediction = await db.createPrediction({
      userId,
      champion,
      runnerUp,
      finalScore,
      goldenBoot,
      goldenBall,
      mostGoalsTeam,
      biggestDisappointment
    });

    res.status(201).json(prediction);
  } catch (err) {
    console.error('Error submitting prediction:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get prediction for a specific user
router.get('/predictions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const prediction = await db.getPredictionByUserId(userId);
    res.json(prediction);
  } catch (err) {
    console.error('Error getting user prediction:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get predictors for a specific option/field
router.get('/predictions/predictors', async (req, res) => {
  try {
    const { field, value } = req.query;
    
    if (!field || !value) {
      return res.status(400).json({ error: 'field and value query parameters are required' });
    }

    const allowedFields = [
      'champion',
      'runnerUp',
      'goldenBoot',
      'goldenBall',
      'mostGoalsTeam',
      'biggestDisappointment'
    ];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: `Invalid field. Must be one of: ${allowedFields.join(', ')}` });
    }

    const predictors = await db.getPredictorsByOption(field, value);
    res.json(predictors);
  } catch (err) {
    console.error('Error getting predictors:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Helper for percentages
function calculatePercentages(predictions, field) {
  const total = predictions.length;
  if (total === 0) return [];
  const counts = {};
  predictions.forEach(p => {
    const val = p[field];
    if (val) {
      counts[val] = (counts[val] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

// Get community prediction stats
router.get('/predictions/stats', async (req, res) => {
  try {
    const predictions = await db.getPredictions();
    const total = predictions.length;

    if (total === 0) {
      return res.json({
        totalPredictions: 0,
        championStats: [],
        runnerUpStats: [],
        goldenBootStats: [],
        goldenBallStats: [],
        mostGoalsTeamStats: [],
        biggestDisappointmentStats: []
      });
    }

    const championStats = calculatePercentages(predictions, 'champion');
    const runnerUpStats = calculatePercentages(predictions, 'runnerUp');
    const goldenBootStats = calculatePercentages(predictions, 'goldenBoot');
    const goldenBallStats = calculatePercentages(predictions, 'goldenBall');
    const mostGoalsTeamStats = calculatePercentages(predictions, 'mostGoalsTeam');
    const biggestDisappointmentStats = calculatePercentages(predictions, 'biggestDisappointment');

    res.json({
      totalPredictions: total,
      championStats,
      runnerUpStats,
      goldenBootStats,
      goldenBallStats,
      mostGoalsTeamStats,
      biggestDisappointmentStats
    });
  } catch (err) {
    console.error('Error getting stats:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Admin Authentication Middleware
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const checkAdminAuth = (req, res, next) => {
  const pwd = req.headers['x-admin-password'] || req.headers['authorization'];
  if (pwd === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid admin password' });
  }
};

// Verify admin password
router.post('/admin/verify', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin stats (protected)
router.get('/admin/stats', checkAdminAuth, async (req, res) => {
  try {
    const users = await db.getUsers();
    const predictions = await db.getPredictions();

    // Calculate team popularity with fan names
    const teamPopularity = {};
    users.forEach(u => {
      if (!teamPopularity[u.selectedTeam]) {
        teamPopularity[u.selectedTeam] = [];
      }
      teamPopularity[u.selectedTeam].push(u.name);
    });
    const sortedTeamPopularity = Object.entries(teamPopularity)
      .map(([team, members]) => ({ team, count: members.length, members }))
      .sort((a, b) => b.count - a.count);

    // Common stats
    const totalPredictions = predictions.length;
    const championStats = calculatePercentages(predictions, 'champion');
    const goldenBootStats = calculatePercentages(predictions, 'goldenBoot');
    const goldenBallStats = calculatePercentages(predictions, 'goldenBall');

    res.json({
      totalUsers: users.length,
      totalPredictions,
      teamPopularity: sortedTeamPopularity,
      topChampion: championStats[0] || null,
      topGoldenBoot: goldenBootStats[0] || null,
      topGoldenBall: goldenBallStats[0] || null
    });
  } catch (err) {
    console.error('Error getting admin stats:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all users with predictions for management
router.get('/admin/users', checkAdminAuth, async (req, res) => {
  try {
    const users = await db.getUsers();
    const predictions = await db.getPredictions();

    const usersWithPredictions = users.map(user => {
      const userId = user._id.toString();
      const prediction = predictions.find(p => p.userId.toString() === userId) || null;
      return {
        _id: userId,
        name: user.name,
        selectedTeam: user.selectedTeam,
        createdAt: user.createdAt,
        prediction
      };
    });

    res.json(usersWithPredictions);
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete user and associated prediction
router.delete('/admin/users/:userId', checkAdminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    await db.deleteUser(userId);
    res.json({ success: true, message: 'User and predictions deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

