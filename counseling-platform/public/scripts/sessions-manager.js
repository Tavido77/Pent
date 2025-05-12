import { SessionsService } from './sessions-service.js';

export class SessionsManager {
    constructor() {
        this.sessionsService = new SessionsService();
        this.initializeEventListeners();
        this.loadUpcomingSessions();
    }

    initializeEventListeners() {
        // Schedule new session button
        const scheduleBtn = document.querySelector('.btn-schedule');
        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', () => this.showScheduleModal());
        }

        // Initialize session action listeners
        document.addEventListener('click', (e) => {
            if (e.target.matches('.cancel-session')) {
                const sessionId = e.target.closest('.appointment-item').dataset.sessionId;
                this.cancelSession(sessionId);
            } else if (e.target.matches('.reschedule-session')) {
                const sessionId = e.target.closest('.appointment-item').dataset.sessionId;
                this.showRescheduleModal(sessionId);
            }
        });
    }

    async loadUpcomingSessions() {
        try {
            const sessions = await this.sessionsService.getUpcomingSessions();
            this.renderSessions(sessions);
        } catch (error) {
            console.error('Error loading sessions:', error);
            // Show error message to user
            this.showNotification('Error loading sessions. Please try again.', 'error');
        }
    }

    renderSessions(sessions) {
        const appointmentList = document.querySelector('.appointment-list');
        if (!appointmentList) return;

        appointmentList.innerHTML = sessions.map(session => `
            <div class="appointment-item" data-session-id="${session.id}">
                <img src="https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}" 
                     alt="Counselor" class="counselor-avatar">
                <div class="appointment-info">
                    <h4 class="counselor-name">Dr. ${session.counselorId}</h4>
                    <p class="appointment-time">${this.formatDateTime(session.date, session.time)}</p>
                </div>
                <div class="appointment-actions">
                    <button class="reschedule-session">
                        <i class="fas fa-calendar-alt"></i>
                    </button>
                    <button class="cancel-session">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <span class="appointment-status status-${session.status}">${session.status}</span>
            </div>
        `).join('');
    }

    showScheduleModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Schedule New Session</h2>
                <form id="scheduleForm">
                    <div class="form-group">
                        <label for="counselor">Select Counselor:</label>
                        <select id="counselor" required>
                            <option value="Sarah Johnson">Dr. Sarah Johnson</option>
                            <option value="Michael Chen">Dr. Michael Chen</option>
                            <option value="Emily Brown">Dr. Emily Brown</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="sessionDate">Date:</label>
                        <input type="date" id="sessionDate" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="sessionTime">Time:</label>
                        <input type="time" id="sessionTime" required>
                    </div>
                    <div class="form-group">
                        <label for="sessionType">Session Type:</label>
                        <select id="sessionType" required>
                            <option value="initial">Initial Consultation</option>
                            <option value="followup">Follow-up Session</option>
                            <option value="emergency">Emergency Session</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancel</button>
                        <button type="submit" class="btn-submit">Schedule</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        const form = modal.querySelector('#scheduleForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            try {
                await this.sessionsService.scheduleSession(
                    formData.get('counselor'),
                    formData.get('sessionDate'),
                    formData.get('sessionTime'),
                    formData.get('sessionType')
                );
                this.showNotification('Session scheduled successfully!', 'success');
                this.loadUpcomingSessions();
                modal.remove();
            } catch (error) {
                this.showNotification('Error scheduling session. Please try again.', 'error');
            }
        });

        // Handle cancel button
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            modal.remove();
        });
    }

    async cancelSession(sessionId) {
        if (!confirm('Are you sure you want to cancel this session?')) return;

        try {
            await this.sessionsService.cancelSession(sessionId);
            this.showNotification('Session cancelled successfully!', 'success');
            this.loadUpcomingSessions();
        } catch (error) {
            this.showNotification('Error cancelling session. Please try again.', 'error');
        }
    }

    showRescheduleModal(sessionId) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Reschedule Session</h2>
                <form id="rescheduleForm">
                    <div class="form-group">
                        <label for="newDate">New Date:</label>
                        <input type="date" id="newDate" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="newTime">New Time:</label>
                        <input type="time" id="newTime" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel">Cancel</button>
                        <button type="submit" class="btn-submit">Reschedule</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        const form = modal.querySelector('#rescheduleForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            
            try {
                await this.sessionsService.rescheduleSession(
                    sessionId,
                    formData.get('newDate'),
                    formData.get('newTime')
                );
                this.showNotification('Session rescheduled successfully!', 'success');
                this.loadUpcomingSessions();
                modal.remove();
            } catch (error) {
                this.showNotification('Error rescheduling session. Please try again.', 'error');
            }
        });

        // Handle cancel button
        modal.querySelector('.btn-cancel').addEventListener('click', () => {
            modal.remove();
        });
    }

    formatDateTime(date, time) {
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return `${formattedDate} - ${time}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
