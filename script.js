// Sample Data Storage (In real application, this would be from a database)
let users = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Employee', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Employee', joinDate: '2024-02-01' },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'Student', joinDate: '2024-01-20' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@example.com', role: 'Student', joinDate: '2024-02-10' }
];

let attendance = [
    { id: 1, userId: 1, date: '2024-12-23', status: 'Present', checkIn: '09:00', remarks: 'On time' },
    { id: 2, userId: 2, date: '2024-12-23', status: 'Late', checkIn: '09:45', remarks: 'Traffic delay' },
    { id: 3, userId: 3, date: '2024-12-23', status: 'Present', checkIn: '08:55', remarks: 'Early' }
];

let leaveRequests = [
    { id: 1, userId: 2, type: 'Sick', startDate: '2024-12-24', endDate: '2024-12-25', reason: 'Fever', status: 'Pending' },
    { id: 2, userId: 4, type: 'Casual', startDate: '2024-12-28', endDate: '2024-12-29', reason: 'Family function', status: 'Approved' }
];

// Current user session
let currentUser = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set current date for forms
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
    document.getElementById('leaveStartDate').value = today;
    document.getElementById('leaveEndDate').value = today;

    // Populate year dropdown
    populateYearDropdown();

    // Load initial data
    loadUsers();
    loadDashboardStats();
    loadTodayAttendance();
    loadLeaveRequests();

    // Event Listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Menu Navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });

    // Attendance Form
    document.getElementById('attendanceForm').addEventListener('submit', handleMarkAttendance);

    // Add User
    document.getElementById('addUserBtn').addEventListener('click', showAddUserModal);
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);

    // Apply Leave
    document.getElementById('applyLeaveBtn').addEventListener('click', showApplyLeaveModal);
    document.getElementById('applyLeaveForm').addEventListener('submit', handleApplyLeave);

    // Generate Report
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);

    // Leave Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchLeaveTab(tab);
        });
    });

    // Modal Close Events
    document.querySelectorAll('.close, .close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simple authentication (in real app, this would be server-side)
    if (username === 'admin' && password === 'admin123') {
        currentUser = { username: 'admin', role: 'Administrator' };
        showMainApp();
    } else {
        alert('Invalid credentials! Use: admin / admin123');
    }
}

function handleLogout() {
    currentUser = null;
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('mainApp').classList.remove('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function showMainApp() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');
    showPage('dashboard');
}

function showPage(pageName) {
    // Update active menu item
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    // Update page title
    const pageTitles = {
        dashboard: 'Dashboard',
        attendance: 'Mark Attendance',
        users: 'User Management',
        reports: 'Reports & Analytics',
        leave: 'Leave Management'
    };
    document.getElementById('pageTitle').textContent = pageTitles[pageName];

    // Show selected page
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageName}Page`).classList.add('active');

    // Load page-specific data
    switch(pageName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'attendance':
            loadUsersDropdown('attendanceUser');
            loadTodayAttendance();
            break;
        case 'users':
            loadUsersTable();
            break;
        case 'reports':
            loadUsersDropdown('reportUser');
            break;
        case 'leave':
            loadLeaveUsersDropdown();
            loadLeaveRequests();
            break;
    }
}

function loadDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    
    const presentCount = todayAttendance.filter(a => a.status === 'Present').length;
    const totalUsers = users.length;
    const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending').length;
    const attendanceRate = totalUsers > 0 ? Math.round((presentCount / totalUsers) * 100) : 0;

    document.getElementById('presentCount').textContent = presentCount;
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('pendingLeaves').textContent = pendingLeaves;
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';

    // Load recent activity
    loadRecentActivity();
}

function loadRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = '';

    const recentActivities = [
        { type: 'attendance', user: 'John Doe', action: 'marked present', time: '2 hours ago' },
        { type: 'leave', user: 'Jane Smith', action: 'applied for sick leave', time: '4 hours ago' },
        { type: 'user', user: 'Admin', action: 'added new user Mike Johnson', time: '1 day ago' },
        { type: 'attendance', user: 'Sarah Wilson', action: 'was marked absent', time: '1 day ago' }
    ];

    recentActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <strong>${activity.user}</strong> ${activity.action}
            <span style="float: right; color: #7f8c8d; font-size: 12px;">${activity.time}</span>
        `;
        activityList.appendChild(activityItem);
    });
}

