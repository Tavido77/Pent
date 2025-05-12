import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getFirestore, collection, query, where, orderBy, getDocs, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { app } from './firebase-config.js';
import { SessionsService } from './sessions-service.js';
import { PatientsService } from './patients-service.js';
import { ChatService } from './chat-service.js';

class CounselorDashboard {
    constructor() {
        this.auth = getAuth(app);
        this.db = getFirestore(app);
        this.sessionsService = new SessionsService();
        this.patientsService = new PatientsService();
        this.chatService = new ChatService();
        this.initializeAuth();
        this.initializeTabNavigation();
        this.setupRealTimeListeners();
        this.setupEventListeners();
        this.initializeCharts();
    }

    initializeAuth() {
        onAuthStateChanged(this.auth, (user) => {
            if (!user) {
                window.location.href = 'counselor-login.html';
                return;
            }

            // Update UI with counselor info
            const userProfile = document.querySelector('.user-profile img');
            const userName = document.querySelector('.user-name');
            if (user.photoURL) {
                userProfile.src = user.photoURL;
            }
            if (user.displayName) {
                userName.textContent = user.displayName;
            }

            // Add logout functionality
            document.querySelector('.nav-menu').insertAdjacentHTML('beforeend', `
                <li class="nav-item">
                    <a href="#" class="nav-link" id="logout">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </a>
                </li>
            `);

            document.getElementById('logout').addEventListener('click', async () => {
                try {
                    await signOut(this.auth);
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Error signing out:', error);
                    this.showNotification('Error signing out. Please try again.', 'error');
                }
            });
        });
    }

    initializeTabNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = link.getAttribute('data-tab');
                
