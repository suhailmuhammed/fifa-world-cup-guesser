const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  champion: {
    type: String,
    required: true
  },
  runnerUp: {
    type: String,
    required: true
  },
  finalScore: {
    homeGoals: {
      type: Number,
      required: true
    },
    awayGoals: {
      type: Number,
      required: true
    }
  },
  goldenBoot: {
    type: String,
    required: true
  },
  goldenBall: {
    type: String,
    required: true
  },
  mostGoalsTeam: {
    type: String,
    required: true
  },
  biggestDisappointment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema);
