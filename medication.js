// Medication.js - JavaScript for the Medication Reminders page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('fullname') || localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the medication page
    initMedicationPage();
});

// Initialize medication page
function initMedicationPage() {
    // Load medications from localStorage
    loadMedications();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start checking for medication reminders
    startReminderChecker();
}

// Load medications from localStorage
function loadMedications() {
    const medications = getUserMedications();
    displayMedications(medications);
}

// Get user-specific medications from localStorage
function getUserMedications() {
    const currentUsername = localStorage.getItem('username');
    const allUserMedications = JSON.parse(localStorage.getItem('allUserMedications') || '{}');
    
    // Create user's medications array if not exists
    if (!allUserMedications[currentUsername]) {
        allUserMedications[currentUsername] = [];
        localStorage.setItem('allUserMedications', JSON.stringify(allUserMedications));
    }
    
    return allUserMedications[currentUsername];
}

// Save user-specific medications to localStorage
function saveUserMedications(medications) {
    const currentUsername = localStorage.getItem('username');
    const allUserMedications = JSON.parse(localStorage.getItem('allUserMedications') || '{}');
    
    // Update this user's medications
    allUserMedications[currentUsername] = medications;
    
    // Save back to localStorage
    localStorage.setItem('allUserMedications', JSON.stringify(allUserMedications));
}

