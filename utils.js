// Utility functions for HealthCare360

// Show a 3D alert dialog
function show3DAlert(title, message, type = 'error') {
    // Create alert elements if they don't exist
    let alertModal = document.getElementById('alert3DModal');
    
    if (!alertModal) {
        // Create modal elements
        alertModal = document.createElement('div');
        alertModal.id = 'alert3DModal';
        alertModal.className = 'modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const modalTitle = document.createElement('h2');
        modalTitle.id = 'alert3DTitle';
        
        const modalMessage = document.createElement('p');
        modalMessage.id = 'alert3DMessage';
        
        const modalBtn = document.createElement('button');
        modalBtn.className = 'modal-btn';
        modalBtn.id = 'alert3DBtn';
        modalBtn.textContent = 'OK';
        
        // Append elements
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(modalMessage);
        modalContent.appendChild(modalBtn);
        alertModal.appendChild(modalContent);
        document.body.appendChild(alertModal);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(10, 10, 26, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-content {
                background: rgba(15, 15, 35, 0.9);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 0 30px rgba(0, 230, 255, 0.3), 
                            inset 0 0 15px rgba(0, 230, 255, 0.2);
                border: 1px solid rgba(0, 230, 255, 0.2);
                max-width: 500px;
                width: 90%;
                transform: scale(0.8);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                transform-style: preserve-3d;
                perspective: 1000px;
            }
            
            .modal-overlay.active .modal-content {
                transform: scale(1);
                animation: modalOpen 0.6s ease-out forwards;
            }
            
            .modal-content h2 {
                color: #ffffff;
                margin-bottom: 20px;
                text-shadow: 0 0 10px rgba(0, 230, 255, 0.5);
            }
            
            .modal-content p {
                color: #e0e0e0;
                margin-bottom: 30px;
                font-size: 1.1rem;
            }
            
            .modal-btn {
                padding: 12px 30px;
                background: linear-gradient(45deg, #00a3cc, #0066cc);
                border: none;
                border-radius: 8px;
                color: #ffffff;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .modal-btn:hover {
                box-shadow: 0 0 20px rgba(0, 230, 255, 0.5);
                transform: translateY(-2px);
            }
            
            .modal-content.error h2 {
                color: #ff3366;
                text-shadow: 0 0 10px rgba(255, 51, 102, 0.5);
            }
            
            .modal-content.success h2 {
                color: #00cc66;
                text-shadow: 0 0 10px rgba(0, 204, 102, 0.5);
            }
            
            .modal-content.warning h2 {
                color: #ffcc00;
                text-shadow: 0 0 10px rgba(255, 204, 0, 0.5);
            }
            
            @keyframes modalOpen {
                0% { transform: scale(0.8) rotateX(30deg); opacity: 0; }
                100% { transform: scale(1) rotateX(0deg); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Add event listener to button
        document.getElementById('alert3DBtn').addEventListener('click', function() {
            hide3DAlert();
        });
    }
    
    // Set modal content
    document.getElementById('alert3DTitle').textContent = title;
    document.getElementById('alert3DMessage').textContent = message;
    
    // Set modal type
    const modalContent = alertModal.querySelector('.modal-content');
    modalContent.className = 'modal-content';
    modalContent.classList.add(type);
    
    // Show modal
    alertModal.classList.add('active');
}

// Hide the 3D alert dialog
function hide3DAlert() {
    const alertModal = document.getElementById('alert3DModal');
    if (alertModal) {
        alertModal.classList.remove('active');
    }
}

// Check if a user exists
function userExists(username) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.some(user => user.username === username);
}

// Find user by email
function findUserByEmail(email) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(user => user.email === email);
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
} 