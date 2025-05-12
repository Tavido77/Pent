import { getFirestore, collection, doc, getDoc, getDocs, query, where, orderBy, updateDoc, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

export class PatientsService {
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
        this.patientsCollection = collection(this.db, 'patients');
        this.sessionsCollection = collection(this.db, 'sessions');
        this.progressCollection = collection(this.db, 'progress');
    }

    async getPatientsList(searchTerm = '') {
        try {
            const counselorId = this.auth.currentUser?.uid;
            if (!counselorId) throw new Error('Counselor not authenticated');

            const q = query(
                this.patientsCollection,
                where('counselorId', '==', counselorId),
                orderBy('lastVisit', 'desc')
            );

            const querySnapshot = await getDocs(q);
            let patients = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                lastVisit: doc.data().lastVisit?.toDate() || null
            }));

            // Filter by search term if provided
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                patients = patients.filter(patient => 
                    patient.name?.toLowerCase().includes(term) ||
                    patient.email?.toLowerCase().includes(term) ||
                    patient.notes?.toLowerCase().includes(term)
                );
            }

            return patients;
        } catch (error) {
            console.error('Error getting patients list:', error);
            throw error;
        }
    }

    async getPatientDetails(patientId) {
        try {
            const counselorId = this.auth.currentUser?.uid;
            if (!counselorId) throw new Error('Counselor not authenticated');

            const patientRef = doc(this.db, 'patients', patientId);
            const patientDoc = await getDoc(patientRef);

            if (!patientDoc.exists()) {
                throw new Error('Patient not found');
            }

            const patientData = patientDoc.data();
            if (patientData.counselorId !== counselorId) {
                throw new Error('Unauthorized access to patient data');
            }

            // Get patient's sessions
            const sessionsRef = collection(this.db, 'sessions');
            const sessionsQuery = query(
                sessionsRef,
                where('patientId', '==', patientId),
                orderBy('date', 'desc')
            );
            const sessionsSnapshot = await getDocs(sessionsQuery);
            const sessions = sessionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get patient's progress records
            const progressRef = collection(this.db, 'progress');
            const progressQuery = query(
                progressRef,
                where('patientId', '==', patientId),
                orderBy('date', 'desc')
            );
            const progressSnapshot = await getDocs(progressQuery);
            const progress = progressSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                ...patientData,
                sessions,
                progress
            };
        } catch (error) {
            console.error('Error getting patient details:', error);
            throw error;
        }
    }

    async updatePatientNotes(patientId, notes) {
        try {
            const counselorId = this.auth.currentUser?.uid;
            if (!counselorId) throw new Error('Counselor not authenticated');

            const patientRef = doc(this.db, 'patients', patientId);
            const patientDoc = await getDoc(patientRef);

            if (!patientDoc.exists() || patientDoc.data().counselorId !== counselorId) {
                throw new Error('Unauthorized access to patient data');
            }

            await updateDoc(patientRef, {
                notes,
                updatedAt: new Date()
            });

            return true;
        } catch (error) {
            console.error('Error updating patient notes:', error);
            throw error;
        }
    }

    async addProgressRecord(patientId, record) {
        try {
            const counselorId = this.auth.currentUser?.uid;
            if (!counselorId) throw new Error('Counselor not authenticated');

            const patientRef = doc(this.db, 'patients', patientId);
            const patientDoc = await getDoc(patientRef);

            if (!patientDoc.exists() || patientDoc.data().counselorId !== counselorId) {
                throw new Error('Unauthorized access to patient data');
            }

            const progressData = {
                patientId,
                counselorId,
                ...record,
                date: new Date(),
                createdAt: new Date()
            };

            const docRef = await addDoc(collection(this.db, 'progress'), progressData);
            return { id: docRef.id, ...progressData };
        } catch (error) {
            console.error('Error adding progress record:', error);
            throw error;
        }
    }

    async getPatientSummaries() {
        try {
            const counselorId = this.auth.currentUser?.uid;
            if (!counselorId) throw new Error('Counselor not authenticated');

            // Get all patients
            const patientsQuery = query(
                this.patientsCollection,
                where('counselorId', '==', counselorId)
            );
            const patientsSnapshot = await getDocs(patientsQuery);
            const patients = patientsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get all sessions for these patients
            const patientIds = patients.map(p => p.id);
            const sessionsQuery = query(
                this.sessionsCollection,
                where('userId', 'in', patientIds),
                orderBy('date', 'desc')
            );
            const sessionsSnapshot = await getDocs(sessionsQuery);
            const sessions = sessionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            }));

            // Get all progress records
            const progressQuery = query(
                this.progressCollection,
                where('patientId', 'in', patientIds),
                orderBy('date', 'desc')
            );
            const progressSnapshot = await getDocs(progressQuery);
            const progress = progressSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            }));

            // Create patient summaries
            return patients.map(patient => {
                const patientSessions = sessions.filter(s => s.userId === patient.id);
                const patientProgress = progress.filter(p => p.patientId === patient.id);
                const lastSession = patientSessions[0];
                const lastProgress = patientProgress[0];

                return {
                    id: patient.id,
                    name: patient.name,
                    email: patient.email,
                    phone: patient.phone,
                    lastVisit: lastSession?.date || null,
                    nextSession: patientSessions.find(s => 
                        s.date >= new Date() && s.status === 'scheduled'
                    )?.date || null,
                    totalSessions: patientSessions.length,
                    completedSessions: patientSessions.filter(s => s.status === 'completed').length,
                    lastProgress: lastProgress ? {
                        date: lastProgress.date,
                        score: lastProgress.score,
                        notes: lastProgress.notes
                    } : null,
                    status: this._calculatePatientStatus(patientSessions, patientProgress)
                };
            });
        } catch (error) {
            console.error('Error getting patient summaries:', error);
            throw error;
        }
    }

    _calculatePatientStatus(sessions, progress) {
        if (!sessions.length) return 'new';
        
        const lastSession = sessions[0];
        const today = new Date();
        const daysSinceLastSession = Math.floor((today - lastSession.date) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastSession > 30) return 'inactive';
        if (progress.length >= 2) {
            const latestScore = progress[0].score;
            const previousScore = progress[1].score;
            if (latestScore > previousScore) return 'improving';
            if (latestScore < previousScore) return 'declining';
        }
        return 'active';
    }

    async getPatientAnalytics(patientId) {
        try {
            const counselorId = this.auth.currentUser?.uid;
            if (!counselorId) throw new Error('Counselor not authenticated');

            const patientRef = doc(this.db, 'patients', patientId);
            const patientDoc = await getDoc(patientRef);

            if (!patientDoc.exists() || patientDoc.data().counselorId !== counselorId) {
                throw new Error('Unauthorized access to patient data');
            }

            // Get all progress records
            const progressQuery = query(
                this.progressCollection,
                where('patientId', '==', patientId),
                orderBy('date', 'asc')
            );
            const progressSnapshot = await getDocs(progressQuery);
            const progressData = progressSnapshot.docs.map(doc => ({
                ...doc.data(),
                date: doc.data().date.toDate()
            }));

            // Get all sessions
            const sessionsQuery = query(
                this.sessionsCollection,
                where('userId', '==', patientId),
                orderBy('date', 'asc')
            );
            const sessionsSnapshot = await getDocs(sessionsQuery);
            const sessionsData = sessionsSnapshot.docs.map(doc => ({
                ...doc.data(),
                date: doc.data().date.toDate()
            }));

            // Calculate analytics
            const analytics = {
                totalSessions: sessionsData.length,
                completedSessions: sessionsData.filter(s => s.status === 'completed').length,
                cancelledSessions: sessionsData.filter(s => s.status === 'cancelled').length,
                progressTrend: progressData.map(p => ({
                    date: p.date,
                    score: p.score,
                    notes: p.notes
                })),
                sessionTypes: sessionsData.reduce((acc, session) => {
                    acc[session.type] = (acc[session.type] || 0) + 1;
                    return acc;
                }, {}),
                lastVisit: sessionsData.length > 0 ? sessionsData[sessionsData.length - 1].date : null,
                upcomingSessions: sessionsData.filter(s => {
                    const sessionDate = new Date(s.date);
                    return sessionDate >= new Date() && s.status === 'scheduled';
                }).length,
                averageProgress: progressData.length > 0 
                    ? progressData.reduce((sum, p) => sum + p.score, 0) / progressData.length 
                    : 0
            };

            return analytics;
        } catch (error) {
            console.error('Error getting patient analytics:', error);
            throw error;
        }
    }
}
