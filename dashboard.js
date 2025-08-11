// Dashboard.js - Main JavaScript for the Dashboard page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('fullname') || localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;
    
    // Set username in welcome modal
    document.getElementById('welcome-username').textContent = username;

    // Initialize the dashboard
    initDashboard();
    
    // Show welcome modal if this is first login after authentication
    const isNewLogin = sessionStorage.getItem('newLogin');
    if (isNewLogin === 'true') {
        showWelcomeModal();
        sessionStorage.removeItem('newLogin');
    }
    
    // Set up welcome modal button
    const welcomeBtn = document.getElementById('welcomeBtn');
    welcomeBtn.addEventListener('click', function() {
        hideWelcomeModal();
    });
    
    // Check if we need to show the health data form
    if (localStorage.getItem('showHealthDataForm') === 'true') {
        // Show the Add Health Data section
        const dashboardContent = document.getElementById('dashboard-content');
        const addHealthDataSection = document.getElementById('add-health-data');
        
        if (dashboardContent && addHealthDataSection) {
            dashboardContent.style.display = 'none';
            addHealthDataSection.style.display = 'block';
            
            // Update active tab
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById('add-health-data-tab').classList.add('active');
        }
        
        // Clear the flag
        localStorage.removeItem('showHealthDataForm');
    }
});

// Show welcome modal
function showWelcomeModal() {
    const welcomeModal = document.getElementById('welcomeModal');
    welcomeModal.classList.add('active');
}

// Hide welcome modal
function hideWelcomeModal() {
    const welcomeModal = document.getElementById('welcomeModal');
    welcomeModal.classList.remove('active');
}

// Get user-specific health data
function getUserHealthData(days = 7) {
    const currentUsername = localStorage.getItem('username');
    const allUserHealthData = JSON.parse(localStorage.getItem('allUserHealthData') || '{}');
    
    // Get or initialize user health data
    if (!allUserHealthData[currentUsername] || 
        !allUserHealthData[currentUsername].healthLogs || 
        allUserHealthData[currentUsername].healthLogs.length === 0) {
        // Return empty array instead of creating default data
        return [];
    }
    
    // Get existing data for specified number of days
    const userHealthData = allUserHealthData[currentUsername];
    
    // Return last 'days' entries or all if fewer exist
    return userHealthData.healthLogs.slice(0, days);
}

// Save user health data
function saveUserHealthData(data) {
    const currentUsername = localStorage.getItem('username');
    const allUserHealthData = JSON.parse(localStorage.getItem('allUserHealthData') || '{}');
    
    // Update this user's health data
    if (!allUserHealthData[currentUsername]) {
        allUserHealthData[currentUsername] = {};
    }
    
    allUserHealthData[currentUsername].healthLogs = data;
    
    // Save back to localStorage
    localStorage.setItem('allUserHealthData', JSON.stringify(allUserHealthData));
}

// Add new health data entry for the current user
function addHealthDataEntry(entry) {
    const currentUsername = localStorage.getItem('username');
    const allUserHealthData = JSON.parse(localStorage.getItem('allUserHealthData') || '{}');
    
    // Make sure user exists in the health data object
    if (!allUserHealthData[currentUsername]) {
        allUserHealthData[currentUsername] = {
            healthLogs: []
        };
    }
    
    // Make sure health logs array exists
    if (!allUserHealthData[currentUsername].healthLogs) {
        allUserHealthData[currentUsername].healthLogs = [];
    }
    
    // Add today's entry at the beginning of the array
    const today = new Date().toISOString().split('T')[0];
    entry.date = today;
    
    // Remove any existing entry for today
    allUserHealthData[currentUsername].healthLogs = 
        allUserHealthData[currentUsername].healthLogs.filter(item => item.date !== today);
    
    // Add new entry at the beginning
    allUserHealthData[currentUsername].healthLogs.unshift(entry);
    
    // Save back to localStorage
    localStorage.setItem('allUserHealthData', JSON.stringify(allUserHealthData));
    
    return allUserHealthData[currentUsername].healthLogs;
}

