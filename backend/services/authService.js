const { admin, db } = require('../config/firebase');

class AuthService {
    constructor() {
        this.auth = admin.auth();
        this.usersCollection = db.collection('users');
    }

    async createUser(userData) {
        try {
            // Create Firebase Auth user
            const userRecord = await this.auth.createUser({
                email: userData.email,
                password: userData.password,
                displayName: userData.name,
                emailVerified: false
            });

            // Create user document in Firestore
            await this.usersCollection.doc(userRecord.uid).set({
                email: userData.email,
                name: userData.name,
                language: userData.language || 'en',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastActive: admin.firestore.FieldValue.serverTimestamp(),
                reports: [],
                payments: []
            });

            return userRecord;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async getUserProfile(uid) {
        try {
            const userDoc = await this.usersCollection.doc(uid).get();
            if (!userDoc.exists) {
                throw new Error('User not found');
            }
            return userDoc.data();
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    async updateUserProfile(uid, updateData) {
        try {
            const updates = {
                ...updateData,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await this.usersCollection.doc(uid).update(updates);
            
            // Update Auth profile if needed
            if (updateData.email || updateData.name) {
                await this.auth.updateUser(uid, {
                    email: updateData.email,
                    displayName: updateData.name
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    async updateLastActive(uid) {
        try {
            await this.usersCollection.doc(uid).update({
                lastActive: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating last active:', error);
        }
    }

    async deleteUser(uid) {
        try {
            // Delete from Firebase Auth
            await this.auth.deleteUser(uid);
            
            // Delete user document
            await this.usersCollection.doc(uid).delete();
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    async getUserReports(uid) {
        try {
            const userDoc = await this.usersCollection.doc(uid).get();
            if (!userDoc.exists) {
                throw new Error('User not found');
            }
            
            const reports = userDoc.data().reports || [];
            return reports;
        } catch (error) {
            console.error('Error getting user reports:', error);
            throw error;
        }
    }

    async addReportToUser(uid, reportId) {
        try {
            await this.usersCollection.doc(uid).update({
                reports: admin.firestore.FieldValue.arrayUnion(reportId),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Error adding report to user:', error);
            throw error;
        }
    }

    async verifyEmail(email) {
        try {
            const actionCodeSettings = {
                url: process.env.EMAIL_VERIFICATION_REDIRECT_URL,
                handleCodeInApp: true
            };

            await this.auth.generateEmailVerificationLink(email, actionCodeSettings);
            return { success: true };
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw error;
        }
    }

    async resetPassword(email) {
        try {
            const actionCodeSettings = {
                url: process.env.PASSWORD_RESET_REDIRECT_URL,
                handleCodeInApp: true
            };

            await this.auth.generatePasswordResetLink(email, actionCodeSettings);
            return { success: true };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();