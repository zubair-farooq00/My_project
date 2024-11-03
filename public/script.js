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
        window.location.href = 'timeline.html';
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
        const post = document.getElementById('post');

        profileInfo.innerHTML = `
            <div class="user-card">
                <h3>${user.name}</h3>
                <p>${user.email}</p>
            </div>
        `;
        post.innerHTML = `
        <div class="posts-container">
            ${user.posts.map((post, index) => `
            <div class="post">

                <h4>${user.name}</h4>
                <div class="btn">
                    <button onclick="deletePost(${index})"><i class="fa-solid fa-trash"></i></button>
                    <button onclick="openUpdateModal(${index}, '${post.content}')"><i class="fa-solid fa-pen-to-square"></i></button>
                </div>
                
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
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

// Fetch all posts from other users
async function getTimelinePosts() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You are not authorized!');
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch(`${API_BASE_URL}/all-posts`, {
        method: 'GET',
        headers: { 'Authorization': `${token}` }
    });

    const data = await response.json();

    if (response.ok) {
        const timelineContainer = document.getElementById('timelineContainer');

        timelineContainer.innerHTML = data.allPosts.map(user => `
            <div class="user-timeline">
                ${user.posts.map(post => `
                    <div class="post">
                        <h3>${user.userName}</h3>
                        <p>${post.content}</p>
                        ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
                        <p>Likes: ${post.likes}</p>
                        <button onclick="likePost('${user._id}', '${post._id}')">Like</button>
                        <button onclick="unlikePost('${user._id}', '${post._id}')">Unlike</button>
                    </div>
                `).join('')}
            </div>
        `).join('');
    } else {
        alert(data.message || 'Failed to load timeline');
    }
}

// Like a post by another user
async function likePost(creatorId, postId) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/user/like-post/${creatorId}/${postId}`, {
        method: 'POST',
        headers: { 'Authorization': `${token}` }
    });

    const data = await response.json();

    if (response.ok) {
        getTimelinePosts(); // Refresh the timeline to show updated like count
    } else {
        alert(data.message || 'Failed to like post');
    }
}

// Unlike a post by another user
async function unlikePost(creatorId, postId) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/user/unlike-post/${creatorId}/${postId}`, {
        method: 'POST',
        headers: { 'Authorization': `${token}` }
    });

    const data = await response.json();

    if (response.ok) {
        getTimelinePosts(); // Refresh the timeline to show updated like count
    } else {
        alert(data.message || 'Failed to unlike post');
    }
}


// Create Post function
async function createPost(event) {
    event.preventDefault();

    const postContent = document.getElementById('postContent').value;
    const postImage = document.getElementById('postImage').files[0];
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You are not authorized!');
        window.location.href = 'login.html';
        return;
    }

    const formData = new FormData();
    formData.append('content', postContent);
    if (postImage) {
        formData.append('image', postImage); // Attach the image file if provided
    }

    const response = await fetch(`${API_BASE_URL}/user/create-post`, {
        method: 'POST',
        headers: {
            'Authorization': `${token}`
        },
        body: formData
    });

    const data = await response.json();

    if (response.ok) {
        document.getElementById('postContent').value = ''; 
        document.getElementById('postImage').value = ''; 
        getProfile(); // Refresh the profile to show the new post
    } else {
        alert(data.message || 'Failed to create post');
    }
}


// Modal section start
let currentPostIndex = null; 

// Open the modal and set the content for the selected post
function openUpdateModal(index, currentContent) {
    currentPostIndex = index;
    document.getElementById('updatePostContent').value = currentContent;
    document.getElementById('updateModal').style.display = 'block';
}

// Close the modal
function closeModal() {
    document.getElementById('updateModal').style.display = 'none';
    document.getElementById('updatePostContent').value = ''; // Clear content for future updates
    currentPostIndex = null; // Reset the post index
}


// Submit the updated post content
async function submitUpdate() {
    const updatedContent = document.getElementById('updatePostContent').value;
    if (!updatedContent) {
        alert("Please enter content to update.");
        return;
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/user/update-post/${currentPostIndex}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
        },
        body: JSON.stringify({ content: updatedContent })
    });

    const data = await response.json();
    if (response.ok) {
        closeModal();
        getProfile(); 
    } else {
        alert(data.message || 'Failed to update post');
    }
}
// Delete post section 
async function deletePost(index) {
    const confirmed = confirm('Are you sure to you want to delete this post?');
    if(!confirmed)return;
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/user/delete-post/${index}`, {
        method: 'DELETE',
        headers: { 'Authorization': `${token}` }
    });

    const data = await response.json();

    if (response.ok) {
        getProfile(); // Refresh posts after deletion
    } else {
        alert(data.message);
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
};

//redirect to profile
function MyProfile() {
    window.location.href = 'profile.html';
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

    const userId = getUserIdFromToken(token);

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

async function requestPasswordReset(event) {
    event.preventDefault();
    const email = document.getElementById('forgotEmail').value;

    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (response.ok) {
        alert(data.message);
    } else {
        alert(data.message || 'Failed to send reset email');
    }
}

// Helper function to decode user ID from JWT token
function getUserIdFromToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
}

window.onload = function() {
    const token = localStorage.getItem('token');
    if (token && (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html'))) {
        window.location.href = 'profile.html';
    } else if (window.location.pathname.endsWith('profile.html')) {
        getProfile(); 
    } else if (window.location.pathname.endsWith('timeline.html')) {
        getTimelinePosts();
    }
};
