const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

// Get dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Transaction.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { status: 'pending' } },
        { $count: 'pendingTransactions' }
      ])
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers: stats[0],
        newUsersLast30Days: stats[1],
        totalTransactionsValue: stats[2][0]?.totalAmount || 0,
        pendingTransactions: stats[3][0]?.pendingTransactions || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all users with filtering, sorting, pagination
exports.getAllUsers = async (req, res, next) => {
  try {
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    
    const users = await features.query;
    const total = await User.countDocuments(features.filterQuery);

    res.status(200).json({
      status: 'success',
      results: users.length,
      total,
      data: { users }
    });
  } catch (err) {
    next(err);
  }
};

// Update user status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res, next) => {
  try {
    const features = new APIFeatures(Transaction.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    
    const transactions = await features.query.populate('user', 'firstName lastName email');
    const total = await Transaction.countDocuments(features.filterQuery);

    res.status(200).json({
      status: 'success',
      results: transactions.length,
      total,
      data: { transactions }
    });
  } catch (err) {
    next(err);
  }
};

// Update transaction status
exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    if (!transaction) {
      return next(new AppError('No transaction found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { transaction }
    });
  } catch (err) {
    next(err);
  }
};