const midtransClient = require('midtrans-client');

// Inisialisasi Midtrans client
const snap = new midtransClient.Snap({
  isProduction: false, // Set true untuk production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

module.exports = {
  createTransaction: async (donationData) => {
    try {
      const parameter = {
        transaction_details: {
          order_id: donationData.id,
          gross_amount: parseInt(donationData.amount)
        },
        customer_details: {
          first_name: donationData.donor_name || 'Anonymous',
          email: donationData.email,
          phone: donationData.phone
        },
        item_details: [
          {
            id: donationData.campaign_id,
            price: parseInt(donationData.amount),
            quantity: 1,
            name: `Donasi - ${donationData.campaign_title || 'Campaign'}`
          }
        ],
        callbacks: {
          finish: `${process.env.BASE_URL}/donations/success`,
          error: `${process.env.BASE_URL}/donations/error`,
          pending: `${process.env.BASE_URL}/donations/pending`
        }
      };

      const transaction = await snap.createTransaction(parameter);
      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url
      };
    } catch (error) {
      throw new Error(`Midtrans error: ${error.message}`);
    }
  },

  verifyCallback: async (notification) => {
    try {
      const statusResponse = await snap.transaction.notification(notification);
      return {
        order_id: statusResponse.order_id,
        transaction_status: statusResponse.transaction_status,
        fraud_status: statusResponse.fraud_status,
        payment_type: statusResponse.payment_type,
        gross_amount: statusResponse.gross_amount,
        signature_key: statusResponse.signature_key
      };
    } catch (error) {
      throw new Error(`Verification error: ${error.message}`);
    }
  }
}; 