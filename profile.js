// Profile.js - JavaScript for the User Profile & Settings page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('fullname') || localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the profile page
    initProfilePage();
});

// Initialize profile page
function initProfilePage() {
    // Load user profile data
    loadProfileData();
    
    // Load settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
}

// Load user profile data from registration info and localStorage
function loadProfileData() {
    const currentUsername = localStorage.getItem('username');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentUser = users.find(user => user.username === currentUsername);
    
    if (currentUser) {
        // Set form values from registration data
        document.getElementById('profile-name').value = currentUser.fullname || '';
        document.getElementById('profile-email').value = currentUser.email || '';
        
        // Get additional profile data specific to this user
        const profileData = getUserProfileData();
        document.getElementById('profile-phone').value = profileData.phone || '';
    }
}

// Get user-specific profile data from localStorage
function getUserProfileData() {
    const currentUsername = localStorage.getItem('username');
    const allUserProfiles = JSON.parse(localStorage.getItem('allUserProfiles') || '{}');
    
    // Get this user's profile or create empty one if not exists
    if (!allUserProfiles[currentUsername]) {
        allUserProfiles[currentUsername] = {
            phone: ''
        };
        localStorage.setItem('allUserProfiles', JSON.stringify(allUserProfiles));
    }
    
    return allUserProfiles[currentUsername];
}

// Save user-specific profile data to localStorage
function saveUserProfileData(profileData) {
    const currentUsername = localStorage.getItem('username');
    const allUserProfiles = JSON.parse(localStorage.getItem('allUserProfiles') || '{}');
    
    // Update this user's profile
    allUserProfiles[currentUsername] = profileData;
    
    // Save back to localStorage
    localStorage.setItem('allUserProfiles', JSON.stringify(allUserProfiles));
}

// Load user-specific settings from localStorage
function loadSettings() {
    const settings = getUserSettings();
    
    // Set theme toggle
    document.getElementById('theme-toggle').checked = settings.darkMode;
    
    // Apply theme
    applyTheme(settings.darkMode);
    
    // Set notifications toggle
    document.getElementById('notifications-toggle').checked = settings.notifications;
}

// Get user-specific settings from localStorage
function getUserSettings() {
    const currentUsername = localStorage.getItem('username');
    const allUserSettings = JSON.parse(localStorage.getItem('allUserSettings') || '{}');
    
    // Get this user's settings or create default if not exists
    if (!allUserSettings[currentUsername]) {
        allUserSettings[currentUsername] = {
            darkMode: true,
            notifications: true
        };
        localStorage.setItem('allUserSettings', JSON.stringify(allUserSettings));
    }
    
    return allUserSettings[currentUsername];
}

// Save user-specific settings to localStorage
function saveUserSettings(settings) {
    const currentUsername = localStorage.getItem('username');
    const allUserSettings = JSON.parse(localStorage.getItem('allUserSettings') || '{}');
    
    // Update this user's settings
    allUserSettings[currentUsername] = settings;
    
    // Save back to localStorage
    localStorage.setItem('allUserSettings', JSON.stringify(allUserSettings));
}