// Display medications in the list
function displayMedications(medications) {
    const medItemsContainer = document.getElementById('med-items');
    medItemsContainer.innerHTML = '';
    
    if (medications.length === 0) {
        medItemsContainer.innerHTML = `
            <div class="no-meds">
                <p>No medications added yet. Add your first medication using the form.</p>
            </div>
        `;
        return;
    }
    
    medications.forEach((medication, index) => {
        const medItem = document.createElement('div');
        medItem.classList.add('med-item');
        medItem.dataset.id = index;
        
        // Create HTML for medication times
        let timesHTML = '';
        medication.times.forEach((time, timeIndex) => {
            const isTaken = time.taken ? 'taken' : '';
            const icon = time.taken ? 'fa-check-circle' : 'fa-clock';
            
            timesHTML += `
                <div class="med-time ${isTaken}" data-time-index="${timeIndex}">
                    <i class="fas ${icon}"></i> ${time.time}
                    ${!time.taken ? `<button class="med-time-btn" data-action="take" title="Mark as taken"><i class="fas fa-check"></i></button>` : ''}
                </div>
            `;
        });
        
        medItem.innerHTML = `
            <div class="med-header">
                <div class="med-name">${medication.name}</div>
                <div class="med-actions">
                    <button class="med-action-btn edit-btn" data-action="edit" title="Edit medication">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="med-action-btn delete-btn" data-action="delete" title="Delete medication">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="med-info">
                <div class="med-info-item">
                    <div class="med-info-label">Dosage:</div>
                    <div class="med-info-value">${medication.dosage}</div>
                </div>
                <div class="med-info-item">
                    <div class="med-info-label">Times:</div>
                    <div class="med-times">
                        ${timesHTML}
                    </div>
                </div>
            </div>
        `;
        
        medItemsContainer.appendChild(medItem);
    });
    
    // Add event listeners to the medication items
    addMedicationItemListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Add medication form
    const addMedForm = document.getElementById('add-med-form');
    const medNameInput = document.getElementById('med-name');
    const medDosageInput = document.getElementById('med-dosage');
    const medTimeInput = document.getElementById('med-time');
    const addTimeBtn = document.getElementById('add-time-btn');
    const timeSlots = document.getElementById('time-slots');
    
    // Add time button
    addTimeBtn.addEventListener('click', function() {
        const time = medTimeInput.value;
        if (!time) return;
        
        // Check if time already exists
        const existingTimes = Array.from(timeSlots.querySelectorAll('.time-slot span')).map(span => span.textContent);
        if (existingTimes.includes(time)) {
            alert('This time is already added');
            return;
        }
        
        // Add time slot
        const timeSlot = document.createElement('div');
        timeSlot.classList.add('time-slot');
        timeSlot.innerHTML = `
            <span>${time}</span>
            <button class="remove-time-btn" title="Remove time"><i class="fas fa-times"></i></button>
        `;
        
        timeSlots.appendChild(timeSlot);
        medTimeInput.value = '';
        
        // Add event listener to remove button
        const removeBtn = timeSlot.querySelector('.remove-time-btn');
        removeBtn.addEventListener('click', function() {
            timeSlot.remove();
        });
    });
    
    // Add medication form submission
    addMedForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = medNameInput.value.trim();
        const dosage = medDosageInput.value.trim();
        const timeElements = timeSlots.querySelectorAll('.time-slot span');
        
        // Validate inputs
        if (!name) {
            showError('med-name-error', 'Please enter medication name');
            return;
        }
        
        if (!dosage) {
            showError('med-dosage-error', 'Please enter dosage');
            return;
        }
        
        if (timeElements.length === 0) {
            showError('med-time-error', 'Please add at least one time');
            return;
        }
        
        // Create times array
        const times = Array.from(timeElements).map(timeElement => {
            return {
                time: timeElement.textContent,
                taken: false,
                lastTakenDate: null
            };
        });
        
        // Create medication object
        const medication = {
            name,
            dosage,
            times
        };
        
        // Add medication to storage
        addMedication(medication);
        
        // Reset form
        addMedForm.reset();
        timeSlots.innerHTML = '';
        
        // Hide error messages
        document.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
    });
    
    // Handle sidebar toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Edit modal events
    const editModal = document.getElementById('edit-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    
    closeModalBtn.addEventListener('click', function() {
        editModal.classList.remove('active');
    });
    
    cancelBtn.addEventListener('click', function() {
        editModal.classList.remove('active');
    });
    
    // Edit form submission
    const editMedForm = document.getElementById('edit-med-form');
    
    editMedForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const medId = editMedForm.dataset.medId;
        const name = document.getElementById('edit-med-name').value.trim();
        const dosage = document.getElementById('edit-med-dosage').value.trim();
        const editTimeElements = document.getElementById('edit-time-slots').querySelectorAll('.time-slot span');
        
        // Validate inputs
        if (!name) {
            showError('edit-med-name-error', 'Please enter medication name');
            return;
        }
        
        if (!dosage) {
            showError('edit-med-dosage-error', 'Please enter dosage');
            return;
        }
        
        if (editTimeElements.length === 0) {
            showError('edit-med-time-error', 'Please add at least one time');
            return;
        }
        
        // Create times array
        const times = Array.from(editTimeElements).map(timeElement => {
            return {
                time: timeElement.textContent,
                taken: false,
                lastTakenDate: null
            };
        });
        
        // Update medication
        updateMedication(medId, name, dosage, times);
        
        // Close modal
        editModal.classList.remove('active');
    });
    
    // Add time button in edit modal
    const editAddTimeBtn = document.getElementById('edit-add-time-btn');
    const editMedTimeInput = document.getElementById('edit-med-time');
    const editTimeSlots = document.getElementById('edit-time-slots');
    
    editAddTimeBtn.addEventListener('click', function() {
        const time = editMedTimeInput.value;
        if (!time) return;
        
        // Check if time already exists
        const existingTimes = Array.from(editTimeSlots.querySelectorAll('.time-slot span')).map(span => span.textContent);
        if (existingTimes.includes(time)) {
            alert('This time is already added');
            return;
        }
        
        // Add time slot
        const timeSlot = document.createElement('div');
        timeSlot.classList.add('time-slot');
        timeSlot.innerHTML = `
            <span>${time}</span>
            <button class="remove-time-btn" title="Remove time"><i class="fas fa-times"></i></button>
        `;
        
        editTimeSlots.appendChild(timeSlot);
        editMedTimeInput.value = '';
        
        // Add event listener to remove button
        const removeBtn = timeSlot.querySelector('.remove-time-btn');
        removeBtn.addEventListener('click', function() {
            timeSlot.remove();
        });
    });
    
    // Medication alert events
    const medAlert = document.getElementById('med-alert');
    const closeAlertBtn = document.getElementById('close-alert');
    const takeBtn = document.getElementById('take-btn');
    const snoozeBtn = document.getElementById('snooze-btn');
    
    closeAlertBtn.addEventListener('click', function() {
        medAlert.style.display = 'none';
    });
    
    takeBtn.addEventListener('click', function() {
        const medId = medAlert.dataset.medId;
        const timeIndex = medAlert.dataset.timeIndex;
        
        markMedicationAsTaken(medId, timeIndex);
        medAlert.style.display = 'none';
    });
    
    snoozeBtn.addEventListener('click', function() {
        // Snooze for 5 minutes
        medAlert.style.display = 'none';
        
        setTimeout(() => {
            if (medAlert.dataset.medId) {
                medAlert.style.display = 'block';
            }
        }, 5 * 60 * 1000);
    });
}

// Add medication to storage
function addMedication(medication) {
    const medications = getUserMedications();
    medications.push(medication);
    saveUserMedications(medications);
    loadMedications();
}

// Update medication in storage
function updateMedication(medId, name, dosage, times) {
    const medications = getUserMedications();
    
    if (medId >= 0 && medId < medications.length) {
        // Preserve taken status for matching times
        const existingTimes = medications[medId].times;
        
        times = times.map(newTime => {
            // Check if this time already exists in the medication
            const existingTime = existingTimes.find(time => time.time === newTime.time);
            
            // If exists, preserve taken status and last taken date
            if (existingTime) {
                return {
                    time: newTime.time,
                    taken: existingTime.taken,
                    lastTakenDate: existingTime.lastTakenDate
                };
            }
            
            // Otherwise use the new time object
            return newTime;
        });
        
        medications[medId] = {
            name,
            dosage,
            times
        };
        
        saveUserMedications(medications);
        loadMedications();
        
        return true;
    }
    
    return false;
}

