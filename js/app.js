const app = {
    currentView: 'home',

    init: () => {
        console.log("Complai App Initialized (Local Database Mode)");
        app.renderDashboard();
    },

    renderDashboard: () => {
        app.currentView = 'dashboard';
        const main = document.getElementById('main-container');
        main.innerHTML = `
            <div style="max-width: 1000px; margin: 100px auto; padding: 0 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h1>Campus <span class="text-primary">Concerns</span></h1>
                        <p class="text-muted">Track community issues with transparency.</p>
                    </div>
                    <button class="btn btn-primary" onclick="app.showComplaintForm()">
                        <i data-lucide="plus"></i> New Complaint
                    </button>
                </header>
                
                <div id="complaints-list" class="animate-fade-in">
                    <p>Loading complaints...</p>
                </div>
            </div>
        `;
        lucide.createIcons();
        app.fetchComplaints();
    },

    showComplaintForm: () => {
        const main = document.getElementById('main-container');
        main.innerHTML = `
            <div style="max-width: 600px; margin: 120px auto; padding: 0 2rem;">
                <div class="glass-card animate-fade-in">
                    <h2>Submit New Complaint</h2>
                    <form id="complaint-form" style="margin-top: 1.5rem;">
                        <div class="input-group">
                            <label>Full Name</label>
                            <input type="text" id="comp-name" placeholder="Your Name" required>
                        </div>
                        <div class="input-group">
                            <label>Email Address</label>
                            <input type="email" id="comp-email" placeholder="email@college.edu" required>
                        </div>
                        <div class="input-group">
                            <label>Category</label>
                            <select id="comp-category" required>
                                <option value="academic">Academic</option>
                                <option value="facility">Facility</option>
                                <option value="hostel">Hostel</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Subject</label>
                            <input type="text" id="comp-subject" placeholder="Brief summary" required>
                        </div>
                        <div class="input-group">
                            <label>Description</label>
                            <textarea id="comp-desc" rows="4" placeholder="Detailed explanation..." required></textarea>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">Submit</button>
                            <button type="button" class="btn btn-outline" onclick="app.renderDashboard()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('complaint-form').addEventListener('submit', app.handleComplaintSubmit);
    },

    handleComplaintSubmit: async (e) => {
        e.preventDefault();
        const complaintData = {
            studentName: document.getElementById('comp-name').value,
            studentEmail: document.getElementById('comp-email').value,
            category: document.getElementById('comp-category').value,
            subject: document.getElementById('comp-subject').value,
            description: document.getElementById('comp-desc').value,
            status: 'pending'
        };

        try {
            await window.LocalDB.complaints.add(complaintData);
            app.renderDashboard();
        } catch (error) {
            alert("Error submitting complaint: " + error.message);
        }
    },

    fetchComplaints: () => {
        const listDiv = document.getElementById('complaints-list');
        window.LocalDB.complaints.onSnapshot(complaints => {
            if (complaints.length === 0) {
                listDiv.innerHTML = '<div class="glass-card" style="text-align: center;"><p>No complaints found. Help us improve the campus!</p></div>';
                return;
            }

            let html = '';
            complaints.forEach(data => {
                html += `
                    <div class="glass-card" style="margin-bottom: 1rem; padding: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <span class="status-badge status-${data.status}">${data.status}</span>
                                <h3 style="margin: 0.5rem 0;">${data.subject}</h3>
                                <p class="text-muted" style="font-size: 0.9rem;">${data.category.toUpperCase()} • ${data.studentName}</p>
                            </div>
                            <button class="btn btn-outline" onclick="app.viewDetails('${data.id}')">View</button>
                        </div>
                    </div>
                `;
            });
            listDiv.innerHTML = html;
        });
    },

    renderAdminDashboard: () => {
        app.currentView = 'admin-dashboard';
        const main = document.getElementById('main-container');
        main.innerHTML = `
            <div style="max-width: 1200px; margin: 100px auto; padding: 0 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h1>Admin <span class="text-primary">Control Center</span></h1>
                        <p class="text-muted">Manage all campus reports.</p>
                    </div>
                    <button class="btn btn-outline" onclick="app.renderDashboard()">Back to Public View</button>
                </header>
                
                <div id="admin-complaints-list" class="animate-fade-in">
                    <p>Loading complaints...</p>
                </div>
            </div>
        `;
        app.fetchAdminComplaints();
    },

    fetchAdminComplaints: () => {
        const listDiv = document.getElementById('admin-complaints-list');
        window.LocalDB.complaints.onSnapshot(complaints => {
            if (complaints.length === 0) {
                listDiv.innerHTML = '<div class="glass-card" style="text-align: center;"><p>No complaints yet.</p></div>';
                return;
            }
            let html = '';
            complaints.forEach(data => {
                html += `
                    <div class="glass-card" style="margin-bottom: 1rem; padding: 1.5rem;">
                        <span class="status-badge status-${data.status}">${data.status}</span>
                        <h3>${data.subject}</h3>
                        <p class="text-muted">${data.studentName} (${data.studentEmail})</p>
                        <p style="margin: 1rem 0;">${data.description}</p>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-primary btn-sm" onclick="app.updateStatus('${data.id}', 'resolved')">Resolve</button>
                            <button class="btn btn-outline btn-sm" onclick="app.updateStatus('${data.id}', 'rejected')">Reject</button>
                        </div>
                    </div>
                `;
            });
            listDiv.innerHTML = html;
        });
    },

    updateStatus: async (id, status) => {
        try {
            await window.LocalDB.complaints.update(id, { status });
        } catch (error) {
            alert("Error updating status: " + error.message);
        }
    },

    viewDetails: (id) => {
        alert("Detailed view coming soon. Complaint ID: " + id);
    }
};

window.onload = () => app.init();
window.app = app;