// Apply theme based on dark mode setting
function applyTheme(darkMode) {
    if (darkMode) {
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('profile-name').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const phone = document.getElementById('profile-phone').value.trim();
        const password = document.getElementById('profile-password').value.trim();
        const confirmPassword = document.getElementById('profile-confirm-password').value.trim();
        
        // Validate form
        if (!validateProfileForm(name, email, phone, password, confirmPassword)) {
            return;
        }
        
        // Create profile data object
        const profileData = {
            phone
        };
        
        // Save profile data
        saveUserProfileData(profileData);
        
        // Update user in users array
        const currentUsername = localStorage.getItem('username');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(user => user.username === currentUsername);
        
        if (userIndex !== -1) {
            users[userIndex].fullname = name;
            users[userIndex].email = email;
            
            // Update password if provided
            if (password) {
                users[userIndex].password = password;
            }
            
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update stored fullname in localStorage 
            localStorage.setItem('fullname', name);
            document.getElementById('username').textContent = name;
        }
        
        // Show success message
        showSuccessMessage('profile-success', 'Profile updated successfully!');
        
        // Clear password fields
        document.getElementById('profile-password').value = '';
        document.getElementById('profile-confirm-password').value = '';
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('change', function() {
        const darkMode = this.checked;
        
        // Apply theme
        applyTheme(darkMode);
        
        // Save setting
        const settings = getUserSettings();
        settings.darkMode = darkMode;
        saveUserSettings(settings);
    });
    
    // Notifications toggle
    const notificationsToggle = document.getElementById('notifications-toggle');
    notificationsToggle.addEventListener('change', function() {
        const notifications = this.checked;
        
        // Save setting
        const settings = getUserSettings();
        settings.notifications = notifications;
        saveUserSettings(settings);
    });
    
    // Delete account button
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    deleteAccountBtn.addEventListener('click', function() {
        // Show confirmation modal
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.classList.add('active');
    });
    
    // Close modal button
    const closeModalBtn = document.getElementById('close-modal');
    closeModalBtn.addEventListener('click', function() {
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.classList.remove('active');
    });
    
    // Cancel button in modal
    const cancelBtn = document.getElementById('cancel-btn');
    cancelBtn.addEventListener('click', function() {
        const confirmModal = document.getElementById('confirm-modal');
        confirmModal.classList.remove('active');
    });
    
    // Confirm delete button in modal
    const confirmBtn = document.getElementById('confirm-btn');
    confirmBtn.addEventListener('click', function() {
        // Delete account
        deleteAccount();
    });
    
    // Handle sidebar toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// Validate profile form
function validateProfileForm(name, email, phone, password, confirmPassword) {
    let isValid = true;
    
    // Validate name
    if (!name) {
        showError('name-error', 'Please enter your name');
        isValid = false;
    } else {
        hideError('name-error');
    }
    
    // Validate email
    if (!email) {
        showError('email-error', 'Please enter your email');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email-error', 'Please enter a valid email address');
        isValid = false;
    } else {
        hideError('email-error');
    }
    
    // Validate phone
    if (phone && !isValidPhone(phone)) {
        showError('phone-error', 'Please enter a valid phone number');
        isValid = false;
    } else {
        hideError('phone-error');
    }
    
    // Validate password
    if (password || confirmPassword) {
        if (password.length < 6) {
            showError('password-error', 'Password must be at least 6 characters');
            isValid = false;
        } else {
            hideError('password-error');
        }
        
        if (password !== confirmPassword) {
            showError('confirm-password-error', 'Passwords do not match');
            isValid = false;
        } else {
            hideError('confirm-password-error');
        }
    }
    
    return isValid;
}

// Check if email is valid
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if phone number is valid
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\+\-\(\)]{8,20}$/;
    return phoneRegex.test(phone);
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Hide error message
function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.style.display = 'none';
}

// Show success message
function showSuccessMessage(elementId, message) {
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        successElement.style.display = 'none';
    }, 3000);
}

// Delete account
function deleteAccount() {
    const currentUsername = localStorage.getItem('username');
    
    // Remove user from users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter(user => user.username !== currentUsername);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Remove user-specific data
    const allUserProfiles = JSON.parse(localStorage.getItem('allUserProfiles') || '{}');
    delete allUserProfiles[currentUsername];
    localStorage.setItem('allUserProfiles', JSON.stringify(allUserProfiles));
    
    const allUserSettings = JSON.parse(localStorage.getItem('allUserSettings') || '{}');
    delete allUserSettings[currentUsername];
    localStorage.setItem('allUserSettings', JSON.stringify(allUserSettings));
    
    const allUserHealthData = JSON.parse(localStorage.getItem('allUserHealthData') || '{}');
    delete allUserHealthData[currentUsername];
    localStorage.setItem('allUserHealthData', JSON.stringify(allUserHealthData));
    
    // Logout
    logout();
}

// Handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('fullname');
    window.location.href = 'login.html';
}
