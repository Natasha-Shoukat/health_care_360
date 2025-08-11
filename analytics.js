// Analytics.js - JavaScript for the Dashboard Analytics page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('fullname') || localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the analytics page
    initAnalytics();
});

// Get user health data from localStorage
function getUserHealthData(days = 7) {
    const currentUsername = localStorage.getItem('username');
    const allUserHealthData = JSON.parse(localStorage.getItem('allUserHealthData') || '{}');
    
    // Get this user's health data
    if (!allUserHealthData[currentUsername] || !allUserHealthData[currentUsername].healthLogs) {
        return [];
    }
    
    // Return only the requested number of days
    const healthLogs = allUserHealthData[currentUsername].healthLogs || [];
    return healthLogs.slice(0, days);
}

// Initialize analytics page
function initAnalytics() {
    // Get health data for the last 7 days
    const healthData = getUserHealthData(7);
    
    // Check if we have data to display
    if (healthData.length < 2) {
        showNoDataMessage();
        return;
    }
    
    // Update stat cards with latest data
    updateStatCards(healthData);
    
    // Initialize the main chart
    initMainChart(healthData);
    
    // Setup toggle buttons
    setupToggleButtons();
    
    // Handle sidebar toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

// Show message when no data is available
function showNoDataMessage() {
    // Hide chart container
    document.querySelector('.chart-container').style.display = 'none';
    
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.className = 'no-data-message';
    messageContainer.innerHTML = `
        <div class="no-data-content">
            <i class="fas fa-chart-line"></i>
            <h3>No Health Data Available</h3>
            <p>Please visit your dashboard and add some health data to see analytics.</p>
            <a href="dashboard.html" class="btn-primary">Go to Dashboard</a>
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
        }
        .no-data-content {
            max-width: 500px;
            margin: 0 auto;
        }
        .no-data-message i {
            font-size: 60px;
            color: #3498db;
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
        .btn-primary {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(45deg, #00a3cc, #0066cc);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);
    
    // Insert message after chart container
    const chartContainer = document.querySelector('.chart-container');
    chartContainer.parentNode.insertBefore(messageContainer, chartContainer.nextSibling);
}

// Update stat cards with latest data
function updateStatCards(healthData) {
    const latestData = healthData[0]; // First item is the latest
    const previousData = healthData[1]; // Second item is the previous day
    
    if (!latestData || !previousData) return;
    
    // Heart Rate
    document.getElementById('hr-value').textContent = latestData.heartRate;
    updateTrend('hr-trend', latestData.heartRate, previousData.heartRate);
    
    // Blood Pressure
    document.getElementById('bp-value').textContent = `${latestData.bloodPressureSystolic}/${latestData.bloodPressureDiastolic}`;
    updateTrend('bp-trend', latestData.bloodPressureSystolic, previousData.bloodPressureSystolic);
    
    // Oxygen Level
    document.getElementById('o2-value').textContent = latestData.oxygenLevel;
    updateTrend('o2-trend', latestData.oxygenLevel, previousData.oxygenLevel);
    
    // Temperature
    document.getElementById('temp-value').textContent = latestData.temperature;
    updateTrend('temp-trend', parseFloat(latestData.temperature), parseFloat(previousData.temperature));
}

// Update trend indicator
function updateTrend(elementId, currentValue, previousValue) {
    const trendElement = document.getElementById(elementId);
    const diff = currentValue - previousValue;
    const percentChange = ((diff / previousValue) * 100).toFixed(1);
    
    if (diff > 0) {
        trendElement.innerHTML = `<i class="fas fa-arrow-up"></i> ${percentChange}% from yesterday`;
        trendElement.className = 'stat-trend trend-up';
    } else if (diff < 0) {
        trendElement.innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.abs(percentChange)}% from yesterday`;
        trendElement.className = 'stat-trend trend-down';
    } else {
        trendElement.innerHTML = `<i class="fas fa-minus"></i> No change from yesterday`;
        trendElement.className = 'stat-trend trend-neutral';
    }
}

// Initialize the main chart
function initMainChart(healthData) {
    const ctx = document.getElementById('main-chart').getContext('2d');
    
    // Reverse the data to show oldest to newest (left to right)
    const chartData = [...healthData].reverse();
    
    // Format dates for display
    const labels = chartData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Prepare datasets
    const heartRateData = chartData.map(item => item.heartRate);
    const bpSysData = chartData.map(item => item.bloodPressureSystolic);
    const bpDiaData = chartData.map(item => item.bloodPressureDiastolic);
    const oxygenData = chartData.map(item => item.oxygenLevel);
    const tempData = chartData.map(item => parseFloat(item.temperature));
    
    // Destroy previous chart instance if exists
    if (window.mainChart) {
        window.mainChart.destroy();
    }
    
    // Create chart
    window.mainChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Heart Rate (BPM)',
                    data: heartRateData,
                    backgroundColor: 'rgba(0, 230, 255, 0.1)',
                    borderColor: '#00e6ff',
                    borderWidth: 2,
                    pointBackgroundColor: '#00e6ff',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'BP Systolic (mmHg)',
                    data: bpSysData,
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderColor: '#ff00ff',
                    borderWidth: 2,
                    pointBackgroundColor: '#ff00ff',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'BP Diastolic (mmHg)',
                    data: bpDiaData,
                    backgroundColor: 'rgba(204, 0, 204, 0.1)',
                    borderColor: '#cc00cc',
                    borderWidth: 2,
                    pointBackgroundColor: '#cc00cc',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Oxygen Level (%)',
                    data: oxygenData,
                    backgroundColor: 'rgba(0, 255, 157, 0.1)',
                    borderColor: '#00ff9d',
                    borderWidth: 2,
                    pointBackgroundColor: '#00ff9d',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Temperature (°C)',
                    data: tempData,
                    backgroundColor: 'rgba(255, 94, 98, 0.1)',
                    borderColor: '#ff5e62',
                    borderWidth: 2,
                    pointBackgroundColor: '#ff5e62',
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
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 15, 35, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    padding: 15,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y;
                            }
                            return label;
                        }
                    }
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

// Setup toggle buttons for datasets
function setupToggleButtons() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    toggleButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            const visible = this.classList.contains('active');
            toggleDataset(index, visible);
        });
    });
}

// Toggle dataset visibility
function toggleDataset(index, visible) {
    if (window.mainChart && window.mainChart.data.datasets[index]) {
        window.mainChart.data.datasets[index].hidden = !visible;
        window.mainChart.update();
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
