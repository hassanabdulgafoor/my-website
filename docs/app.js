// Fetch and display users from backend
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const container = document.getElementById('users-container');
        container.innerHTML = '';
        
        users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'user-card';
            userDiv.innerHTML = `
                <h3>${user.username}</h3>
                <p>📧 ${user.email}</p>
                <small>User ID: ${user.id}</small>
            `;
            container.appendChild(userDiv);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('users-container').innerHTML = 
            '<p class="error">Failed to load users. Make sure backend is running.</p>';
    }
}

// Load users when page loads
document.addEventListener('DOMContentLoaded', loadUsers);