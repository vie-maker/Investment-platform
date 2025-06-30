const cron = require('node-cron');
const Investment = require('../modals/investment');
const User = require('../modals/User');
const Transaction = require('../modals/Transaction');

// Calculate daily profit for an investment
const calculateDailyProfit = (investment) => {
  const dailyRate = investment.plan.dailyReturn / 100;
  return investment.amount * dailyRate;
};

// Run every day at 00:01 UTC (midnight)
cron.schedule('1 0 * * *', async () => {
  try {
    console.log('Running daily profit calculation...');
    
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
    
    console.log(`Processed ${activeInvestments.length} investments`);
  } catch (error) {
    console.error('Error in daily profit calculation:', error);
  }
});

console.log('Daily profit cron job initialized');
const job = cron.schedule('1 0 * * *', async () => {
  console.log('Starting daily profit calculation...');
  
  try {
    const now = new Date();
    const activeInvestments = await Investment.find({
      status: 'active',
      nextPayoutDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('user', 'balance');
    
    console.log(`Found ${activeInvestments.length} active investments to process`);
    
    for (const investment of activeInvestments) {
      try {
        const dailyProfit = investment.amount * (investment.dailyPercent / 100);
        const roundedProfit = Math.round(dailyProfit * 100) / 100;
        
        // Update user balance
        const updatedUser = await User.findByIdAndUpdate(
          investment.user._id,
          { $inc: { balance: roundedProfit } },
          { new: true }
        );
        
        // Create profit transaction
        await Transaction.create({
          user: investment.user._id,
          type: 'profit',
          amount: roundedProfit,
          method: 'system',
          status: 'completed',
          reference: `PROFIT-${investment._id}-${now.toISOString().split('T')[0]}`
        });
        
        // Update investment
        investment.totalEarned += roundedProfit;
        investment.nextPayoutDate = new Date(now.setDate(now.getDate() + 1));
        
        // Check if investment has completed
        if (now >= investment.endDate) {
          investment.status = 'completed';
        }

        await investment.save();

        console.log(`Processed investment ${investment._id} - Profit: $${roundedProfit}`);
      } catch (error) {
        console.error(`Error processing investment ${investment._id}:`, error);
      }
    }

    console.log('Daily profit calculation completed');
  } catch (error) {
    console.error('Error in daily profit calculation:', error);
  }
}, {
  scheduled: false,
  timezone: "UTC"
});

module.exports = { job };