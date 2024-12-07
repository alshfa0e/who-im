const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

class PaymentService {
    constructor() {
        this.db = admin.firestore();
        this.paymentsRef = this.db.collection('payments');
        this.usersRef = this.db.collection('users');
    }

    async createPayment(userId, amount, currency = 'USD') {
        try {
            const paymentId = uuidv4();
            const timestamp = admin.firestore.FieldValue.serverTimestamp();

            const paymentData = {
                id: paymentId,
                userId,
                amount,
                currency,
                status: 'pending',
                createdAt: timestamp,
                updatedAt: timestamp,
                paymentMethod: 'google_pay',
                metadata: {}
            };

            await this.paymentsRef.doc(paymentId).set(paymentData);
            return paymentData;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw new Error('Failed to create payment record');
        }
    }

    async updatePaymentStatus(paymentId, status, transactionData = {}) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            
            await this.paymentsRef.doc(paymentId).update({
                status,
                updatedAt: timestamp,
                transactionData,
                processedAt: status === 'completed' ? timestamp : null
            });

            return {
                success: true,
                paymentId,
                status
            };
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw new Error('Failed to update payment status');
        }
    }

    async getPayment(paymentId) {
        try {
            const paymentDoc = await this.paymentsRef.doc(paymentId).get();
            if (!paymentDoc.exists) {
                throw new Error('Payment not found');
            }
            return paymentDoc.data();
        } catch (error) {
            console.error('Error fetching payment:', error);
            throw new Error('Failed to fetch payment details');
        }
    }

    async listUserPayments(userId) {
        try {
            const snapshot = await this.paymentsRef
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error listing user payments:', error);
            throw new Error('Failed to fetch user payments');
        }
    }

    async validatePayment(paymentData) {
        // Implement payment validation logic
        const validationRules = {
            minimumAmount: 1.00,
            supportedCurrencies: ['USD'],
            requiredFields: ['amount', 'currency', 'userId']
        };

        // Check required fields
        for (const field of validationRules.requiredFields) {
            if (!paymentData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate amount
        if (paymentData.amount < validationRules.minimumAmount) {
            throw new Error(`Amount must be at least ${validationRules.minimumAmount}`);
        }

        // Validate currency
        if (!validationRules.supportedCurrencies.includes(paymentData.currency)) {
            throw new Error('Unsupported currency');
        }

        return true;
    }

    async createRefund(paymentId, amount, reason) {
        try {
            const payment = await this.getPayment(paymentId);
            if (payment.status !== 'completed') {
                throw new Error('Cannot refund incomplete payment');
            }

            const refundId = uuidv4();
            const timestamp = admin.firestore.FieldValue.serverTimestamp();

            const refundData = {
                id: refundId,
                paymentId,
                amount,
                reason,
                status: 'pending',
                createdAt: timestamp,
                updatedAt: timestamp
            };

            await this.db.collection('refunds').doc(refundId).set(refundData);
            await this.updatePaymentStatus(paymentId, 'refunded', { refundId });

            return refundData;
        } catch (error) {
            console.error('Error creating refund:', error);
            throw new Error('Failed to create refund');
        }
    }

    async generateReport(paymentId) {
        try {
            const payment = await this.getPayment(paymentId);
            if (payment.status !== 'completed') {
                throw new Error('Cannot generate report for incomplete payment');
            }

            // Additional report generation logic here
            return {
                paymentId,
                reportUrl: `https://example.com/reports/${paymentId}`,
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating report:', error);
            throw new Error('Failed to generate report');
        }
    }
}

module.exports = new PaymentService();