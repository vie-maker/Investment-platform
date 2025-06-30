const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Run every day at 00:01 AM
const calculateDailyProfits = cron.schedule('1 0 * * *', async () => {
  console.log('Running daily profit calculation...');
  
  try {
    const activeInvestments = await Investment.find({ 
      status: 'active',
      nextPayoutDate: { $lte: new Date() }
    }).populate('userId');

    for (const investment of activeInvestments) {
      try {
        // Calculate daily profit
        const dailyProfit = investment.amount * (investment.dailyPercent / 100);
        const roundedProfit = Math.round(dailyProfit * 100) / 100; // Round to 2 decimals

        // Update user balance
        const user = await User.findById(investment.userId);
        user.balance += roundedProfit;
        await user.save();

        // Create profit transaction
        const transaction = new Transaction({
          userId: investment.userId._id,
          type: 'profit',
          amount: roundedProfit,
          status: 'completed',
          reference: `DAILY-${investment._id}-${new Date().toISOString()}`
        });
        await transaction.save();

        // Update investment
        investment.totalEarned += roundedProfit;
        investment.lastPayoutDate = new Date();
        
        // Set next payout date (24 hours later)
        investment.nextPayoutDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        // Check if investment has completed
        if (new Date() >= investment.endDate) {
          investment.status = 'completed';
          investment.nextPayoutDate = null;
        }

        await investment.save();
        
        console.log(`Processed $${roundedProfit} profit for investment ${investment._id}`);
      } catch (err) {
        console.error(`Error processing investment ${investment._id}:`, err);
      }
    }

    console.log(`Completed processing ${activeInvestments.length} investments`);
  } catch (err) {
    console.error('Error in daily profit cron job:', err);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});

module.exports = calculateDailyProfits;