const cron = require('node-cron');
const Investment = require('../modals/investment');
const User = require('../modals/User');
const Transaction = require('../modals/Transaction');

// Calculate daily profit for an investment
const calculateDailyProfit = (investment) => {
  const dailyRate = investment.dailyPercent / 100;
  return Math.round((investment.amount * dailyRate) * 100) / 100;
};

// Run every day at 00:01 UTC (midnight)
const job = cron.schedule('1 0 * * *', async () => {
  try {
    console.log('Running daily profit calculation...');

    const now = new Date();
    const activeInvestments = await Investment.find({
      status: 'active',
      nextPayoutDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('user', 'balance');

    console.log(`Found ${activeInvestments.length} active investments to process`);

    for (const investment of activeInvestments) {
      try {
        const profit = calculateDailyProfit(investment);

        // Create profit transaction
        const transaction = new Transaction({
          user: investment.user._id,
          type: 'profit',
          amount: profit,
          method: 'system',
          status: 'completed',
          reference: `PROFIT-${investment._id}-${now.toISOString().split('T')[0]}`
        });
        await transaction.save();

        // Update user balance
        await User.findByIdAndUpdate(investment.user._id, {
          $inc: { balance: profit }
        });

        // Update investment
        investment.totalEarned += profit;
        investment.nextPayoutDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Check if investment has completed
        if (now >= investment.endDate) {
          investment.status = 'completed';
        }

        await investment.save();
        console.log(`Processed investment ${investment._id} - Profit: $${profit}`);
      } catch (error) {
        console.error(`Error processing investment ${investment._id}:`, error);
      }
    }

    console.log('Daily profit calculation completed');
  } catch (error) {
    console.error('Error in daily profit calculation:', error);
  }
}, {
  scheduled: true,
  timezone: "UTC"
});

console.log('Daily profit cron job initialized');

module.exports = { job };