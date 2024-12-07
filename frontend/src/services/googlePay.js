// Google Pay Service Class
class GooglePayService {
    constructor() {
        this.baseRequest = {
            apiVersion: 2,
            apiVersionMinor: 0
        };
        
        this.paymentConfig = {
            environment: 'TEST', // Change to 'PRODUCTION' for live
            merchantInfo: {
                merchantId: 'YOUR-MERCHANT-ID', // Replace with your merchant ID
                merchantName: 'Who I\'m Analysis'
            },
            allowedPaymentMethods: [{
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['VISA', 'MASTERCARD']
                },
                tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                        gateway: 'example', // Replace with your payment gateway
                        gatewayMerchantId: 'YOUR-GATEWAY-MERCHANT-ID'
                    }
                }
            }]
        };
    }

    async initialize() {
        if (!window.google?.payments?.api) {
            throw new Error('Google Pay API not loaded');
        }

        this.paymentsClient = new google.payments.api.PaymentsClient({
            environment: this.paymentConfig.environment
        });

        try {
            const result = await this.paymentsClient.isReadyToPay(this.baseRequest);
            return result.result;
        } catch (error) {
            console.error('Google Pay initialization error:', error);
            throw error;
        }
    }

    createButton(options = {}) {
        const button = this.paymentsClient.createButton({
            onClick: options.onClick || (() => {}),
            allowedPaymentMethods: this.paymentConfig.allowedPaymentMethods
        });
        return button;
    }

    async processPayment(amount, currency = 'USD') {
        try {
            const paymentDataRequest = {
                ...this.baseRequest,
                allowedPaymentMethods: this.paymentConfig.allowedPaymentMethods,
                merchantInfo: this.paymentConfig.merchantInfo,
                transactionInfo: {
                    totalPriceStatus: 'FINAL',
                    totalPrice: amount.toString(),
                    currencyCode: currency
                }
            };

            const paymentData = await this.paymentsClient.loadPaymentData(paymentDataRequest);
            
            // Send payment data to your backend
            const response = await fetch('/api/payment/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentData,
                    amount,
                    currency
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Payment processing failed');
            }

            return result;
        } catch (error) {
            console.error('Payment processing error:', error);
            throw error;
        }
    }

    // Helper method to format price for display
    formatPrice(amount, currency = 'USD', locale = 'en-US') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Get payment configuration
    getPaymentConfig() {
        return this.paymentConfig;
    }

    // Update payment configuration
    updatePaymentConfig(config) {
        this.paymentConfig = {
            ...this.paymentConfig,
            ...config
        };
    }

    // Set environment (TEST/PRODUCTION)
    setEnvironment(environment) {
        if (environment !== 'TEST' && environment !== 'PRODUCTION') {
            throw new Error('Invalid environment');
        }
        this.paymentConfig.environment = environment;
        if (this.paymentsClient) {
            this.paymentsClient = new google.payments.api.PaymentsClient({
                environment: environment
            });
        }
    }
}