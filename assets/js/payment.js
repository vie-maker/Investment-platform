document.addEventListener('DOMContentLoaded', function() {
  // Payment form handling
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const amount = document.getElementById('amount').value;
      const method = document.getElementById('paymentMethod').value;
      
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('Please login to make a payment');
        }
        
        const response = await fetch('/api/v1/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount, method })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
          if (method === 'paypal' && data.data.approvalUrl) {
            window.location.href = data.data.approvalUrl;
          } else {
            // Handle other payment methods
            alert('Payment processed successfully!');
            window.location.href = '/dashboard.html';
          }
        } else {
          throw new Error(data.message || 'Payment failed');
        }
      } catch (error) {
        alert('Payment error: ' + error.message);
      }
    });
  }
  
  // Handle payment success callback
  if (window.location.pathname.includes('/payments/success')) {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const userId = urlParams.get('userId');
    
    if (orderId && userId) {
      completePayment(orderId, userId);
    }
  }
});

async function completePayment(orderId, userId) {
  try {
    const response = await fetch('/api/v1/payments/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, userId })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      document.getElementById('paymentStatus').textContent = 'Payment completed successfully!';
      document.getElementById('paymentAmount').textContent = `$${data.data.transaction.amount}`;
      document.getElementById('paymentDate').textContent = new Date().toLocaleString();
      
      // Update user balance display
      const balanceElement = document.getElementById('userBalance');
      if (balanceElement) {
        const currentBalance = parseFloat(balanceElement.textContent.replace('$', ''));
        balanceElement.textContent = `$${(currentBalance + data.data.transaction.amount).toFixed(2)}`;
      }
    } else {
      throw new Error(data.message || 'Payment verification failed');
    }
  } catch (error) {
    document.getElementById('paymentStatus').textContent = 'Payment verification failed: ' + error.message;
    document.getElementById('paymentStatus').style.color = '#d63031';
  }
}