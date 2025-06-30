const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: true,
    enum: ['starter', 'silver', 'gold', 'vip', 'bmf1', 'bmf2', 'bmf3', 'bmf4', 'vip1', 'vip2', 'elite']
  },
  amount: {
    type: Number,
    required: true
  },
  dailyPercent: {
    type: Number,
    required: true
  },
  durationDays: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  nextPayoutDate: Date,
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  withdrawn: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate end date before saving
InvestmentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.endDate = new Date(this.startDate);
    this.endDate.setDate(this.endDate.getDate() + this.durationDays);
    
    this.nextPayoutDate = new Date(this.startDate);
    this.nextPayoutDate.setDate(this.nextPayoutDate.getDate() + 1);
  }
  next();
});

module.exports = mongoose.model('Investment', InvestmentSchema);