const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -verificationToken');
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.country = req.body.country || user.country;
    
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      country: updatedUser.country,
      balance: updatedUser.balance,
      isVerified: updatedUser.isVerified,
      kycSubmitted: updatedUser.kycSubmitted
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Submit KYC documents
// @route   POST /api/users/kyc
// @access  Private
const submitKYC = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    user.kycDocuments = {
      idFront: req.body.idFront,
      idBack: req.body.idBack,
      selfie: req.body.selfie
    };
    user.kycSubmitted = true;
    
    await user.save();
    res.json({ message: 'KYC documents submitted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Get user dashboard stats
// @route   GET /api/users/stats
// @access  Private
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    { $match: { _id: req.user._id } },
    { $lookup: {
        from: 'investments',
        localField: '_id',
        foreignField: 'userId',
        as: 'investments'
      }
    },
    { $lookup: {
        from: 'transactions',
        localField: '_id',
        foreignField: 'userId',
        as: 'transactions'
      }
    },
    { $project: {
        totalInvested: { $sum: '$investments.amount' },
        activeInvestments: { 
          $size: { 
            $filter: {
              input: '$investments',
              as: 'investment',
              cond: { $eq: ['$$investment.status', 'active'] }
            }
          }
        },
        totalEarnings: {
          $sum: {
            $filter: {
              input: '$transactions',
              as: 'transaction',
              cond: { $eq: ['$$transaction.type', 'profit'] }
            }
          }
        },
        referralEarnings: {
          $sum: {
            $filter: {
              input: '$transactions',
              as: 'transaction',
              cond: { $eq: ['$$transaction.type', 'referral'] }
            }
          }
        }
      }
    }
  ]);
  
  res.json(stats[0]);
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  submitKYC,
  getUserStats
};