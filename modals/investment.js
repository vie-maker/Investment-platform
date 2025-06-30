const mongoose = require('mongoose');

const InvestmentPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dailyReturn: {
    type: Number,
    required: true
  },
  minimumAmount: {
    type: Number,
    required: true
  },
  maximumAmount: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true // in days
  }
});

const InvestmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    name: { type: String, required: true },
    dailyReturn: { type: Number, required: true },
    duration: { type: Number, required: true },
    minAmount: { type: Number, required: true }
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  nextPayoutDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // Next day
    }
  },
  paymentReference: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
InvestmentSchema.index({ userId: 1, status: 1 });
InvestmentSchema.index({ status: 1, endDate: 1 });

// Virtual for user reference
InvestmentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for days remaining
InvestmentSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for progress percentage
InvestmentSchema.virtual('progressPercentage').get(function() {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const totalDuration = end - start;
  const elapsed = now - start;
  const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  return Math.round(percentage * 100) / 100;
});

// Pre-save middleware to set end date
InvestmentSchema.pre('save', function(next) {
  if (this.isNew && !this.endDate) {
    const startDate = this.startDate || new Date();
    this.endDate = new Date(startDate.getTime() + (this.plan.duration * 24 * 60 * 60 * 1000));
  }
  next();
});

// Static method to get active investments
InvestmentSchema.statics.getActiveInvestments = function() {
  return this.find({ status: 'active' });
};

// Static method to get user investments
InvestmentSchema.statics.getUserInvestments = function(userId, options = {}) {
  const { page = 1, limit = 10, status } = options;
  const skip = (page - 1) * limit;

  const query = { userId };
  if (status) query.status = status;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName email');
};

// Method to calculate daily profit
InvestmentSchema.methods.calculateDailyProfit = function() {
  const dailyRate = this.plan.dailyReturn / 100;
  return this.amount * dailyRate;
};

module.exports = mongoose.model('Investment', InvestmentSchema);
```

```
InvestmentSchema.index({ userId: 1, status: 1 });
InvestmentSchema.index({ status: 1, endDate: 1 });
```

```
InvestmentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});
```

```
InvestmentSchema.virtual('daysRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});
```

```
InvestmentSchema.virtual('progressPercentage').get(function() {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const totalDuration = end - start;
  const elapsed = now - start;
  const percentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  return Math.round(percentage * 100) / 100;
});
```

```
InvestmentSchema.pre('save', function(next) {
  if (this.isNew && !this.endDate) {
    const startDate = this.startDate || new Date();
    this.endDate = new Date(startDate.getTime() + (this.plan.duration * 24 * 60 * 60 * 1000));
  }
  next();
});
```

```
InvestmentSchema.statics.getActiveInvestments = function() {
  return this.find({ status: 'active' });
};
```

```
InvestmentSchema.statics.getUserInvestments = function(userId, options = {}) {
  const { page = 1, limit = 10, status } = options;
  const skip = (page - 1) * limit;

  const query = { userId };
  if (status) query.status = status;

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName email');
};
```

```
InvestmentSchema.methods.calculateDailyProfit = function() {
  const dailyRate = this.plan.dailyReturn / 100;
  return this.amount * dailyRate;
};
```

```
module.exports = mongoose.model('Investment', InvestmentSchema);
```