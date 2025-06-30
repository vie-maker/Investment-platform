const Investment = require('../models/Investment');
const Plan = require('../models/Plan');
const Transaction = require('../models/Transaction');
const asyncHandler = require('express-async-handler');
const calculateDailyProfit = require('../utils/calculateProfit');

// @desc    Get all investment plans
// @route   GET /api/plans
// @access  Public
const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ isActive: true });
  res.json(plans);
});

// @desc    Create new investment
// @route   POST /api/investments
// @access  Private
const createInvestment = asyncHandler(async (req, res) => {
  const { planId, amount } = req.body;
  
  const plan = await Plan.findById(planId);
  if (!plan) {
    res.status(404);
    throw new Error('Plan not found');
  }
  
  if (amount < plan.minAmount || (plan.maxAmount && amount > plan.maxAmount)) {
    res.status(400);
    throw new Error(`Amount must be between $${plan.minAmount} and $${plan.maxAmount || 'No limit'}`);
  }
  
  // Check user balance
  const user = await User.findById(req.user._id);
  if (user.balance < amount) {
    res.status(400);
    throw new Error('Insufficient balance');
  }
  
  // Deduct from balance
  user.balance -= amount;
  await user.save();
  
  // Create investment
  const investment = new Investment({
    userId: req.user._id,
    planId: plan._id,
    planName: plan.name,
    amount: amount,
    dailyPercent: plan.dailyPercent,
    durationDays: plan.durationDays
  });
  
  await investment.save();
  
  // Create transaction record
  const transaction = new Transaction({
    userId: req.user._id,
    type: 'investment',
    amount: amount,
    status: 'completed',
    reference: `INV-${investment._id}`
  });
  await transaction.save();
  
  res.status(201).json(investment);
});

// @desc    Get user's active investments
// @route   GET /api/investments
// @access  Private
const getInvestments = asyncHandler(async (req, res) => {
  const investments = await Investment.find({ 
    userId: req.user._id,
    status: 'active'
  });
  res.json(investments);
});

// @desc    Get investment history
// @route   GET /api/investments/history
// @access  Private
const getInvestmentHistory = asyncHandler(async (req, res) => {
  const investments = await Investment.find({ 
    userId: req.user._id 
  }).sort('-createdAt');
  res.json(investments);
});

// @desc    Calculate daily profits (to be run by cron job)
// @route   POST /api/investments/calculate-profits
// @access  Private/Admin
const calculateDailyProfits = asyncHandler(async (req, res) => {
  const activeInvestments = await Investment.find({ status: 'active' });
  
  for (const investment of activeInvestments) {
    const profit = calculateDailyProfit(investment);
    
    // Create profit transaction
    const transaction = new Transaction({
      userId: investment.userId,
      type: 'profit',
      amount: profit,
      status: 'completed',
      reference: `PROFIT-${investment._id}-${new Date().toISOString()}`
    });
    await transaction.save();
    
    // Update user balance
    await User.findByIdAndUpdate(investment.userId, {
      $inc: { balance: profit }
    });
    
    // Update investment
    investment.totalEarned += profit;
    
    // Check if investment has completed
    if (new Date() >= investment.endDate) {
      investment.status = 'completed';
    }
    
    await investment.save();
  }
  
  res.json({ message: `Processed ${activeInvestments.length} investments` });
});

module.exports = {
  getPlans,
  createInvestment,
  getInvestments,
  getInvestmentHistory,
  calculateDailyProfits
};