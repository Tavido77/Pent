import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

export class SessionsService {
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
        this.sessionsCollection = collection(this.db, 'sessions');
    }

    async scheduleSession(counselorId, patientId, date, time, type, notes = '') {
        try {
            if (!this.auth.currentUser?.uid) throw new Error('User not authenticated');

            const sessionData = {
                counselorId,
                userId: patientId,
                date,
                time,
                type,
                notes,
                status: 'scheduled',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const docRef = await addDoc(this.sessionsCollection, sessionData);
            return { id: docRef.id, ...sessionData };
        } catch (error) {
            console.error('Error scheduling session:', error);
            throw error;
        }
    }

    async getUpcomingSessions(userType = 'student') {
        try {
            const userId = this.auth.currentUser?.uid;
            if (!userId) throw new Error('User not authenticated');

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const conditions = [
                where('status', '==', 'scheduled'),
                where('date', '>=', today),
                orderBy('date', 'asc'),
                orderBy('time', 'asc')
            ];

            if (userType === 'student') {
                conditions.push(where('userId', '==', userId));
            } else {
                conditions.push(where('counselorId', '==', userId));
            }

            const q = query(this.sessionsCollection, ...conditions);
            const querySnapshot = await getDocs(q);
            
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            }));
        } catch (error) {
            console.error('Error getting upcoming sessions:', error);
            throw error;
        }
    }

    async getPastSessions(userType = 'student') {
        try {
            const userId = this.auth.currentUser?.uid;
            if (!userId) throw new Error('User not authenticated');

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const conditions = [
                where('status', '==', 'completed'),
                where('date', '<', today),
                orderBy('date', 'desc')
            ];

            if (userType === 'student') {
                conditions.push(where('userId', '==', userId));
            } else {
                conditions.push(where('counselorId', '==', userId));
            }

            const q = query(this.sessionsCollection, ...conditions);
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            }));
        } catch (error) {
            console.error('Error getting past sessions:', error);
            throw error;
        }
    }

    async cancelSession(sessionId) {
        try {
            const userId = this.auth.currentUser?.uid;
            if (!userId) throw new Error('User not authenticated');

            const sessionRef = doc(this.db, 'sessions', sessionId);
            await updateDoc(sessionRef, {
                status: 'cancelled',
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error cancelling session:', error);
            throw error;
        }
    }

    async rescheduleSession(sessionId, newDate, newTime) {
        try {
            const userId = this.auth.currentUser?.uid;
            if (!userId) throw new Error('User not authenticated');

            const sessionRef = doc(this.db, 'sessions', sessionId);
            await updateDoc(sessionRef, {
                date: newDate,
                time: newTime,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error rescheduling session:', error);
            throw error;
        }
    }

    async getTodaysSessions() {
        try {
            const userId = this.auth.currentUser?.uid;
            if (!userId) throw new Error('User not authenticated');

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const q = query(
                this.sessionsCollection,
                where('counselorId', '==', userId),
                where('date', '>=', today),
                where('date', '<', tomorrow),
                where('status', '==', 'scheduled'),
                orderBy('date', 'asc'),
                orderBy('time', 'asc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            }));
        } catch (error) {
            console.error('Error getting today\'s sessions:', error);
            throw error;
        }
    }

    async getSessionStats() {
        try {
            const userId = this.auth.currentUser?.uid;
            if (!userId) throw new Error('User not authenticated');

            const q = query(
                this.sessionsCollection,
                where('counselorId', '==', userId)
            );

            const querySnapshot = await getDocs(q);
            const sessions = querySnapshot.docs.map(doc => doc.data());

            // Calculate session type distribution
            const typeStats = sessions.reduce((acc, session) => {
                acc[session.type] = (acc[session.type] || 0) + 1;
                return acc;
            }, {});

            // Calculate total sessions
            const totalSessions = sessions.length;

            // Calculate completion rate
            const completedSessions = sessions.filter(s => s.status === 'completed').length;
            const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

            return {
                totalSessions,
                completedSessions,
                completionRate,
                typeDistribution: typeStats
            };
        } catch (error) {
            console.error('Error getting session stats:', error);
            throw error;
        }
    }
}
