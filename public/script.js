const API_BASE_URL = 'http://localhost:4000';

// Signup function
async function signup(event) {
    event.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const gender = document.getElementById('signupGender').value;

    const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, gender })
    });
    
    const data = await response.json();

    if (response.ok) {
        alert(data.message);
        window.location.href = 'login.html';
    } else {
        alert(data.message || 'Signup failed');
    }
}




// Login function
async function login(event) {
    event.preventDefault(); 
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = 'profile.html';
    } else {
        alert(data.message || 'Login failed');
    }
}

// Fetch Profile function
async function getProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: { 'Authorization': `${token}` }
    });

    const data = await response.json();

    if (response.ok) {
        const user = data.user;
        const profileInfo = document.getElementById('profileInfo');

        profileInfo.innerHTML = `
            <div class="user-card">
                <h3>${user.name}</h3>
                <p>${user.email}</p>
            </div>
            <div class="posts-container">
                <h4>User's Posts:</h4>
                ${user.posts.map(post => `
                    <div class="post">
                        <p>${post.content}</p>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        alert(data.message);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}



// Create Post function
async function createPost(event) {
    event.preventDefault(); // Prevent form from reloading the page

    const postContent = document.getElementById('postContent').value;
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You are not authorized!');
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch(`${API_BASE_URL}/user/create-post`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
        },
        body: JSON.stringify({ content: postContent })
    });

    const data = await response.json();

    if (response.ok) {
        alert('Post created successfully!');
        document.getElementById('postContent').value = ''; 
        getProfile(); // Refresh the profile to show the new post
    } else {
        alert(data.message || 'Failed to create post');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token'); // Clear token from local storage
    window.location.href = 'login.html';
}


// Redirect to the update page
function redirectToUpdatePage() {
    window.location.href = 'update.html';
}

// Update user information function
async function updateUser(event) {
    event.preventDefault(); 

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You are not authorized!');
        window.location.href = 'login.html';
        return;
    }

    const userId = getUserIdFromToken(token); // Decode user ID from the token

    const updatedData = {
        name: document.getElementById('updateName').value,
        password: document.getElementById('updatePassword').value,
        gender: document.getElementById('updateGender').value,
    };

    const response = await fetch(`${API_BASE_URL}/user/update-profile/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
        },
        body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    if (response.ok) {
        alert('Profile updated successfully!');
        window.location.href = 'profile.html'; // Redirect to profile page
    } else {
        alert(data.message || 'Failed to update profile');
    }
}

// Delete User function
async function deleteUser() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You are not authorized!');
        window.location.href = 'login.html';
        return;
    }

    const confirmDelete = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmDelete) return;

    const userId = getUserIdFromToken(token); // Function to decode user ID from token

    const response = await fetch(`${API_BASE_URL}/user/delete-profile/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (response.ok) {
        alert('User account deleted successfully!');
        localStorage.removeItem('token'); // Clear the token
        window.location.href = 'signup.html'; // Redirect to signup page
    } else {
        alert(data.message || 'Failed to delete user');
    }
}

// Helper function to decode user ID from JWT token
function getUserIdFromToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
}

// Auto-redirect based on token
window.onload = function() {
    const token = localStorage.getItem('token');
    if (token && (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html'))) {
        window.location.href = 'profile.html';
    } else if (window.location.pathname.endsWith('profile.html')) {
        getProfile(); 
    }
};