// Delete medication from storage
function deleteMedication(medId) {
    const medications = getUserMedications();
    
    if (medId >= 0 && medId < medications.length) {
        medications.splice(medId, 1);
        saveUserMedications(medications);
        loadMedications();
    }
}

// Mark medication as taken
function markMedicationAsTaken(medId, timeIndex) {
    const medications = getUserMedications();
    
    if (medId >= 0 && medId < medications.length) {
        const medication = medications[medId];
        
        if (timeIndex >= 0 && timeIndex < medication.times.length) {
            medication.times[timeIndex].taken = true;
            medication.times[timeIndex].lastTakenDate = new Date().toISOString().split('T')[0];
            saveUserMedications(medications);
            loadMedications();
        }
    }
}

// Add event listeners to medication items
function addMedicationItemListeners() {
    // Edit and delete buttons
    document.querySelectorAll('.med-action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            const medItem = this.closest('.med-item');
            const medId = medItem.dataset.id;
            
            if (action === 'edit') {
                openEditModal(medId);
            } else if (action === 'delete') {
                if (confirm('Are you sure you want to delete this medication?')) {
                    deleteMedication(medId);
                }
            }
        });
    });
    
    // Take medication buttons
    document.querySelectorAll('.med-time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.dataset.action;
            const medItem = this.closest('.med-item');
            const medId = medItem.dataset.id;
            const timeItem = this.closest('.med-time');
            const timeIndex = timeItem.dataset.timeIndex;
            
            if (action === 'take') {
                markMedicationAsTaken(medId, timeIndex);
            }
        });
    });
}

// Open edit modal
function openEditModal(medId) {
    const medications = getUserMedications();
    const medication = medications[medId];
    
    if (!medication) return;
    
    const editMedForm = document.getElementById('edit-med-form');
    const editMedName = document.getElementById('edit-med-name');
    const editMedDosage = document.getElementById('edit-med-dosage');
    const editTimeSlots = document.getElementById('edit-time-slots');
    
    // Set form values
    editMedForm.dataset.medId = medId;
    editMedName.value = medication.name;
    editMedDosage.value = medication.dosage;
    
    // Clear existing time slots
    editTimeSlots.innerHTML = '';
    
    // Add time slots
    medication.times.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.classList.add('time-slot');
        timeSlot.innerHTML = `
            <span>${time.time}</span>
            <button class="remove-time-btn" title="Remove time"><i class="fas fa-times"></i></button>
        `;
        
        editTimeSlots.appendChild(timeSlot);
        
        // Add event listener to remove button
        const removeBtn = timeSlot.querySelector('.remove-time-btn');
        removeBtn.addEventListener('click', function() {
            timeSlot.remove();
        });
    });
    
    // Show modal
    const editModal = document.getElementById('edit-modal');
    editModal.classList.add('active');
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide error after 3 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

// Start checking for medication reminders
function startReminderChecker() {
    // Check every minute
    setInterval(checkMedicationReminders, 60 * 1000);
    
    // Also check immediately
    checkMedicationReminders();
}

// Check medication reminders
function checkMedicationReminders() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const currentDate = now.toISOString().split('T')[0];
    
    // Get user's medications
    const medications = getUserMedications();
    
    // Reset taken status if it's a new day
    resetTakenStatusForNewDay(medications);
    
    // Check each medication time
    medications.forEach((medication, medId) => {
        medication.times.forEach((time, timeIndex) => {
            // If time is now and not taken today
            if (time.time === currentTime && (!time.taken || time.lastTakenDate !== currentDate)) {
                // Show reminder
                showMedicationAlert(medication, medId, timeIndex);
            }
        });
    });
}

// Show medication alert
function showMedicationAlert(medication, medId, timeIndex) {
    const medAlert = document.getElementById('med-alert');
    const alertMedName = document.getElementById('alert-med-name');
    const alertMedDosage = document.getElementById('alert-med-dosage');
    const alertMedTime = document.getElementById('alert-med-time');
    
    // Set alert content
    alertMedName.textContent = medication.name;
    alertMedDosage.textContent = medication.dosage;
    alertMedTime.textContent = medication.times[timeIndex].time;
    
    // Set data attributes for the take button
    medAlert.dataset.medId = medId;
    medAlert.dataset.timeIndex = timeIndex;
    
    // Show alert
    medAlert.style.display = 'block';
}

// Play alert sound
function playAlertSound() {
    // Create audio element
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.play().catch(error => {
        // Autoplay may be blocked by browser
        console.log('Audio playback failed:', error);
    });
}

// Reset taken status for a new day
function resetTakenStatusForNewDay(medications) {
    const today = new Date().toISOString().split('T')[0];
    let updated = false;
    
    medications.forEach(medication => {
        medication.times.forEach(time => {
            if (time.taken && time.lastTakenDate !== today) {
                time.taken = false;
                updated = true;
            }
        });
    });
    
    if (updated) {
        saveUserMedications(medications);
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('fullname');
    window.location.href = 'login.html';
}

// Add event listener to logout button
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout');
    logoutBtn.addEventListener('click', logout);
});
