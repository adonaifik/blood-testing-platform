// Blood Testing Laboratory Management System - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Set active navigation
    updateActiveNavigation();
    
    // Load initial data
    loadInitialData();
}

function setupEventListeners() {
    // Patient registration form
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', handlePatientRegistration);
    }
    
    // Test request form
    const testForm = document.getElementById('testForm');
    if (testForm) {
        testForm.addEventListener('submit', handleTestRequest);
    }
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearchResults);
    }
    
    // Navigation clicks
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Enter key for search
    const searchInput = document.getElementById('searchPatientId');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearchResults();
            }
        });
    }
}

function handleNavigation(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    
    // Update active navigation
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Show/hide sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

function updateActiveNavigation() {
    // Show home section by default
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    const homeSection = document.getElementById('patient-registration');
    if (homeSection) {
        homeSection.style.display = 'block';
    }
}

async function handlePatientRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const patientData = Object.fromEntries(formData.entries());
    
    try {
        showLoading('Registering patient...');
        
        const response = await fetch('/api/register_patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(patientData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Patient registered successfully!', 'success');
            e.target.reset();
        } else {
            showMessage(result.error || 'Failed to register patient', 'error');
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleTestRequest(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const testData = Object.fromEntries(formData.entries());
    
    try {
        showLoading('Submitting test request...');
        
        const response = await fetch('/api/submit_test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Test request submitted successfully!', 'success');
            e.target.reset();
            
            // Automatically process the test (simulation)
            setTimeout(() => {
                processTest(result.testId);
            }, 1000);
        } else {
            showMessage(result.error || 'Failed to submit test request', 'error');
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function processTest(testId) {
    try {
        showLoading('Processing test...');
        
        const response = await fetch(`/api/process_test/${testId}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Test processed successfully!', 'success');
        } else {
            showMessage(result.error || 'Failed to process test', 'error');
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleSearchResults() {
    const patientId = document.getElementById('searchPatientId').value.trim();
    
    if (!patientId) {
        showMessage('Please enter a Patient ID', 'error');
        return;
    }
    
    try {
        showLoading('Searching for results...');
        
        const response = await fetch(`/api/search_results/${patientId}`);
        const result = await response.json();
        
        if (result.success) {
            displayResults(result);
        } else {
            showMessage(result.error || 'No results found', 'error');
            clearResultsDisplay();
        }
    } catch (error) {
        showMessage('Network error: ' + error.message, 'error');
        clearResultsDisplay();
    } finally {
        hideLoading();
    }
}

function displayResults(data) {
    const resultsDisplay = document.getElementById('resultsDisplay');
    
    if (!data.results || data.results.length === 0) {
        resultsDisplay.innerHTML = '<p>No test results found for this patient.</p>';
        return;
    }
    
    let html = `
        <div class="patient-info">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${data.patient.firstName} ${data.patient.lastName}</p>
            <p><strong>Patient ID:</strong> ${data.patient.patientId}</p>
            <p><strong>Date of Birth:</strong> ${formatDate(data.patient.dateOfBirth)}</p>
            <p><strong>Gender:</strong> ${data.patient.gender}</p>
        </div>
        <hr>
        <h3>Test Results</h3>
    `;
    
    data.results.forEach(result => {
        html += createResultCard(result);
    });
    
    resultsDisplay.innerHTML = html;
}

function createResultCard(result) {
    let html = `
        <div class="result-item">
            <h4>${getTestTypeName(result.testType)}</h4>
            <p><strong>Test Date:</strong> ${formatDate(result.processedDate)}</p>
            <p><strong>Status:</strong> <span class="status-${result.status}">${result.status}</span></p>
            
            <div class="test-info">
    `;
    
    if (result.analysis) {
        Object.keys(result.analysis).forEach(parameter => {
            const analysis = result.analysis[parameter];
            html += `
                <div class="test-parameter">
                    <div class="parameter-name">${formatParameterName(parameter)}</div>
                    <div class="parameter-value">${analysis.value} ${analysis.unit}</div>
                    <div class="parameter-status status-${analysis.status.toLowerCase()}">${analysis.status}</div>
                    <div class="parameter-range">Normal: ${analysis.normal_range}</div>
                </div>
            `;
        });
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function getTestTypeName(testType) {
    const testNames = {
        'cbc': 'Complete Blood Count (CBC)',
        'lipid': 'Lipid Profile',
        'glucose': 'Blood Glucose',
        'liver': 'Liver Function Test',
        'kidney': 'Kidney Function Test',
        'thyroid': 'Thyroid Function Test',
        'vitamin': 'Vitamin Panel'
    };
    return testNames[testType] || testType;
}

function formatParameterName(parameter) {
    return parameter.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function clearResultsDisplay() {
    const resultsDisplay = document.getElementById('resultsDisplay');
    resultsDisplay.innerHTML = '';
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the main content
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

function showLoading(message = 'Loading...') {
    // Remove existing loading indicators
    const existingLoading = document.querySelectorAll('.loading-indicator');
    existingLoading.forEach(loading => loading.remove());
    
    // Create loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div class="loading"></div>
            <p style="margin-top: 1rem;">${message}</p>
        </div>
    `;
    
    // Insert at the top of the main content
    const main = document.querySelector('main');
    main.insertBefore(loadingDiv, main.firstChild);
}

function hideLoading() {
    const loadingIndicators = document.querySelectorAll('.loading-indicator');
    loadingIndicators.forEach(loading => loading.remove());
}

async function loadInitialData() {
    // This function can be used to load initial data when the app starts
    // For now, it's empty but can be extended to load patient lists, etc.
}

// Utility functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            input.style.borderColor = '#ddd';
        }
        
        // Email validation
        if (input.type === 'email' && input.value && !validateEmail(input.value)) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        }
        
        // Phone validation
        if (input.type === 'tel' && input.value && !validatePhone(input.value)) {
            input.style.borderColor = '#e74c3c';
            isValid = false;
        }
    });
    
    return isValid;
}
