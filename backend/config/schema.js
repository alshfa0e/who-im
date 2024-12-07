// Firebase Collections Schema

const schema = {
    payments: {
        id: 'string',
        userId: 'string',
        amount: 'number',
        currency: 'string',
        status: 'string', // pending, completed, failed, refunded
        paymentMethod: 'string',
        transactionId: 'string',
        createdAt: 'timestamp',
        updatedAt: 'timestamp',
        metadata: 'map'
    },
    
    transactions: {
        id: 'string',
        paymentId: 'string',
        userId: 'string',
        type: 'string', // payment, refund
        amount: 'number',
        currency: 'string',
        status: 'string',
        processedAt: 'timestamp',
        metadata: 'map'
    },
    
    reports: {
        id: 'string',
        userId: 'string',
        paymentId: 'string',
        type: 'string', // basic, premium
        content: 'string',
        generatedAt: 'timestamp',
        accessToken: 'string',
        expiresAt: 'timestamp'
    },
    
    users: {
        id: 'string',
        email: 'string',
        name: 'string',
        language: 'string',
        lastActive: 'timestamp',
        reports: 'array',
        payments: 'array'
    }
};

const indexes = [
    {
        collection: 'payments',
        fields: [
            'userId',
            'status',
            'createdAt'
        ]
    },
    {
        collection: 'reports',
        fields: [
            'userId',
            'paymentId',
            'accessToken'
        ]
    }
];

const rules = `
rules_version = '2';
service cloud.firestore {
    match /databases/{database}/documents {
        // Payment rules
        match /payments/{paymentId} {
            allow read: if request.auth != null && request.auth.uid == resource.data.userId;
            allow write: if false; // Only backend can write
        }
        
        // Transaction rules
        match /transactions/{transactionId} {
            allow read: if request.auth != null && request.auth.uid == resource.data.userId;
            allow write: if false;
        }
        
        // Report rules
        match /reports/{reportId} {
            allow read: if request.auth != null && request.auth.uid == resource.data.userId;
            allow write: if false;
        }
        
        // User rules
        match /users/{userId} {
            allow read: if request.auth != null && request.auth.uid == userId;
            allow write: if request.auth != null && request.auth.uid == userId;
        }
    }
}
`;

module.exports = {
    schema,
    indexes,
    rules
};