
const User = require('../modals/User');
const Investment = require('../modals/investment');
const Transaction = require('../modals/Transaction');
const User = require('../modals/User');
const Investment = require('../modals/investment');
const Transaction = require('../modals/Transaction');
const AppError = require('../utils/AppError');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user._id });
    res.status(200).json({
      status: 'success',
      results: investments.length,
      data: { investments }
    });
  } catch (error) {
    next(error);
  }
};

exports.createInvestment = async (req, res, next) => {
  try {
    const { plan, amount } = req.body;
    
    // Check if user has sufficient balance
    if (req.user.balance < amount) {
      return next(new AppError('Insufficient balance', 400));
    }

    // Create investment
    const investment = await Investment.create({
      user: req.user._id,
      plan,
      amount,
      startDate: new Date(),
      endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
      nextPayoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Deduct amount from user balance
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { balance: -amount }
    });

    res.status(201).json({
      status: 'success',
      data: { investment }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });
      
    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};

exports.getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('balance');
    res.status(200).json({
      status: 'success',
      data: { balance: user.balance }
    });
  } catch (error) {
    next(error);
  }
};

exports.requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, method } = req.body;
    
    if (req.user.balance < amount) {
      return next(new AppError('Insufficient balance', 400));
    }

    const withdrawal = await Transaction.create({
      user: req.user._id,
      type: 'withdrawal',
      amount,
      method,
      status: 'pending',
      reference: `WITHDRAW-${Date.now()}`
    });

    res.status(201).json({
      status: 'success',
      data: { withdrawal }
    });
  } catch (error) {
    next(error);
  }
};

    const investment = await Investment.create({
      user: req.user._id,
      plan,
      amount,
      dailyPercent: plan.dailyReturn,
      duration: plan.duration,
      startDate: new Date(),
      endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
      nextPayoutDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Deduct amount from user balance
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { balance: -amount }
    });

    res.status(201).json({
      status: 'success',
      data: { investment }
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: transactions.length,
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};

exports.getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('balance');
    res.status(200).json({
      status: 'success',
      data: { balance: user.balance }
    });
  } catch (error) {
    next(error);
  }
};

exports.requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, method, details } = req.body;
    
    if (req.user.balance < amount) {
      return next(new AppError('Insufficient balance', 400));
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'withdrawal',
      amount,
      method,
      status: 'pending',
      details,
      reference: `WD-${Date.now()}`
    });

    res.status(201).json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};
