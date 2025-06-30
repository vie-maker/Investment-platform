import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminInvestments from './pages/AdminInvestments';
import AdminTransactions from './pages/AdminTransactions';
import AdminWithdrawals from './pages/AdminWithdrawals';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Other routes */}
        
        {/* Admin routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/investments" element={<AdminInvestments />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}