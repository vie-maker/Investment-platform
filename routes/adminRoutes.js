
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');

const {
  getStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllInvestments,
  getInvestmentById,
  updateInvestment,
  deleteInvestment,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getAllWithdrawals,
  updateWithdrawal,
  deleteWithdrawal
} = require('../controllers/adminController');

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('admin', 'superadmin'));

// Dashboard stats
router.get('/stats', getStats);

// User management
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// Investment management
router.route('/investments')
  .get(getAllInvestments);

router.route('/investments/:id')
  .get(getInvestmentById)
  .put(updateInvestment)
  .delete(deleteInvestment);

// Transaction management
router.route('/transactions')
  .get(getAllTransactions);

router.route('/transactions/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

// Withdrawal management
router.route('/withdrawals')
  .get(getAllWithdrawals);

router.route('/withdrawals/:id')
  .put(updateWithdrawal)
  .delete(deleteWithdrawal);

module.exports = router;