// Initialize dashboard with data
function initDashboard() {
    // Get user health data
    const healthData = getUserHealthData(7);
    
    // Check if user has any health data
    if (healthData.length === 0) {
        // Show prompt to enter first health data
        showNoDataMessage();
    } else {
        // Update vital signs cards with latest data
        updateVitalSigns(healthData[0]);
        
        // Initialize charts
        initCharts(healthData);
        
        // Setup event listeners for filter options
        setupFilterListeners(healthData);
    }
    
    // Setup vital card click events for data entry
    setupVitalCardEvents();
}

// Show message when no data is available
function showNoDataMessage() {
    // Hide charts
    document.querySelectorAll('.chart-container').forEach(chart => {
        chart.style.display = 'none';
    });
    
    // Hide filter options if they exist
    const filterOptions = document.querySelector('.filter-options') || document.querySelector('.graph-filters');
    if (filterOptions) {
        filterOptions.style.display = 'none';
    }
    
    // Find the container to add the message to
    const graphsContainer = document.querySelector('.graphs-grid') || document.querySelector('.health-graphs');
    if (!graphsContainer) {
        console.log("Could not find graphs container");
        return;
    }
    
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.className = 'no-data-message';
    messageContainer.innerHTML = `
        <div class="no-data-content">
            <i class="fas fa-heartbeat"></i>
            <h3>Welcome to Your Health Dashboard</h3>
            <p>You haven't added any health data yet. Click on any vital sign card to start tracking your health metrics.</p>
            <div class="data-instruction">
                <i class="fas fa-arrow-up pulse-animation"></i>
                <p>Click on the cards above to enter your first health data</p>
            </div>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .no-data-message {
            padding: 40px 20px;
            text-align: center;
            background: rgba(15, 15, 35, 0.4);
            border-radius: 15px;
            margin: 20px;
            animation: fadeIn 0.8s ease-out;
        }
        .no-data-content {
            max-width: 500px;
            margin: 0 auto;
        }
        .no-data-message i.fas.fa-heartbeat {
            font-size: 60px;
            color: #ff00ff;
            margin-bottom: 20px;
            opacity: 0.7;
        }
        .no-data-message h3 {
            color: #ffffff;
            font-size: 24px;
            margin-bottom: 15px;
        }
        .no-data-message p {
            color: #a0a0a0;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .data-instruction {
            margin-top: 30px;
        }
        .data-instruction i {
            color: #00e6ff;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .pulse-animation {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: translateY(0); opacity: 0.5; }
            50% { transform: translateY(-10px); opacity: 1; }
            100% { transform: translateY(0); opacity: 0.5; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    // Insert message after vital cards
    const vitalCardsContainer = document.querySelector('.vital-signs') || document.querySelector('.vital-cards-container');
    if (vitalCardsContainer) {
        vitalCardsContainer.parentNode.insertBefore(messageContainer, vitalCardsContainer.nextSibling);
    } else {
        // If vital cards container not found, insert into graphs container
        graphsContainer.appendChild(messageContainer);
    }
    
    // Set empty values in vital cards
    const heartRateValue = document.getElementById('heart-rate-value');
    const bloodPressureValue = document.getElementById('blood-pressure-value');
    const oxygenLevelValue = document.getElementById('oxygen-level-value');
    const temperatureValue = document.getElementById('temperature-value');
    
    if (heartRateValue) heartRateValue.textContent = '--';
    if (bloodPressureValue) bloodPressureValue.textContent = '--/--';
    if (oxygenLevelValue) oxygenLevelValue.textContent = '--';
    if (temperatureValue) temperatureValue.textContent = '--';
}

// Setup click events on vital cards to allow data entry
function setupVitalCardEvents() {
    const heartRateCard = document.querySelector('.vital-card:nth-child(1)');
    const bpCard = document.querySelector('.vital-card:nth-child(2)');
    const oxygenCard = document.querySelector('.vital-card:nth-child(3)');
    const tempCard = document.querySelector('.vital-card:nth-child(4)');
    
    heartRateCard.addEventListener('click', () => showDataEntryModal('Heart Rate', 'BPM', 'heart-rate'));
    bpCard.addEventListener('click', () => showDataEntryModal('Blood Pressure', 'mmHg', 'blood-pressure'));
    oxygenCard.addEventListener('click', () => showDataEntryModal('Oxygen Level', '%', 'oxygen-level'));
    tempCard.addEventListener('click', () => showDataEntryModal('Temperature', '°C', 'temperature'));
}

// Show modal for data entry
function showDataEntryModal(title, unit, dataType) {
    // Check if modal already exists, if not create it
    let modal = document.getElementById('data-entry-modal');
    
    if (!modal) {
        // Create modal
        modal = document.createElement('div');
        modal.id = 'data-entry-modal';
        modal.className = 'modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-modal';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = hideDataEntryModal;
        
        const modalTitle = document.createElement('h2');
        modalTitle.id = 'modal-title';
        
        const modalForm = document.createElement('div');
        modalForm.className = 'modal-form';
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        
        const input1 = document.createElement('input');
        input1.type = 'number';
        input1.id = 'data-input1';
        input1.step = '0.1';
        
        const input2 = document.createElement('input');
        input2.type = 'number';
        input2.id = 'data-input2';
        input2.style.display = 'none';
        
        const unitSpan = document.createElement('span');
        unitSpan.id = 'input-unit';
        unitSpan.className = 'input-unit';
        
        inputContainer.appendChild(input1);
        inputContainer.appendChild(input2);
        inputContainer.appendChild(unitSpan);
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'modal-btn';
        saveBtn.textContent = 'Save';
        saveBtn.id = 'save-data-btn';
        
        modalForm.appendChild(inputContainer);
        modalForm.appendChild(saveBtn);
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(modalForm);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        
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
            
            .close-modal {
                position: absolute;
                top: 15px;
                right: 15px;
                color: #a0a0a0;
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .close-modal:hover {
                color: #ffffff;
                text-shadow: 0 0 8px rgba(0, 230, 255, 0.5);
            }
            
            .input-container {
                position: relative;
                margin-bottom: 30px;
            }
            
            .input-container input {
                width: 100%;
                padding: 15px;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(0, 230, 255, 0.2);
                border-radius: 8px;
                color: #ffffff;
                font-size: 1.2rem;
                transition: all 0.3s ease;
                outline: none;
                text-align: center;
            }
            
            .input-container input:focus {
                border-color: #00e6ff;
                box-shadow: 0 0 15px rgba(0, 230, 255, 0.3);
            }
            
            .input-unit {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                color: #a0a0a0;
                font-size: 1rem;
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
            
            @keyframes modalOpen {
                0% { transform: scale(0.8) rotateX(30deg); opacity: 0; }
                100% { transform: scale(1) rotateX(0deg); opacity: 1; }
            }
            
            .bp-inputs {
                display: flex;
                gap: 10px;
                align-items: center;
            }
        `;
        document.head.appendChild(style);
        
        // Add save button event
        document.getElementById('save-data-btn').addEventListener('click', function() {
            saveEnteredData();
        });
    }
    
    // Set modal content based on data type
    document.getElementById('modal-title').textContent = `Enter Your ${title}`;
    document.getElementById('input-unit').textContent = unit;
    
    const input1 = document.getElementById('data-input1');
    const input2 = document.getElementById('data-input2');
    
    // Set up for specific data type
    if (dataType === 'blood-pressure') {
        input1.placeholder = 'Systolic';
        input2.placeholder = 'Diastolic';
        input2.style.display = 'inline-block';
        input1.style.width = '48%';
        input2.style.width = '48%';
        document.getElementById('input-unit').style.display = 'none';
    } else {
        input1.placeholder = title;
        input2.style.display = 'none';
        input1.style.width = '100%';
        document.getElementById('input-unit').style.display = 'inline-block';
    }
    
    // Store current data type
    modal.dataset.dataType = dataType;
    
    // Get latest data to pre-fill inputs
    const healthData = getUserHealthData(1);
    
    // Pre-fill with current values if they exist
    if (healthData.length > 0) {
        if (dataType === 'heart-rate') {
            input1.value = healthData[0].heartRate;
        } else if (dataType === 'blood-pressure') {
            input1.value = healthData[0].bloodPressureSystolic;
            input2.value = healthData[0].bloodPressureDiastolic;
        } else if (dataType === 'oxygen-level') {
            input1.value = healthData[0].oxygenLevel;
        } else if (dataType === 'temperature') {
            input1.value = healthData[0].temperature;
        }
    } else {
        // Clear inputs if no data exists
        input1.value = '';
        input2.value = '';
    }
    
    // Show modal
    modal.classList.add('active');
}