function loadUsers() {
    // Populate users dropdown for attendance
    loadUsersDropdown('attendanceUser');
    loadUsersDropdown('reportUser');
}

function loadUsersDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const currentValue = dropdown.value;
    
    dropdown.innerHTML = dropdownId === 'reportUser' ? '<option value="all">All Users</option>' : '<option value="">Select User</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.role})`;
        dropdown.appendChild(option);
    });
    
    // Restore previous selection if applicable
    if (currentValue && dropdown.querySelector(`option[value="${currentValue}"]`)) {
        dropdown.value = currentValue;
    }
}

function loadLeaveUsersDropdown() {
    const dropdown = document.getElementById('leaveUser');
    dropdown.innerHTML = '<option value="">Select User</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.role})`;
        dropdown.appendChild(option);
    });
}

function handleMarkAttendance(e) {
    e.preventDefault();
    
    const userId = parseInt(document.getElementById('attendanceUser').value);
    const date = document.getElementById('attendanceDate').value;
    const status = document.getElementById('attendanceStatus').value;
    const checkIn = document.getElementById('checkInTime').value;
    const remarks = document.getElementById('remarks').value;

    // Check if attendance already exists for this user and date
    const existingIndex = attendance.findIndex(a => a.userId === userId && a.date === date);
    
    if (existingIndex > -1) {
        // Update existing attendance
        attendance[existingIndex] = {
            ...attendance[existingIndex],
            status,
            checkIn,
            remarks
        };
    } else {
        // Add new attendance
        const newAttendance = {
            id: attendance.length + 1,
            userId,
            date,
            status,
            checkIn,
            remarks
        };
        attendance.push(newAttendance);
    }

    alert('Attendance marked successfully!');
    document.getElementById('attendanceForm').reset();
    document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
    loadTodayAttendance();
    loadDashboardStats();
}

function loadTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(a => a.date === today);
    const tbody = document.querySelector('#todayAttendanceTable tbody');
    
    tbody.innerHTML = '';
    
    todayRecords.forEach(record => {
        const user = users.find(u => u.id === record.userId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user ? user.name : 'Unknown'}</td>
            <td><span class="status-${record.status.toLowerCase()}">${record.status}</span></td>
            <td>${record.checkIn || 'N/A'}</td>
            <td>${record.remarks || '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

function handleAddUser(e) {
    e.preventDefault();
    
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const role = document.getElementById('newUserRole').value;

    const newUser = {
        id: users.length + 1,
        name,
        email,
        role,
        joinDate: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    
    alert('User added successfully!');
    closeAllModals();
    document.getElementById('addUserForm').reset();
    loadUsers();
    loadUsersTable();
    loadDashboardStats();
}

function loadUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.joinDate}</td>
            <td>
                <button class="btn-secondary" onclick="editUser(${user.id})">Edit</button>
                <button class="btn-danger" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showApplyLeaveModal() {
    document.getElementById('applyLeaveModal').style.display = 'block';
}

function handleApplyLeave(e) {
    e.preventDefault();
    
    const userId = parseInt(document.getElementById('leaveUser').value);
    const type = document.getElementById('leaveType').value;
    const startDate = document.getElementById('leaveStartDate').value;
    const endDate = document.getElementById('leaveEndDate').value;
    const reason = document.getElementById('leaveReason').value;

    const newLeaveRequest = {
        id: leaveRequests.length + 1,
        userId,
        type,
        startDate,
        endDate,
        reason,
        status: 'Pending'
    };

    leaveRequests.push(newLeaveRequest);
    
    alert('Leave application submitted successfully!');
    closeAllModals();
    document.getElementById('applyLeaveForm').reset();
    loadLeaveRequests();
    loadDashboardStats();
}

function loadLeaveRequests() {
    const tbody = document.querySelector('#leaveTable tbody');
    tbody.innerHTML = '';
    
    leaveRequests.forEach(leave => {
        const user = users.find(u => u.id === leave.userId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user ? user.name : 'Unknown'}</td>
            <td>${leave.type}</td>
            <td>${leave.startDate}</td>
            <td>${leave.endDate}</td>
            <td>${leave.reason}</td>
            <td><span class="status-${leave.status.toLowerCase()}">${leave.status}</span></td>
            <td>
                ${leave.status === 'Pending' ? `
                    <button class="btn-primary" onclick="updateLeaveStatus(${leave.id}, 'Approved')">Approve</button>
                    <button class="btn-danger" onclick="updateLeaveStatus(${leave.id}, 'Rejected')">Reject</button>
                ` : '-'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateLeaveStatus(leaveId, status) {
    const leaveIndex = leaveRequests.findIndex(l => l.id === leaveId);
    if (leaveIndex > -1) {
        leaveRequests[leaveIndex].status = status;
        loadLeaveRequests();
        loadDashboardStats();
        alert(`Leave ${status.toLowerCase()} successfully!`);
    }
}

function switchLeaveTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Filter leave requests based on tab
    const filteredLeaves = tab === 'all' ? leaveRequests : leaveRequests.filter(l => l.status.toLowerCase() === tab);
    
    const tbody = document.querySelector('#leaveTable tbody');
    tbody.innerHTML = '';
    
    filteredLeaves.forEach(leave => {
        const user = users.find(u => u.id === leave.userId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user ? user.name : 'Unknown'}</td>
            <td>${leave.type}</td>
            <td>${leave.startDate}</td>
            <td>${leave.endDate}</td>
            <td>${leave.reason}</td>
            <td><span class="status-${leave.status.toLowerCase()}">${leave.status}</span></td>
            <td>
                ${leave.status === 'Pending' ? `
                    <button class="btn-primary" onclick="updateLeaveStatus(${leave.id}, 'Approved')">Approve</button>
                    <button class="btn-danger" onclick="updateLeaveStatus(${leave.id}, 'Rejected')">Reject</button>
                ` : '-'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function generateReport() {
    const userId = document.getElementById('reportUser').value;
    const month = parseInt(document.getElementById('reportMonth').value);
    const year = parseInt(document.getElementById('reportYear').value);

    let filteredAttendance = attendance.filter(a => {
        const recordDate = new Date(a.date);
        return recordDate.getMonth() + 1 === month && recordDate.getFullYear() === year;
    });

    if (userId !== 'all') {
        filteredAttendance = filteredAttendance.filter(a => a.userId === parseInt(userId));
    }

    // Update summary
    const totalPresent = filteredAttendance.filter(a => a.status === 'Present').length;
    const totalAbsent = filteredAttendance.filter(a => a.status === 'Absent').length;
    const totalLate = filteredAttendance.filter(a => a.status === 'Late').length;
    const totalRecords = filteredAttendance.length;
    const attendancePercent = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    document.getElementById('totalPresent').textContent = totalPresent;
    document.getElementById('totalAbsent').textContent = totalAbsent;
    document.getElementById('totalLate').textContent = totalLate;
    document.getElementById('attendancePercent').textContent = attendancePercent + '%';

    // Update report table
    const tbody = document.querySelector('#reportsTable tbody');
    tbody.innerHTML = '';
    
    filteredAttendance.forEach(record => {
        const user = users.find(u => u.id === record.userId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${user ? user.name : 'Unknown'}</td>
            <td><span class="status-${record.status.toLowerCase()}">${record.status}</span></td>
            <td>${record.checkIn || 'N/A'}</td>
            <td>${record.remarks || '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

function populateYearDropdown() {
    const yearDropdown = document.getElementById('reportYear');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) {
            option.selected = true;
        }
        yearDropdown.appendChild(option);
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Utility functions for user management
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        document.getElementById('newUserName').value = user.name;
        document.getElementById('newUserEmail').value = user.email;
        document.getElementById('newUserRole').value = user.role;
        showAddUserModal();
        // Note: In a real app, you'd have separate edit functionality
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(u => u.id !== userId);
        loadUsersTable();
        loadUsers();
        loadDashboardStats();
        alert('User deleted successfully!');
    }
}

// Add some CSS for status badges
const style = document.createElement('style');
style.textContent = `
    .status-present { color: #27ae60; font-weight: bold; }
    .status-absent { color: #e74c3c; font-weight: bold; }
    .status-late { color: #f39c12; font-weight: bold; }
    .status-leave { color: #9b59b6; font-weight: bold; }
    .status-pending { color: #f39c12; font-weight: bold; }
    .status-approved { color: #27ae60; font-weight: bold; }
    .status-rejected { color: #e74c3c; font-weight: bold; }
    .btn-danger { background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
`;
document.head.appendChild(style);