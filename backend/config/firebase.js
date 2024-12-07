const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://who-im-XXXXX.firebaseio.com'  // Replace with your Firebase URL
});

// Initialize Firestore
const db = admin.firestore();
const auth = admin.auth();

// Collections references
const collections = {
    payments: db.collection('payments'),
    users: db.collection('users'),
    reports: db.collection('reports'),
    transactions: db.collection('transactions')
};

// Helper functions for common Firebase operations
const firebaseHelper = {
    // Create a new document with auto-generated ID
    async createDoc(collectionName, data) {
        const docRef = collections[collectionName].doc();
        await docRef.set({
            ...data,
            id: docRef.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return docRef.id;
    },

    // Create a document with specific ID
    async createDocWithId(collectionName, id, data) {
        await collections[collectionName].doc(id).set({
            ...data,
            id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return id;
    },

    // Update a document
    async updateDoc(collectionName, id, data) {
        await collections[collectionName].doc(id).update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return id;
    },

    // Get a document by ID
    async getDoc(collectionName, id) {
        const doc = await collections[collectionName].doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    // Delete a document
    async deleteDoc(collectionName, id) {
        await collections[collectionName].doc(id).delete();
        return id;
    },

    // Query documents
    async queryDocs(collectionName, conditions = []) {
        let query = collections[collectionName];
        
        conditions.forEach(condition => {
            query = query.where(condition.field, condition.operator, condition.value);
        });

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Batch write operations
    async batchOperation(operations) {
        const batch = db.batch();
        
        operations.forEach(op => {
            const ref = collections[op.collection].doc(op.id);
            switch (op.type) {
                case 'set':
                    batch.set(ref, { ...op.data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
                    break;
                case 'update':
                    batch.update(ref, { ...op.data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
                    break;
                case 'delete':
                    batch.delete(ref);
                    break;
            }
        });

        await batch.commit();
    }
};

module.exports = {
    admin,
    db,
    auth,
    collections,
    firebaseHelper
};