// Hide data entry modal
function hideDataEntryModal() {
    const modal = document.getElementById('data-entry-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Save entered data
function saveEnteredData() {
    const modal = document.getElementById('data-entry-modal');
    const dataType = modal.dataset.dataType;
    const input1 = document.getElementById('data-input1').value;
    const input2 = document.getElementById('data-input2').value;
    
    // Create or get current health data
    let healthData = getUserHealthData(1);
    let entry = {};
    
    if (healthData.length > 0) {
        entry = { ...healthData[0] };
    } else {
        // Create new entry with default values
        entry = {
            heartRate: 75,
            bloodPressureSystolic: 120,
            bloodPressureDiastolic: 80,
            oxygenLevel: 98,
            temperature: 36.6
        };
    }
    
    // Update data based on type
    if (dataType === 'heart-rate') {
        entry.heartRate = parseInt(input1) || 75;
    } else if (dataType === 'blood-pressure') {
        entry.bloodPressureSystolic = parseInt(input1) || 120;
        entry.bloodPressureDiastolic = parseInt(input2) || 80;
    } else if (dataType === 'oxygen-level') {
        entry.oxygenLevel = parseInt(input1) || 98;
    } else if (dataType === 'temperature') {
        entry.temperature = parseFloat(input1) || 36.6;
    }
    
    // Save updated data
    const updatedData = addHealthDataEntry(entry);
    
    // Update dashboard
    updateVitalSigns(updatedData[0]);
    
    // Check if we need to initialize charts (first data entry)
    const noDataMessage = document.querySelector('.no-data-message');
    if (noDataMessage) {
        // Remove no data message
        noDataMessage.remove();
        
        // Show charts and filters
        document.querySelectorAll('.chart-container').forEach(chart => {
            chart.style.display = 'block';
        });
        document.querySelector('.filter-options').style.display = 'flex';
        
        // Initialize charts
        initCharts(updatedData);
        
        // Setup filter listeners
        setupFilterListeners(updatedData);
    } else {
        // Update charts
        initCharts(updatedData);
    }
    
    // Close modal
    hideDataEntryModal();
}

// Update vital signs cards with the latest data
function updateVitalSigns(latestData) {
    document.getElementById('heart-rate-value').textContent = latestData.heartRate;
    document.getElementById('blood-pressure-value').textContent = 
        `${latestData.bloodPressureSystolic}/${latestData.bloodPressureDiastolic}`;
    document.getElementById('oxygen-level-value').textContent = latestData.oxygenLevel;
    document.getElementById('temperature-value').textContent = latestData.temperature;
}

// Initialize all charts
function initCharts(data) {
    // Check if data exists and has at least one entry
    if (!data || data.length === 0) {
        console.log("No data available for charts");
        return;
    }
    
    console.log("Initializing charts with data:", data);
    
    // Make sure chart containers exist
    const chartContainers = document.querySelectorAll('.chart-container');
    if (chartContainers.length === 0) {
        console.log("Chart containers not found");
        return;
    }
    
    // Ensure all canvases exist
    const heartRateCanvas = document.getElementById('heart-rate-chart');
    const bloodPressureCanvas = document.getElementById('blood-pressure-chart');
    const oxygenLevelCanvas = document.getElementById('oxygen-level-chart');
    const temperatureCanvas = document.getElementById('temperature-chart');
    
    if (!heartRateCanvas) console.log("Heart rate canvas not found");
    if (!bloodPressureCanvas) console.log("Blood pressure canvas not found");
    if (!oxygenLevelCanvas) console.log("Oxygen level canvas not found");
    if (!temperatureCanvas) console.log("Temperature canvas not found");
    
    if (!heartRateCanvas || !bloodPressureCanvas || !oxygenLevelCanvas || !temperatureCanvas) {
        console.log("Some chart canvases not found");
        return;
    }
    
    // Process data to ensure all required fields exist
    const processedData = data.map(item => {
        // Ensure all required fields are present and are numbers
        return {
            date: item.date || new Date().toISOString().split('T')[0],
            heartRate: parseInt(item.heartRate) || 0,
            bloodPressureSystolic: parseInt(item.bloodPressureSystolic) || 0,
            bloodPressureDiastolic: parseInt(item.bloodPressureDiastolic) || 0,
            oxygenLevel: parseInt(item.oxygenLevel) || 0,
            temperature: parseFloat(item.temperature) || 0
        };
    });
    
    // Sort data by date (oldest to newest)
    processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const dates = processedData.map(item => {
        // Format date for display (e.g., Jan 1)
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Heart Rate Chart
    const heartRateData = processedData.map(item => item.heartRate);
    createChart('heart-rate-chart', 'Heart Rate (BPM)', dates, heartRateData, '#00e6ff');
    
    // Blood Pressure Chart
    const systolicData = processedData.map(item => item.bloodPressureSystolic);
    const diastolicData = processedData.map(item => item.bloodPressureDiastolic);
    createDualChart('blood-pressure-chart', 'Blood Pressure (mmHg)', dates, 
        systolicData, diastolicData, '#ff00ff', '#00a3cc');
    
    // Oxygen Level Chart
    const oxygenData = processedData.map(item => item.oxygenLevel);
    createChart('oxygen-level-chart', 'Oxygen Level (%)', dates, oxygenData, '#00ff9d');
    
    // Temperature Chart
    const tempData = processedData.map(item => item.temperature);
    createChart('temperature-chart', 'Temperature (°C)', dates, tempData, '#ff5e62');
    
    console.log("Charts initialized successfully");
}

// Create a single line chart
function createChart(canvasId, label, labels, data, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Check if chart already exists on this canvas
    if (window.charts && window.charts[canvasId]) {
        window.charts[canvasId].destroy();
    }
    
    // Initialize charts object if it doesn't exist
    if (!window.charts) {
        window.charts = {};
    }
    
    window.charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: color + '33', // Color with opacity
                borderColor: color,
                borderWidth: 2,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a0a0a0'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 15, 35, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: color,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Create a dual line chart (for blood pressure)
function createDualChart(canvasId, label, labels, data1, data2, color1, color2) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Check if chart already exists on this canvas
    if (window.charts && window.charts[canvasId]) {
        window.charts[canvasId].destroy();
    }
    
    // Initialize charts object if it doesn't exist
    if (!window.charts) {
        window.charts = {};
    }
    
    window.charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Systolic',
                    data: data1,
                    backgroundColor: color1 + '33', // Color with opacity
                    borderColor: color1,
                    borderWidth: 2,
                    pointBackgroundColor: color1,
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Diastolic',
                    data: data2,
                    backgroundColor: color2 + '33', // Color with opacity
                    borderColor: color2,
                    borderWidth: 2,
                    pointBackgroundColor: color2,
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a0a0a0'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 15, 35, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#a0a0a0'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}

// Setup event listeners for filter options
function setupFilterListeners(healthData) {
    const filterToday = document.getElementById('filter-today');
    const filterWeek = document.getElementById('filter-week');
    const filterCustom = document.getElementById('filter-custom');
    
    filterToday.addEventListener('click', function() {
        const todayData = getUserHealthData(1);
        updateCharts(todayData);
        setActiveFilter(this);
    });
    
    filterWeek.addEventListener('click', function() {
        const weekData = getUserHealthData(7);
        updateCharts(weekData);
        setActiveFilter(this);
    });
    
    filterCustom.addEventListener('click', function() {
        const monthData = getUserHealthData(30);
        updateCharts(monthData);
        setActiveFilter(this);
    });
    
    // Set week as default active filter
    setActiveFilter(filterWeek);
}

// Set active filter button
function setActiveFilter(activeButton) {
    const filters = document.querySelectorAll('.filter-option');
    filters.forEach(filter => {
        filter.classList.remove('active');
    });
    activeButton.classList.add('active');
}

// Update charts with new data
function updateCharts(data) {
    console.log("Updating charts with data:", data);
    
    // Check if data exists
    if (!data || data.length === 0) {
        console.log("No data available for chart update");
        return;
    }
    
    // Update charts with new data
    initCharts(data);
}

// Handle sidebar toggle for mobile
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
});

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
