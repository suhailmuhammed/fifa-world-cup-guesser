const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.AdminLog || mongoose.model('AdminLog', AdminLogSchema);
