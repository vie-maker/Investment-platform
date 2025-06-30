const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Run every day at 00:01 UTC (midnight)
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
          investment.nextPayoutDate = null;
        }
        
        await investment.save();
        
        console.log(`Processed $${roundedProfit} profit for investment ${investment._id}`);
      } catch (err) {
        console.error(`Error processing investment ${investment._id}:`, err);
      }
    }
    
    console.log('Daily profit calculation completed');
  } catch (err) {
    console.error('Error in daily profit cron job:', err);
  }
}, {
  scheduled: true,
  timezone: 'UTC'
});

module.exports = job;