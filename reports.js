// Reports.js - JavaScript for the Health Reports page

// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Set username in the dashboard
    const username = localStorage.getItem('fullname') || localStorage.getItem('username') || 'User';
    document.getElementById('username').textContent = username;

    // Initialize the reports page
    initReports();
    
    // Setup logout functionality
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
        });
    }
    
    // Handle sidebar toggle for mobile
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
});

// Get user-specific health records
function getUserHealthRecords() {
    const currentUsername = localStorage.getItem('username');
    if (!currentUsername) {
        return [];
    }
    
    // Try to get health data from allUserHealthData
    const allUserHealthData = JSON.parse(localStorage.getItem('allUserHealthData') || '{}');
    if (allUserHealthData[currentUsername] && allUserHealthData[currentUsername].healthLogs) {
        console.log("Found health data in allUserHealthData:", allUserHealthData[currentUsername].healthLogs);
        return allUserHealthData[currentUsername].healthLogs;
    }
    
    // If not found, try to get from reports data (legacy format)
    const userReportsKey = `reports_${currentUsername}`;
    let userReports = JSON.parse(localStorage.getItem(userReportsKey)) || [];
    console.log("Looking for health data in reports:", userReports);
    
    // Filter only health data reports
    const healthDataReports = userReports.filter(report => report.type === 'health_data');
    
    // If no reports found, try to get direct health data (legacy format)
    if (healthDataReports.length === 0) {
        const userHealthDataKey = `healthData_${currentUsername}`;
        const userHealthData = JSON.parse(localStorage.getItem(userHealthDataKey)) || [];
        console.log("Looking for health data in direct storage:", userHealthData);
        return userHealthData;
    }
    
    // Return the data from the reports
    console.log("Found health data in reports:", healthDataReports.map(report => report.data));
    return healthDataReports.map(report => report.data);
}

// Initialize reports page
function initReports() {
    // Set default date range (last 30 days)
    setDefaultDateRange();
    
    // Setup event listeners
    setupEventListeners();
}

// Set default date range (last 30 days)
function setDefaultDateRange() {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);
    
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    // Format dates as YYYY-MM-DD for input fields
    startDateInput.value = formatDateForInput(lastMonth);
    endDateInput.value = formatDateForInput(today);
}

// Format date as YYYY-MM-DD for input
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Setup event listeners
function setupEventListeners() {
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    // Generate report button
    generateBtn.addEventListener('click', function() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            alert('Start date cannot be after end date');
            return;
        }
        
        // Get latest health records
        const healthRecords = getUserHealthRecords();
        
        // Filter records by date range
        const filteredRecords = filterRecordsByDateRange(healthRecords, startDate, endDate);
        
        // Display filtered records
        displayHealthRecords(filteredRecords);
        
        // Enable download button if records exist
        downloadBtn.disabled = filteredRecords.length === 0;
    });
    
    // Download PDF button
    downloadBtn.addEventListener('click', function() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        // Get latest health records
        const healthRecords = getUserHealthRecords();
        
        // Filter records by date range
        const filteredRecords = filterRecordsByDateRange(healthRecords, startDate, endDate);
        
        // Generate and download PDF
        generatePDF(filteredRecords, startDate, endDate);
    });
    
    // Initial display of records
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const healthRecords = getUserHealthRecords();
    const filteredRecords = filterRecordsByDateRange(healthRecords, startDate, endDate);
    displayHealthRecords(filteredRecords);
    
    // Enable download button if records exist
    downloadBtn.disabled = filteredRecords.length === 0;
}

// Filter records by date range
function filterRecordsByDateRange(records, startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    return records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= start && recordDate <= end;
    });
}