                // Update active states
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show selected tab content
                const tabPanes = document.querySelectorAll('.tab-pane');
                tabPanes.forEach(pane => {
                    if (pane.getAttribute('data-tab') === targetTab) {
                        pane.classList.add('active');
                    } else {
                        pane.classList.remove('active');
                    }
                });
            });
        });
    }

    setupRealTimeListeners() {
        if (!this.auth.currentUser) return;

        // Real-time schedule updates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sessionsRef = collection(this.db, 'sessions');
        const sessionsQuery = query(
            sessionsRef,
            where('counselorId', '==', this.auth.currentUser.uid),
            where('date', '>=', today),
            where('date', '<', tomorrow),
            orderBy('date', 'asc')
        );

        // Listen for schedule changes
        this.unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
            const sessions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderSchedule(sessions);
        }, (error) => {
            console.error('Error in sessions listener:', error);
            this.showNotification('Error updating schedule.', 'error');
        });

        // Listen for patient updates
        const patientsRef = collection(this.db, 'patients');
        const patientsQuery = query(
            patientsRef,
            where('counselorId', '==', this.auth.currentUser.uid)
        );

        this.unsubscribePatients = onSnapshot(patientsQuery, (snapshot) => {
            const patients = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderPatients(patients);
        }, (error) => {
            console.error('Error in patients listener:', error);
            this.showNotification('Error updating patient list.', 'error');
        });
    }

    async handleNewSession(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            const sessionData = {
                patientId: formData.get('patientId'),
                date: new Date(formData.get('date')),
                time: formData.get('time'),
                type: formData.get('type'),
                notes: formData.get('notes')
            };

            await this.sessionsService.scheduleSession(
                this.auth.currentUser.uid,
                sessionData.date,
                sessionData.time,
                sessionData.type
            );

            this.showNotification('Session scheduled successfully!', 'success');
            form.reset();
        } catch (error) {
            console.error('Error scheduling session:', error);
            this.showNotification('Error scheduling session. Please try again.', 'error');
        }
    }

    renderSchedule(sessions) {
        const scheduleContainer = document.querySelector('.schedule-list');
        if (!scheduleContainer) return;

        if (sessions.length === 0) {
            scheduleContainer.innerHTML = '<p>No sessions scheduled for today</p>';
            return;
        }

        const scheduleHTML = sessions.map(session => {
            return `
                <div class="schedule-item">
                    <span class="schedule-time">${this.formatTime(session.startTime)}</span>
                    <span class="schedule-patient">${session.patientName}</span>
                    <span class="schedule-type">${session.type} Session</span>
                </div>
            `;
        }).join('');

        scheduleContainer.innerHTML = scheduleHTML;
    }

    renderPatients(patients) {
        const patientsGrid = document.querySelector('.patients-grid');
        if (!patientsGrid) return;

        patientsGrid.innerHTML = patients.map(patient => {
            const lastVisit = patient.lastVisit ? new Date(patient.lastVisit.seconds * 1000).toLocaleDateString() : 'Never';
            return `
                <div class="patient-card" data-patient-id="${patient.id}">
                    <div class="patient-info">
                        <h3>${patient.name}</h3>
                        <p class="patient-id">${patient.id}</p>
                        <p class="patient-email">${patient.email}</p>
                        <p class="patient-details">
                            <span class="detail"><i class="fas fa-calendar"></i> Last Visit: ${lastVisit}</span>
                            <span class="detail"><i class="fas fa-file-medical"></i> Total Sessions: ${patient.totalSessions || 0}</span>
                        </p>
                    </div>
                    <div class="patient-actions">
                        <button class="btn-secondary btn-chat" data-patient-id="${patient.id}">
                            <i class="fas fa-comments"></i>
                        </button>
                        <button class="btn-primary btn-view" data-patient-id="${patient.id}">
                            View Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for patient actions
        this.setupPatientEventListeners();
    }

    setupSessionEventListeners() {
        const rescheduleButtons = document.querySelectorAll('.btn-reschedule');
        rescheduleButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const sessionId = button.getAttribute('data-session-id');
                try {
                    await this.sessionsService.rescheduleSession(sessionId);
                    this.showNotification('Session rescheduled successfully!', 'success');
                } catch (error) {
                    console.error('Error rescheduling session:', error);
                    this.showNotification('Error rescheduling session. Please try again.', 'error');
                }
            });
        });

        const cancelButtons = document.querySelectorAll('.btn-cancel');
        cancelButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const sessionId = button.getAttribute('data-session-id');
                try {
                    await this.sessionsService.cancelSession(sessionId);
                    this.showNotification('Session cancelled successfully!', 'success');
                } catch (error) {
                    console.error('Error cancelling session:', error);
                    this.showNotification('Error cancelling session. Please try again.', 'error');
                }
            });
        });
    }

    setupPatientEventListeners() {
        const chatButtons = document.querySelectorAll('.btn-chat');
        chatButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const patientId = button.getAttribute('data-patient-id');
                try {
                    await this.chatService.startChat(patientId);
                    this.showNotification('Chat started successfully!', 'success');
                } catch (error) {
                    console.error('Error starting chat:', error);
                    this.showNotification('Error starting chat. Please try again.', 'error');
                }
            });
        });

        const viewButtons = document.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const patientId = button.getAttribute('data-patient-id');
                try {
                    await this.patientsService.viewPatientProfile(patientId);
                    this.showNotification('Patient profile viewed successfully!', 'success');
                } catch (error) {
                    console.error('Error viewing patient profile:', error);
                    this.showNotification('Error viewing patient profile. Please try again.', 'error');
                }
            });
        });
    }

    async loadPatients() {
        try {
            const patientsRef = collection(this.db, 'patients');
            const q = query(
                patientsRef,
                where('counselorId', '==', this.auth.currentUser.uid),
                orderBy('lastSession', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const patients = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.renderPatients(patients);
        } catch (error) {
            console.error('Error loading patients:', error);
            this.showNotification('Error loading patients. Please try again.', 'error');
        }
    }

    initializeCharts() {
        // Session Types Chart
        const sessionCtx = document.getElementById('sessionChart').getContext('2d');
        new Chart(sessionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Academic', 'Career', 'Personal'],
                datasets: [{
                    data: [40, 35, 25],
                    backgroundColor: ['#4caf50', '#2196f3', '#ff9800']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-bar input');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const patientCards = document.querySelectorAll('.patient-card');
            
            patientCards.forEach(card => {
                const patientName = card.querySelector('.patient-info h3').textContent.toLowerCase();
                const patientId = card.querySelector('.patient-id').textContent.toLowerCase();
                
                if (patientName.includes(searchTerm) || patientId.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Settings form submissions
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showNotification('Profile updated successfully!', 'success');
            });
        }

        const availabilityForm = document.getElementById('availabilityForm');
        if (availabilityForm) {
            availabilityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showNotification('Availability updated successfully!', 'success');
            });
        }
    }

    formatTime(time) {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    new CounselorDashboard();
});
