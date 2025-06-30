const paypal = require('@paypal/checkout-server-sdk');
const Investment = require('../modals/investment');
const Transaction = require('../modals/Transaction');
const User = require('../modals/User');

// Set up PayPal environment
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  return process.env.PAYPAL_ENVIRONMENT === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// Create PayPal client
function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

// @desc    Create PayPal order
// @route   POST /api/v1/payments/paypal
// @access  Private
exports.createPayPalOrder = async (req, res, next) => {
  try {
    const { amount, planId } = req.body;
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount,
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: amount
            }
          }
        },
        items: [{
          name: `Investment Plan ${planId}`,
          unit_amount: {
            currency_code: 'USD',
            value: amount
          },
          quantity: '1',
          category: 'DIGITAL_GOODS'
        }]
      }]
    });

    const order = await client().execute(request);
    
    // Create pending transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      amount,
      method: 'paypal',
      status: 'pending',
      reference: order.result.id
    });

    res.status(200).json({
      success: true,
      orderID: order.result.id,
      transactionId: transaction._id
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Capture PayPal payment
// @route   POST /api/v1/payments/paypal/capture
// @access  Private
exports.capturePayPalOrder = async (req, res, next) => {
  try {
    const { orderID, transactionId, planId } = req.body;
    
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client().execute(request);
    
    // Update transaction status
    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status: 'completed' },
      { new: true }
    );

    // Update user balance
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { balance: transaction.amount } },
      { new: true }
    );

    // Create investment if planId exists
    if (planId) {
      const planDetails = getPlanDetails(planId);
      await Investment.create({
        user: req.user.id,
        plan: planId,
        amount: transaction.amount,
        dailyPercent: planDetails.dailyPercent,
        durationDays: planDetails.durationDays
      });
    }

    res.status(200).json({
      success: true,
      capture: capture.result,
      balance: user.balance
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to get plan details
function getPlanDetails(planId) {
  const plans = {
    starter: { dailyPercent: 2, durationDays: 15 },
    silver: { dailyPercent: 3, durationDays: 20 },
    gold: { dailyPercent: 5, durationDays: 30 },
    vip: { dailyPercent: 7, durationDays: 20 },
    // Add other plans...
  };
  return plans[planId];
}