// Display health records in the table
function displayHealthRecords(records) {
    const tableBody = document.getElementById('records-table-body');
    tableBody.innerHTML = '';
    
    if (records.length === 0) {
        // No records found
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-records">No health records found for the selected date range</td>
            </tr>
        `;
        return;
    }
    
    // Sort records by date (newest first)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add records to table
    records.forEach((record, index) => {
        const row = document.createElement('tr');
        
        // Format date for display
        const dateObj = new Date(record.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Handle different data formats
        const heartRate = record.heartRate || '--';
        const systolic = record.bloodPressureSystolic || (record.bloodPressure ? record.bloodPressure.systolic : '--');
        const diastolic = record.bloodPressureDiastolic || (record.bloodPressure ? record.bloodPressure.diastolic : '--');
        const oxygenLevel = record.oxygenLevel || '--';
        const temperature = record.temperature || '--';
        
        // Generate a unique ID if not present
        const recordId = record.id || `record-${index}-${Date.now()}`;
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${heartRate} BPM</td>
            <td>${systolic}/${diastolic} mmHg</td>
            <td>${oxygenLevel}%</td>
            <td>${temperature}°C</td>
            <td>
                <button class="view-details-btn" data-index="${index}">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="download-record-btn" data-index="${index}">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners for detail buttons
    const detailButtons = document.querySelectorAll('.view-details-btn');
    detailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            showRecordDetails(records[index]);
        });
    });
    
    // Add event listeners for download buttons
    const downloadButtons = document.querySelectorAll('.download-record-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            generateSingleRecordPDF(records[index]);
        });
    });
}

// Generate and download PDF report for multiple records
function generatePDF(records, startDate, endDate) {
    // Get current user
    const username = localStorage.getItem('fullname') || localStorage.getItem('username') || 'User';
    
    // Format dates for display
    const startFormatted = new Date(startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const endFormatted = new Date(endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Setup document definition
    const docDefinition = {
        info: {
            title: `Health Report - ${startFormatted} to ${endFormatted}`,
            author: 'HealthCare360',
            subject: 'Health Report'
        },
        header: {
            text: 'HealthCare360',
            alignment: 'right',
            margin: [0, 10, 20, 0],
            fontSize: 10,
            color: '#7f8c8d'
        },
        footer: function(currentPage, pageCount) {
            return {
                text: `Page ${currentPage} of ${pageCount}`,
                alignment: 'center',
                fontSize: 10,
                color: '#7f8c8d',
                margin: [0, 10, 0, 0]
            };
        },
        content: [
            {
                text: 'Health Report',
                style: 'header',
                alignment: 'center'
            },
            {
                text: `${startFormatted} to ${endFormatted}`,
                style: 'subheader',
                alignment: 'center',
                margin: [0, 0, 0, 20]
            },
            {
                text: `Patient: ${username}`,
                style: 'patientInfo',
                margin: [0, 0, 0, 10]
            },
            {
                text: `Generated on: ${new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`,
                style: 'generatedInfo',
                margin: [0, 0, 0, 20]
            },
            {
                text: 'Health Records Summary',
                style: 'sectionHeader',
                margin: [0, 0, 0, 10]
            }
        ],
        styles: {
            header: {
                fontSize: 24,
                bold: true,
                color: '#2980b9'
            },
            subheader: {
                fontSize: 16,
                bold: true,
                color: '#34495e'
            },
            patientInfo: {
                fontSize: 14,
                color: '#2c3e50'
            },
            generatedInfo: {
                fontSize: 12,
                color: '#7f8c8d'
            },
            sectionHeader: {
                fontSize: 18,
                bold: true,
                color: '#2980b9',
                margin: [0, 20, 0, 10]
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: '#2c3e50',
                fillColor: '#ecf0f1'
            }
        }
    };

    // Add records table if records exist
    if (records.length > 0) {
        // Sort records by date (newest first)
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Create table data
        const tableBody = [
            [
                { text: 'Date', style: 'tableHeader' },
                { text: 'Heart Rate', style: 'tableHeader' },
                { text: 'Blood Pressure', style: 'tableHeader' },
                { text: 'Oxygen Level', style: 'tableHeader' },
                { text: 'Temperature', style: 'tableHeader' }
            ]
        ];
        
        // Add records to table
        records.forEach(record => {
            const dateObj = new Date(record.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Handle different data formats
            const heartRate = record.heartRate || '--';
            const systolic = record.bloodPressureSystolic || (record.bloodPressure ? record.bloodPressure.systolic : '--');
            const diastolic = record.bloodPressureDiastolic || (record.bloodPressure ? record.bloodPressure.diastolic : '--');
            const oxygenLevel = record.oxygenLevel || '--';
            const temperature = record.temperature || '--';
            
            tableBody.push([
                formattedDate,
                `${heartRate} BPM`,
                `${systolic}/${diastolic} mmHg`,
                `${oxygenLevel}%`,
                `${temperature}°C`
            ]);
        });
        
        // Add table to document
        docDefinition.content.push({
            table: {
                headerRows: 1,
                widths: ['*', '*', '*', '*', '*'],
                body: tableBody
            },
            layout: {
                hLineWidth: function(i, node) {
                    return (i === 0 || i === node.table.body.length) ? 2 : 1;
                },
                vLineWidth: function(i, node) {
                    return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                },
                hLineColor: function(i, node) {
                    return (i === 0 || i === node.table.body.length) ? '#bdc3c7' : '#e9e9e9';
                },
                vLineColor: function(i, node) {
                    return (i === 0 || i === node.table.widths.length) ? '#bdc3c7' : '#e9e9e9';
                }
            }
        });
        
        // Add notes section
        docDefinition.content.push(
            {
                text: 'Notes:',
                style: 'sectionHeader',
                margin: [0, 20, 0, 10]
            },
            {
                text: 'This report provides a summary of your health data for the specified date range. Please consult with your healthcare provider for professional medical advice.',
                margin: [0, 0, 0, 10]
            }
        );
    } else {
        // No records message
        docDefinition.content.push({
            text: 'No health records found for the selected date range.',
            margin: [0, 20, 0, 20]
        });
    }
    
    // Generate and download PDF
    pdfMake.createPdf(docDefinition).download(`Health_Report_${startDate}_to_${endDate}.pdf`);
}

// Generate and download PDF for a single record
function generateSingleRecordPDF(record) {
    // Get current user
    const username = localStorage.getItem('fullname') || localStorage.getItem('username') || 'User';
    
    // Format date for display
    const dateObj = new Date(record.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Handle different data formats
    const heartRate = record.heartRate || '--';
    const systolic = record.bloodPressureSystolic || (record.bloodPressure ? record.bloodPressure.systolic : '--');
    const diastolic = record.bloodPressureDiastolic || (record.bloodPressure ? record.bloodPressure.diastolic : '--');
    const oxygenLevel = record.oxygenLevel || '--';
    const temperature = record.temperature || '--';
    const notes = record.notes || '';
    
    // Setup document definition
    const docDefinition = {
        info: {
            title: `Health Record - ${formattedDate}`,
            author: 'HealthCare360',
            subject: 'Health Record'
        },
        header: {
            text: 'HealthCare360',
            alignment: 'right',
            margin: [0, 10, 20, 0],
            fontSize: 10,
            color: '#7f8c8d'
        },
        content: [
            {
                text: 'Health Record',
                style: 'header',
                alignment: 'center'
            },
            {
                text: formattedDate,
                style: 'subheader',
                alignment: 'center',
                margin: [0, 0, 0, 20]
            },
            {
                text: `Patient: ${username}`,
                style: 'patientInfo',
                margin: [0, 0, 0, 10]
            },
            {
                text: `Generated on: ${new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}`,
                style: 'generatedInfo',
                margin: [0, 0, 0, 20]
            },
            {
                text: 'Vital Signs',
                style: 'sectionHeader',
                margin: [0, 0, 0, 10]
            },
            {
                layout: 'lightHorizontalLines',
                table: {
                    widths: ['50%', '50%'],
                    body: [
                        [{ text: 'Metric', style: 'tableHeader' }, { text: 'Value', style: 'tableHeader' }],
                        ['Heart Rate', `${heartRate} BPM`],
                        ['Blood Pressure', `${systolic}/${diastolic} mmHg`],
                        ['Oxygen Level', `${oxygenLevel}%`],
                        ['Temperature', `${temperature}°C`]
                    ]
                }
            }
        ],
        styles: {
            header: {
                fontSize: 24,
                bold: true,
                color: '#2980b9'
            },
            subheader: {
                fontSize: 16,
                bold: true,
                color: '#34495e'
            },
            patientInfo: {
                fontSize: 14,
                color: '#2c3e50'
            },
            generatedInfo: {
                fontSize: 12,
                color: '#7f8c8d'
            },
            sectionHeader: {
                fontSize: 18,
                bold: true,
                color: '#2980b9',
                margin: [0, 20, 0, 10]
            },
            tableHeader: {
                bold: true,
                fontSize: 12,
                color: '#2c3e50',
                fillColor: '#ecf0f1'
            }
        }
    };
    
    // Add notes if available
    if (notes && notes.trim() !== '') {
        docDefinition.content.push(
            {
                text: 'Notes',
                style: 'sectionHeader',
                margin: [0, 20, 0, 10]
            },
            {
                text: notes,
                margin: [0, 0, 0, 10]
            }
        );
    }
    
    // Generate and download PDF
    pdfMake.createPdf(docDefinition).download(`Health_Record_${record.date}.pdf`);
}

// Show record details in a modal
function showRecordDetails(record) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('record-details-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'record-details-modal';
        modal.className = 'modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Health Record Details</h3>
                <button class="close-modal-btn">&times;</button>
            </div>
            <div class="modal-body" id="record-details-content">
                <!-- Record details will be inserted here -->
            </div>
            <div class="modal-footer">
                <button class="modal-btn" id="close-details-btn">Close</button>
                <button class="modal-btn primary" id="download-details-btn">
                    <i class="fas fa-file-pdf"></i> Download PDF
                </button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add event listeners for modal buttons
        const closeModalBtn = modal.querySelector('.close-modal-btn');
        const closeDetailsBtn = modal.querySelector('#close-details-btn');
        
        closeModalBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
        
        closeDetailsBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
    
    // Handle different data formats
    const heartRate = record.heartRate || '--';
    const systolic = record.bloodPressureSystolic || (record.bloodPressure ? record.bloodPressure.systolic : '--');
    const diastolic = record.bloodPressureDiastolic || (record.bloodPressure ? record.bloodPressure.diastolic : '--');
    const oxygenLevel = record.oxygenLevel || '--';
    const temperature = record.temperature || '--';
    const notes = record.notes || '';
    
    // Format date for display
    const dateObj = new Date(record.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update modal content with record details
    const recordDetailsContent = document.getElementById('record-details-content');
    recordDetailsContent.innerHTML = `
        <div class="record-detail">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="record-detail">
            <span class="detail-label">Heart Rate:</span>
            <span class="detail-value">${heartRate} BPM</span>
        </div>
        <div class="record-detail">
            <span class="detail-label">Blood Pressure:</span>
            <span class="detail-value">${systolic}/${diastolic} mmHg</span>
        </div>
        <div class="record-detail">
            <span class="detail-label">Oxygen Level:</span>
            <span class="detail-value">${oxygenLevel}%</span>
        </div>
        <div class="record-detail">
            <span class="detail-label">Temperature:</span>
            <span class="detail-value">${temperature}°C</span>
        </div>
    `;
    
    // Add notes if available
    if (notes && notes.trim() !== '') {
        recordDetailsContent.innerHTML += `
            <div class="record-detail notes">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">${notes}</span>
            </div>
        `;
    }
    
    // Update download button event listener
    const downloadDetailsBtn = document.getElementById('download-details-btn');
    downloadDetailsBtn.addEventListener('click', function() {
        generateSingleRecordPDF(record);
    });
    
    // Show modal
    modal.classList.add('active');
}
