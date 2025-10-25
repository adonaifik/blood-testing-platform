// BLOOD TESTING - Interactive Laboratory Management System - JavaScript

// Global variables
let currentQuiz = null;
let currentQuestionIndex = 0;
let quizScore = 0;
let selectedAnswers = {};
let testTakers = [];
let tests = [];
let results = [];

// Feedback data storage and algorithm learning
let feedbackData = JSON.parse(localStorage.getItem('bloodTypeFeedback') || '[]');
let algorithmWeights = JSON.parse(localStorage.getItem('algorithmWeights') || JSON.stringify({
    A: { personality: 1.0, lifestyle: 1.0, preferences: 1.0 },
    B: { personality: 1.0, lifestyle: 1.0, preferences: 1.0 },
    AB: { personality: 1.0, lifestyle: 1.0, preferences: 1.0 },
    O: { personality: 1.0, lifestyle: 1.0, preferences: 1.0 }
}));
let learningRate = 0.1; // How much to adjust weights based on feedback

// Quiz questions database
const quizQuestions = [
    {
        id: 1,
        question: "What is the normal range for hemoglobin in adult males?",
        options: [
            "10-12 g/dL",
            "12-16 g/dL", 
            "16-20 g/dL",
            "8-10 g/dL"
        ],
        correct: 1,
        explanation: "Normal hemoglobin range for adult males is 12-16 g/dL."
    },
    {
        id: 2,
        question: "Which blood component is responsible for clotting?",
        options: [
            "Red blood cells",
            "White blood cells",
            "Platelets",
            "Plasma"
        ],
        correct: 2,
        explanation: "Platelets are responsible for blood clotting and wound healing."
    },
    {
        id: 3,
        question: "What does CBC stand for?",
        options: [
            "Complete Blood Count",
            "Comprehensive Blood Check",
            "Complete Blood Chemistry",
            "Comprehensive Blood Count"
        ],
        correct: 0,
        explanation: "CBC stands for Complete Blood Count, a common blood test."
    },
    {
        id: 4,
        question: "Normal fasting glucose level should be:",
        options: [
            "Below 70 mg/dL",
            "70-100 mg/dL",
            "100-126 mg/dL",
            "Above 126 mg/dL"
        ],
        correct: 1,
        explanation: "Normal fasting glucose level is 70-100 mg/dL."
    },
    {
        id: 5,
        question: "Which test measures kidney function?",
        options: [
            "ALT",
            "Creatinine",
            "Hemoglobin",
            "Glucose"
        ],
        correct: 1,
        explanation: "Creatinine is a key marker for kidney function assessment."
    },
    {
        id: 6,
        question: "What is the normal platelet count range?",
        options: [
            "50-100 K/uL",
            "100-150 K/uL",
            "150-450 K/uL",
            "450-600 K/uL"
        ],
        correct: 2,
        explanation: "Normal platelet count is 150-450 K/uL."
    },
    {
        id: 7,
        question: "Which blood type is known as the universal donor?",
        options: [
            "A+",
            "B+",
            "AB+",
            "O-"
        ],
        correct: 3,
        explanation: "O- is the universal donor as it can be given to any blood type."
    },
    {
        id: 8,
        question: "What does LDL cholesterol stand for?",
        options: [
            "Low Density Lipoprotein",
            "Low Density Lipid",
            "Large Density Lipoprotein",
            "Low Density Lipid Protein"
        ],
        correct: 0,
        explanation: "LDL stands for Low Density Lipoprotein, often called 'bad cholesterol'."
    },
    {
        id: 9,
        question: "Normal TSH (Thyroid Stimulating Hormone) range is:",
        options: [
            "0.1-0.4 mIU/L",
            "0.4-4.0 mIU/L",
            "4.0-10.0 mIU/L",
            "10.0-20.0 mIU/L"
        ],
        correct: 1,
        explanation: "Normal TSH range is 0.4-4.0 mIU/L."
    },
    {
        id: 10,
        question: "Which blood component carries oxygen?",
        options: [
            "White blood cells",
            "Platelets",
            "Hemoglobin in red blood cells",
            "Plasma proteins"
        ],
        correct: 2,
        explanation: "Hemoglobin in red blood cells carries oxygen throughout the body."
    }
];

// Blood Type Determination Quiz - Based on Personal Characteristics
const bloodTypeDeterminationQuiz = [
    {
        id: 1,
        question: "What is your general personality type?",
        options: [
            "Calm, patient, and methodical",
            "Energetic, adventurous, and spontaneous", 
            "Balanced, adaptable, and diplomatic",
            "Strong-willed, decisive, and natural leader"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Calm, patient, methodical -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Energetic, spontaneous -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Balanced, diplomatic -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: Strong-willed, leader -> Type O
        ]
    },
    {
        id: 2,
        question: "How do you typically react to stress?",
        options: [
            "I become anxious and worry a lot",
            "I get irritable and need to move around",
            "I adapt quickly and find solutions",
            "I take charge and organize everything"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Anxious, worry -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Irritable, need to move -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Adapt quickly -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: Take charge -> Type O
        ]
    },
    {
        id: 3,
        question: "What type of diet do you prefer?",
        options: [
            "Vegetarian or plant-based foods",
            "Varied diet with lots of different foods",
            "Balanced mix of everything",
            "High-protein, meat-heavy diet"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Vegetarian -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Varied diet -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Balanced mix -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: High-protein -> Type O
        ]
    },
    {
        id: 4,
        question: "How do you handle social situations?",
        options: [
            "I prefer small groups and intimate settings",
            "I enjoy meeting new people and socializing",
            "I'm comfortable in any social setting",
            "I naturally take leadership roles"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Small groups -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Meet new people -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Comfortable anywhere -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: Leadership roles -> Type O
        ]
    },
    {
        id: 5,
        question: "What's your typical sleep pattern?",
        options: [
            "I need 8+ hours and wake up refreshed",
            "I can function on less sleep",
            "My sleep varies depending on circumstances",
            "I'm an early riser and need less sleep"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Need 8+ hours -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Function on less sleep -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Varies -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: Early riser -> Type O
        ]
    },
    {
        id: 6,
        question: "How do you make decisions?",
        options: [
            "I think carefully and consider all options",
            "I go with my gut feeling",
            "I weigh pros and cons logically",
            "I make quick, decisive choices"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Think carefully -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Gut feeling -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Weigh pros/cons -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: Quick decisions -> Type O
        ]
    },
    {
        id: 7,
        question: "What type of exercise do you prefer?",
        options: [
            "Yoga, meditation, or gentle activities",
            "Team sports or group activities",
            "Mixed activities depending on mood",
            "Intense workouts or competitive sports"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Yoga/meditation -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Team sports -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Mixed activities -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: Intense workouts -> Type O
        ]
    },
    {
        id: 8,
        question: "How do you handle conflicts?",
        options: [
            "I avoid conflicts and try to keep peace",
            "I express my feelings openly",
            "I try to find compromise solutions",
            "I confront issues directly and head-on"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Avoid conflicts -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Express feelings -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Find compromise -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: Confront directly -> Type O
        ]
    },
    {
        id: 9,
        question: "What's your work style?",
        options: [
            "Detail-oriented and perfectionist",
            "Creative and flexible",
            "Adaptable to different projects",
            "Goal-oriented and results-driven"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Detail-oriented -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Creative/flexible -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Adaptable -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: Goal-oriented -> Type O
        ]
    },
    {
        id: 10,
        question: "How do you react to new environments?",
        options: [
            "I need time to adjust and feel comfortable",
            "I adapt quickly and enjoy new experiences",
            "I'm flexible and adjust as needed",
            "I take control and make it work for me"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Need time to adjust -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Adapt quickly -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Flexible -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: Take control -> Type O
        ]
    },
    {
        id: 11,
        question: "What's your typical energy level?",
        options: [
            "Steady and consistent throughout the day",
            "Variable - high energy bursts",
            "Depends on the situation",
            "High energy, especially in the morning"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Steady/consistent -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Variable bursts -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Depends on situation -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: High morning energy -> Type O
        ]
    },
    {
        id: 12,
        question: "How do you prefer to learn new things?",
        options: [
            "Step-by-step with detailed instructions",
            "Through hands-on experience and trial",
            "Through discussion and collaboration",
            "By jumping in and figuring it out"
        ],
        bloodTypeWeights: [
            { A: 4, B: 1, AB: 2, O: 1 }, // Option 0: Step-by-step -> Type A
            { A: 1, B: 4, AB: 1, O: 2 }, // Option 1: Hands-on -> Type B
            { A: 2, B: 2, AB: 4, O: 1 }, // Option 2: Discussion/collaboration -> Type AB
            { A: 1, B: 1, AB: 1, O: 4 }  // Option 3: Jump in -> Type O
        ]
    }
];

// Blood Type Characteristics for Results
const bloodTypeCharacteristics = {
    A: {
        name: "Blood Type A",
        emoji: "🅰️",
        traits: [
            "Calm and patient under pressure",
            "Detail-oriented and methodical",
            "Prefers vegetarian or plant-based foods",
            "Needs adequate sleep (8+ hours)",
            "Avoids conflicts and seeks harmony",
            "Perfectionist work style",
            "Step-by-step learning approach"
        ],
        compatibility: {
            canReceive: "A and O blood types",
            canDonate: "A and AB blood types",
            population: "About 40% of population"
        },
        healthTips: [
            "Manage stress through meditation or yoga",
            "Maintain regular sleep schedule",
            "Consider plant-based diet",
            "Practice relaxation techniques"
        ]
    },
    B: {
        name: "Blood Type B",
        emoji: "🅱️",
        traits: [
            "Energetic and spontaneous",
            "Gut-feeling decision maker",
            "Enjoys varied diet",
            "Adapts quickly to new environments",
            "Expresses feelings openly",
            "Creative and flexible work style",
            "Hands-on learning preference"
        ],
        compatibility: {
            canReceive: "B and O blood types",
            canDonate: "B and AB blood types",
            population: "About 15% of population"
        },
        healthTips: [
            "Engage in regular physical activity",
            "Try new foods and experiences",
            "Express emotions healthily",
            "Maintain social connections"
        ]
    },
    AB: {
        name: "Blood Type AB",
        emoji: "🆎",
        traits: [
            "Balanced and adaptable",
            "Diplomatic and compromising",
            "Flexible diet preferences",
            "Comfortable in any social setting",
            "Logical decision maker",
            "Adaptable work style",
            "Collaborative learning approach"
        ],
        compatibility: {
            canReceive: "All blood types (universal recipient)",
            canDonate: "AB blood type only",
            population: "About 6% of population (rarest)"
        },
        healthTips: [
            "Maintain balanced lifestyle",
            "Practice stress management",
            "Stay socially connected",
            "Keep flexible routine"
        ]
    },
    O: {
        name: "Blood Type O",
        emoji: "🅾️",
        traits: [
            "Natural leader and decisive",
            "Quick decision maker",
            "Prefers high-protein diet",
            "Takes leadership roles",
            "Confronts issues directly",
            "Goal-oriented work style",
            "Learn by doing approach"
        ],
        compatibility: {
            canReceive: "O blood type only",
            canDonate: "All blood types (universal donor)",
            population: "About 25% of population"
        },
        healthTips: [
            "Engage in intense physical activity",
            "Maintain high-protein diet",
            "Take leadership opportunities",
            "Practice direct communication"
        ]
    }
};

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateActiveNavigation();
    loadDashboardData();
    generateFloatingCells();
}

function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Test taker form
    const testTakerForm = document.getElementById('testTakerForm');
    if (testTakerForm) {
        testTakerForm.addEventListener('submit', handleTestTakerRegistration);
    }
    
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearchResults);
    }
    
    const searchInput = document.getElementById('searchTestTakerId');
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
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Show learning analytics if viewing analytics section
        if (targetId === 'analytics') {
            setTimeout(() => {
                displayLearningAnalytics();
            }, 100);
        }
    }
    
    // Load section-specific data
    if (targetId === 'dashboard') {
        loadDashboardData();
    } else if (targetId === 'quiz-testing') {
        initializeQuiz();
    } else if (targetId === 'analytics') {
        loadAnalytics();
    }
}

function updateActiveNavigation() {
    // Show dashboard by default
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.classList.add('active');
    }
}

// Dashboard Functions
function loadDashboardData() {
    updateStats();
    loadRecentActivity();
    updateQuizStats();
}

function updateStats() {
    document.getElementById('totalTests').textContent = tests.length;
    
    // Update learning analytics if available
    const analytics = showLearningAnalytics();
    if (analytics.totalFeedback > 0) {
        console.log(`Algorithm Learning Progress:
        Total Feedback: ${analytics.totalFeedback}
        Accuracy: ${analytics.accuracy}%
        Learning Status: ${analytics.accuracy > 70 ? 'Good' : 'Improving'}`);
    }
}

function loadRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    const activities = [
        { time: 'Just now', text: 'System initialized' },
        { time: '2 min ago', text: 'Dashboard loaded' },
        { time: '5 min ago', text: 'Quiz system ready' }
    ];
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <span class="activity-time">${activity.time}</span>
            <span class="activity-text">${activity.text}</span>
        </div>
    `).join('');
}

function updateQuizStats() {
    const completedQuizzes = results.filter(r => r.type === 'quiz').length;
    const totalScore = results.filter(r => r.type === 'quiz').reduce((sum, r) => sum + r.score, 0);
    const avgScore = completedQuizzes > 0 ? Math.round(totalScore / completedQuizzes) : 0;
    
    document.getElementById('avgScore').textContent = avgScore + '%';
    document.getElementById('completionRate').textContent = '100%'; // Simplified for demo
}

// Quick Actions
function startNewQuiz() {
    // Navigate to quiz testing section
    handleNavigation({ preventDefault: () => {}, target: { getAttribute: () => 'quiz-testing' } });
    // Start the blood type determination quiz
    setTimeout(() => {
        startBloodTypeDetermination();
    }, 100);
}

function openRegistration() {
    handleNavigation({ preventDefault: () => {}, target: { getAttribute: () => 'registration' } });
}

function viewResults() {
    handleNavigation({ preventDefault: () => {}, target: { getAttribute: () => 'test-results' } });
}

// Quiz Functions
let currentQuizType = 'general';

function initializeQuiz() {
    showQuizSelection();
}

function showQuizSelection() {
    document.getElementById('quizSelection').style.display = 'block';
    document.getElementById('quizContainer').style.display = 'none';
}

function startBloodTypeDetermination() {
    currentQuiz = [...bloodTypeDeterminationQuiz];
    currentQuizType = 'determination';
    startQuiz('Blood Type Determination Test', 'Determination');
}

function startGeneralQuiz() {
    currentQuiz = [...quizQuestions];
    currentQuizType = 'general';
    startQuiz('General Blood Testing', 'General');
}

function startCompatibilityQuiz() {
    currentQuizType = 'compatibility';
    displayCompatibilityTable();
}

function startQuiz(title, type) {
    currentQuestionIndex = 0;
    quizScore = 0;
    selectedAnswers = {};
    
    document.getElementById('quizSelection').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('quizTitle').textContent = title;
    document.getElementById('quizType').textContent = type;
    document.getElementById('currentScore').textContent = '0';
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('prevBtn').disabled = true;
    
    displayQuestion();
}

function backToQuizSelection() {
    showQuizSelection();
}

function generateCompatibilityQuiz() {
    // This function now returns a special compatibility table instead of questions
    return {
        type: 'compatibility_table',
        title: 'Blood Type Compatibility Reference'
    };
}

function displayQuestion() {
    const question = currentQuiz[currentQuestionIndex];
    const questionText = document.getElementById('questionText');
    const questionOptions = document.getElementById('questionOptions');
    const progressFill = document.getElementById('quizProgress');
    const progressText = document.getElementById('progressText');
    
    questionText.textContent = question.question;
    
    questionOptions.innerHTML = question.options.map((option, index) => `
        <div class="quiz-option" onclick="selectOption(${index})" data-index="${index}">
            ${option}
        </div>
    `).join('');
    
    // Update progress
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuiz.length}`;
    
    // Update buttons
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = !selectedAnswers[currentQuestionIndex];
    
    if (currentQuestionIndex === currentQuiz.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'inline-block';
    } else {
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('submitBtn').style.display = 'none';
    }
    
    // Highlight selected answer
    if (selectedAnswers[currentQuestionIndex] !== undefined) {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => option.classList.remove('selected'));
        options[selectedAnswers[currentQuestionIndex]].classList.add('selected');
    }
}

function selectOption(optionIndex) {
    selectedAnswers[currentQuestionIndex] = optionIndex;
    
    // Update visual selection
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => option.classList.remove('selected'));
    options[optionIndex].classList.add('selected');
    
    // Enable next button
    document.getElementById('nextBtn').disabled = false;
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function submitQuiz() {
    if (currentQuizType === 'determination') {
        console.log('Submitting blood type determination quiz...');
        console.log('Selected answers:', selectedAnswers);
        const determinedBloodType = calculateBloodType();
        console.log('Calculated blood type:', determinedBloodType);
        displayBloodTypeResult(determinedBloodType);
    } else {
        // Calculate score for other quiz types
        let correctAnswers = 0;
        currentQuiz.forEach((question, index) => {
            if (selectedAnswers[index] === question.correct) {
                correctAnswers++;
            }
        });
        
        quizScore = Math.round((correctAnswers / currentQuiz.length) * 100);
        
        // Save result
        const quizResult = {
            id: 'quiz_' + Date.now(),
            type: 'quiz',
            score: quizScore,
            totalQuestions: currentQuiz.length,
            correctAnswers: correctAnswers,
            timestamp: new Date().toISOString(),
            answers: selectedAnswers
        };
        
        results.push(quizResult);
        
        // Display results
        displayQuizResults(quizResult);
    }
    
    // Update dashboard stats
    updateStats();
    updateQuizStats();
}

function calculateBloodType() {
    // Use the learning-enhanced calculation
    const result = calculateBloodTypeWithLearning();
    
    console.log('Learning-enhanced blood type calculation:', result);
    console.log('Current algorithm weights:', algorithmWeights);
    console.log('Total feedback collected:', feedbackData.length);
    
    return result;
}

function displayBloodTypeResult(result) {
    const quizContent = document.querySelector('.quiz-content');
    const bloodType = bloodTypeCharacteristics[result.type];
    
    let html = `
        <div class="blood-type-result">
            <div class="result-header">
                <h2>Your Predicted Blood Type</h2>
                <div class="blood-type-display">
                    <div class="blood-type-icon">${bloodType.emoji}</div>
                    <div class="blood-type-name">${bloodType.name}</div>
                    <div class="confidence-level">Confidence: ${result.confidence}%</div>
                </div>
            </div>
            
            <div class="blood-type-details">
                <div class="traits-section">
                    <h3>Your Characteristics</h3>
                    <ul class="traits-list">
                        ${bloodType.traits.map(trait => `<li>${trait}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="compatibility-section">
                    <h3>Blood Compatibility</h3>
                    <div class="compatibility-info">
                        <div class="compat-item">
                            <strong>Can Receive From:</strong> ${bloodType.compatibility.canReceive}
                        </div>
                        <div class="compat-item">
                            <strong>Can Donate To:</strong> ${bloodType.compatibility.canDonate}
                        </div>
                        <div class="compat-item">
                            <strong>Population:</strong> ${bloodType.compatibility.population}
                        </div>
                    </div>
                </div>
                
                <div class="health-tips-section">
                    <h3>Health Recommendations</h3>
                    <ul class="health-tips">
                        ${bloodType.healthTips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="score-breakdown">
                    <h3>Score Breakdown</h3>
                    <div class="scores-grid">
                        <div class="score-item ${result.type === 'A' ? 'highest' : ''}">
                            <span class="score-label">Type A:</span>
                            <span class="score-value">${result.scores.A}</span>
                        </div>
                        <div class="score-item ${result.type === 'B' ? 'highest' : ''}">
                            <span class="score-label">Type B:</span>
                            <span class="score-value">${result.scores.B}</span>
                        </div>
                        <div class="score-item ${result.type === 'AB' ? 'highest' : ''}">
                            <span class="score-label">Type AB:</span>
                            <span class="score-value">${result.scores.AB}</span>
                        </div>
                        <div class="score-item ${result.type === 'O' ? 'highest' : ''}">
                            <span class="score-label">Type O:</span>
                            <span class="score-value">${result.scores.O}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="quiz-actions">
                <button class="btn btn-primary" onclick="startBloodTypeDetermination()">Retake Test</button>
                <button class="btn btn-secondary" onclick="backToQuizSelection()">Back to Quiz Types</button>
            </div>
            
            <div class="disclaimer">
                <p><strong>Disclaimer:</strong> This is a personality-based prediction and should not replace actual blood testing. For medical purposes, always consult with healthcare professionals.</p>
            </div>
        </div>
    `;
    
    quizContent.innerHTML = html;
    
    // Hide the quiz controls since we're showing results
    document.querySelector('.quiz-controls').style.display = 'none';
    
    // Show feedback popup after a short delay
    setTimeout(() => {
        showFeedbackPopup(result.type, result.confidence);
    }, 1000);
}

function showFeedbackPopup(predictedBloodType, confidence) {
    // Create feedback popup
    const feedbackPopup = document.createElement('div');
    feedbackPopup.className = 'feedback-popup-overlay';
    feedbackPopup.innerHTML = `
        <div class="feedback-popup">
            <div class="feedback-header">
                <h3>🔬 Prototype Feedback</h3>
                <p>Since this is a prototype, we highly value your response for our better service.</p>
            </div>
            
            <div class="feedback-question">
                <h4>Was the result correct?</h4>
                <p>We predicted your blood type as: <strong>${predictedBloodType}</strong> (${confidence}% confidence)</p>
            </div>
            
            <div class="feedback-buttons">
                <button class="btn btn-success feedback-btn" onclick="handleFeedbackResponse(true, '${predictedBloodType}')">
                    ✅ Yes, it's correct
                </button>
                <button class="btn btn-danger feedback-btn" onclick="handleFeedbackResponse(false, '${predictedBloodType}')">
                    ❌ No, it's incorrect
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(feedbackPopup);
}

function handleFeedbackResponse(isCorrect, predictedBloodType) {
    // Store feedback data
    const feedback = {
        timestamp: new Date().toISOString(),
        predictedBloodType: predictedBloodType,
        isCorrect: isCorrect,
        userAnswers: [...selectedAnswers], // Store the user's quiz answers
        actualBloodType: null // Will be filled if incorrect
    };
    
    if (isCorrect) {
        // Store positive feedback
        feedbackData.push(feedback);
        localStorage.setItem('bloodTypeFeedback', JSON.stringify(feedbackData));
        
        // Update algorithm weights for correct prediction
        updateAlgorithmWeights(predictedBloodType, true, selectedAnswers);
        
        showGratitudeMessage(true);
    } else {
        showActualBloodTypeSelection(predictedBloodType);
    }
}

function showActualBloodTypeSelection(predictedBloodType) {
    // Remove existing popup
    const existingPopup = document.querySelector('.feedback-popup-overlay');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create blood type selection popup
    const selectionPopup = document.createElement('div');
    selectionPopup.className = 'feedback-popup-overlay';
    selectionPopup.innerHTML = `
        <div class="feedback-popup">
            <div class="feedback-header">
                <h3>🩸 What is your actual blood type?</h3>
                <p>Thank you for helping us improve our algorithm!</p>
            </div>
            
            <div class="blood-type-selection">
                <div class="blood-type-grid">
                    <button class="blood-type-option" onclick="selectActualBloodType('A+')">A+</button>
                    <button class="blood-type-option" onclick="selectActualBloodType('A-')">A-</button>
                    <button class="blood-type-option" onclick="selectActualBloodType('B+')">B+</button>
                    <button class="blood-type-option" onclick="selectActualBloodType('B-')">B-</button>
                    <button class="blood-type-option" onclick="selectActualBloodType('AB+')">AB+</button>
                    <button class="blood-type-option" onclick="selectActualBloodType('AB-')">AB-</button>
                    <button class="blood-type-option" onclick="selectActualBloodType('O+')">O+</button>
                    <button class="blood-type-option" onclick="selectActualBloodType('O-')">O-</button>
                </div>
            </div>
            
            <div class="feedback-note">
                <p><small>We predicted: <strong>${predictedBloodType}</strong> | Your actual: <span id="selectedType">Select above</span></p>
            </div>
        </div>
    `;
    
    document.body.appendChild(selectionPopup);
}

function selectActualBloodType(actualBloodType) {
    // Update the display
    const selectedTypeSpan = document.getElementById('selectedType');
    if (selectedTypeSpan) {
        selectedTypeSpan.textContent = actualBloodType;
    }
    
    // Store feedback data with actual blood type
    const lastFeedback = feedbackData[feedbackData.length - 1];
    if (lastFeedback) {
        lastFeedback.actualBloodType = actualBloodType;
        lastFeedback.isCorrect = false;
        
        // Update algorithm weights for incorrect prediction
        updateAlgorithmWeights(lastFeedback.predictedBloodType, false, selectedAnswers, actualBloodType);
        
        // Save updated feedback
        localStorage.setItem('bloodTypeFeedback', JSON.stringify(feedbackData));
    }
    
    // Show gratitude and close popup
    setTimeout(() => {
        showGratitudeMessage(false, actualBloodType);
    }, 500);
}

function showGratitudeMessage(isCorrect, actualBloodType = null) {
    // Remove existing popup
    const existingPopup = document.querySelector('.feedback-popup-overlay');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    let message = '';
    if (isCorrect) {
        message = `
            <div class="feedback-popup">
                <div class="feedback-header">
                    <h3>🎉 Thank You!</h3>
                    <p>Your feedback helps us improve our blood type prediction algorithm!</p>
                </div>
                <div class="gratitude-message">
                    <p>We're glad our prediction was accurate. Your input is valuable for making our service better!</p>
                    <button class="btn btn-primary" onclick="closeFeedbackPopup()">Continue</button>
                </div>
            </div>
        `;
    } else {
        message = `
            <div class="feedback-popup">
                <div class="feedback-header">
                    <h3>🙏 Thank You!</h3>
                    <p>Your feedback is incredibly valuable for improving our algorithm!</p>
                </div>
                <div class="gratitude-message">
                    <p>We predicted <strong>${actualBloodType}</strong> but you have <strong>${actualBloodType}</strong>. This data helps us refine our personality-based predictions.</p>
                    <button class="btn btn-primary" onclick="closeFeedbackPopup()">Continue</button>
                </div>
            </div>
        `;
    }
    
    const gratitudePopup = document.createElement('div');
    gratitudePopup.className = 'feedback-popup-overlay';
    gratitudePopup.innerHTML = message;
    
    document.body.appendChild(gratitudePopup);
}

function closeFeedbackPopup() {
    const popup = document.querySelector('.feedback-popup-overlay');
    if (popup) {
        popup.remove();
    }
}

// Algorithm Learning Functions
function updateAlgorithmWeights(predictedBloodType, isCorrect, userAnswers, actualBloodType = null) {
    if (isCorrect) {
        // Strengthen weights for the correctly predicted blood type
        strengthenWeights(predictedBloodType, userAnswers);
    } else {
        // Weaken weights for the incorrectly predicted blood type
        weakenWeights(predictedBloodType, userAnswers);
        
        // Strengthen weights for the actual blood type
        if (actualBloodType) {
            strengthenWeights(actualBloodType, userAnswers);
        }
    }
    
    // Save updated weights
    localStorage.setItem('algorithmWeights', JSON.stringify(algorithmWeights));
    
    console.log('Algorithm weights updated:', algorithmWeights);
}

function strengthenWeights(bloodType, userAnswers) {
    // Increase weights for the blood type based on user answers
    const baseType = bloodType.replace(/[+-]/, ''); // Remove Rh factor for base type
    
    userAnswers.forEach((answer, questionIndex) => {
        if (answer && answer.bloodTypeWeights) {
            const weight = answer.bloodTypeWeights[baseType] || 0;
            if (weight > 0) {
                algorithmWeights[baseType].personality += learningRate * weight;
                algorithmWeights[baseType].lifestyle += learningRate * weight;
                algorithmWeights[baseType].preferences += learningRate * weight;
            }
        }
    });
}

function weakenWeights(bloodType, userAnswers) {
    // Decrease weights for the blood type based on user answers
    const baseType = bloodType.replace(/[+-]/, ''); // Remove Rh factor for base type
    
    userAnswers.forEach((answer, questionIndex) => {
        if (answer && answer.bloodTypeWeights) {
            const weight = answer.bloodTypeWeights[baseType] || 0;
            if (weight > 0) {
                algorithmWeights[baseType].personality -= learningRate * weight * 0.5;
                algorithmWeights[baseType].lifestyle -= learningRate * weight * 0.5;
                algorithmWeights[baseType].preferences -= learningRate * weight * 0.5;
                
                // Ensure weights don't go below 0.1
                algorithmWeights[baseType].personality = Math.max(0.1, algorithmWeights[baseType].personality);
                algorithmWeights[baseType].lifestyle = Math.max(0.1, algorithmWeights[baseType].lifestyle);
                algorithmWeights[baseType].preferences = Math.max(0.1, algorithmWeights[baseType].preferences);
            }
        }
    });
}

// Enhanced blood type calculation with learned weights
function calculateBloodTypeWithLearning() {
    const scores = { A: 0, B: 0, AB: 0, O: 0 };
    
    // Apply learned weights to the calculation
    Object.keys(selectedAnswers).forEach(questionIndex => {
        const answer = selectedAnswers[questionIndex];
        if (answer && answer.bloodTypeWeights) {
            Object.keys(scores).forEach(bloodType => {
                const baseWeight = answer.bloodTypeWeights[bloodType] || 0;
                const learnedWeight = algorithmWeights[bloodType].personality * 
                                   algorithmWeights[bloodType].lifestyle * 
                                   algorithmWeights[bloodType].preferences;
                
                scores[bloodType] += baseWeight * learnedWeight;
            });
        }
    });
    
    // Find the blood type with highest score
    const maxScore = Math.max(...Object.values(scores));
    const predictedType = Object.keys(scores).find(type => scores[type] === maxScore);
    
    // Calculate confidence based on score difference
    const sortedScores = Object.values(scores).sort((a, b) => b - a);
    const confidence = Math.round(((sortedScores[0] - sortedScores[1]) / sortedScores[0]) * 100);
    
    return {
        type: predictedType,
        scores: scores,
        confidence: Math.max(confidence, 60) // Minimum 60% confidence
    };
}

// Analytics function to show learning progress
function showLearningAnalytics() {
    const totalFeedback = feedbackData.length;
    const correctPredictions = feedbackData.filter(f => f.isCorrect).length;
    const accuracy = totalFeedback > 0 ? Math.round((correctPredictions / totalFeedback) * 100) : 0;
    
    console.log(`Learning Analytics:
    Total Feedback: ${totalFeedback}
    Correct Predictions: ${correctPredictions}
    Accuracy: ${accuracy}%
    Algorithm Weights:`, algorithmWeights);
    
    return {
        totalFeedback,
        correctPredictions,
        accuracy,
        weights: algorithmWeights
    };
}

// Display learning analytics in the analytics section
function displayLearningAnalytics() {
    const analytics = showLearningAnalytics();
    
    if (analytics.totalFeedback > 0) {
        const analyticsCard = document.querySelector('#analytics .analytics-card:last-child');
        if (analyticsCard) {
            analyticsCard.innerHTML = `
                <h3>🤖 Algorithm Learning Progress</h3>
                <div class="learning-stats">
                    <div class="learning-stat">
                        <span class="stat-label">Total Feedback:</span>
                        <span class="stat-value">${analytics.totalFeedback}</span>
                    </div>
                    <div class="learning-stat">
                        <span class="stat-label">Accuracy:</span>
                        <span class="stat-value">${analytics.accuracy}%</span>
                    </div>
                    <div class="learning-stat">
                        <span class="stat-label">Status:</span>
                        <span class="stat-value ${analytics.accuracy > 70 ? 'good' : 'improving'}">${analytics.accuracy > 70 ? 'Good' : 'Improving'}</span>
                    </div>
                    <div class="learning-weights">
                        <h4>Current Algorithm Weights:</h4>
                        <div class="weights-grid">
                            ${Object.keys(analytics.weights).map(type => `
                                <div class="weight-item">
                                    <span class="weight-type">${type}:</span>
                                    <div class="weight-bars">
                                        <div class="weight-bar">
                                            <span>Personality: ${analytics.weights[type].personality.toFixed(2)}</span>
                                        </div>
                                        <div class="weight-bar">
                                            <span>Lifestyle: ${analytics.weights[type].lifestyle.toFixed(2)}</span>
                                        </div>
                                        <div class="weight-bar">
                                            <span>Preferences: ${analytics.weights[type].preferences.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

function displayCompatibilityTable() {
    // Hide quiz selection and show quiz container
    document.getElementById('quizSelection').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    
    // Update quiz header
    document.getElementById('quizTitle').textContent = 'Blood Type Compatibility Reference';
    document.getElementById('quizType').textContent = 'Compatibility';
    document.getElementById('currentScore').textContent = 'N/A';
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('prevBtn').style.display = 'none';
    document.getElementById('backToSelection').style.display = 'inline-block';
    
    // Create comprehensive compatibility table
    const quizContent = document.querySelector('.quiz-content');
    
    const compatibilityData = [
        {
            bloodType: 'A+',
            emoji: '🅰️',
            canReceive: ['A+', 'A-', 'O+', 'O-'],
            canDonate: ['A+', 'AB+'],
            population: '37%',
            antigens: 'A antigen, Rh+',
            antibodies: 'Anti-B'
        },
        {
            bloodType: 'A-',
            emoji: '🅰️',
            canReceive: ['A-', 'O-'],
            canDonate: ['A+', 'A-', 'AB+', 'AB-'],
            population: '6%',
            antigens: 'A antigen',
            antibodies: 'Anti-B, Anti-Rh'
        },
        {
            bloodType: 'B+',
            emoji: '🅱️',
            canReceive: ['B+', 'B-', 'O+', 'O-'],
            canDonate: ['B+', 'AB+'],
            population: '9%',
            antigens: 'B antigen, Rh+',
            antibodies: 'Anti-A'
        },
        {
            bloodType: 'B-',
            emoji: '🅱️',
            canReceive: ['B-', 'O-'],
            canDonate: ['B+', 'B-', 'AB+', 'AB-'],
            population: '2%',
            antigens: 'B antigen',
            antibodies: 'Anti-A, Anti-Rh'
        },
        {
            bloodType: 'AB+',
            emoji: '🆎',
            canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            canDonate: ['AB+'],
            population: '3%',
            antigens: 'A & B antigens, Rh+',
            antibodies: 'None (Universal Recipient)'
        },
        {
            bloodType: 'AB-',
            emoji: '🆎',
            canReceive: ['A-', 'B-', 'AB-', 'O-'],
            canDonate: ['AB+', 'AB-'],
            population: '1%',
            antigens: 'A & B antigens',
            antibodies: 'Anti-Rh'
        },
        {
            bloodType: 'O+',
            emoji: '🅾️',
            canReceive: ['O+', 'O-'],
            canDonate: ['A+', 'B+', 'AB+', 'O+'],
            population: '35%',
            antigens: 'Rh+',
            antibodies: 'Anti-A, Anti-B'
        },
        {
            bloodType: 'O-',
            emoji: '🅾️',
            canReceive: ['O-'],
            canDonate: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            population: '7%',
            antigens: 'None',
            antibodies: 'Anti-A, Anti-B, Anti-Rh (Universal Donor)'
        }
    ];
    
    let html = `
        <div class="compatibility-reference">
            <div class="compatibility-header">
                <h2>Blood Type Compatibility Reference</h2>
                <p class="compatibility-description">
                    This table shows which blood types can safely receive blood from or donate blood to other types. 
                    Always consult with medical professionals for actual blood transfusions.
                </p>
            </div>
            
            <div class="compatibility-table-container">
                <table class="compatibility-table">
                    <thead>
                        <tr>
                            <th>Blood Type</th>
                            <th>Population</th>
                            <th>Can Receive From</th>
                            <th>Can Donate To</th>
                            <th>Antigens</th>
                            <th>Antibodies</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${compatibilityData.map(type => `
                            <tr class="blood-type-row">
                                <td class="blood-type-cell">
                                    <div class="blood-type-info">
                                        <span class="blood-type-emoji">${type.emoji}</span>
                                        <span class="blood-type-name">${type.bloodType}</span>
                                    </div>
                                </td>
                                <td class="population-cell">${type.population}</td>
                                <td class="receive-cell">
                                    <div class="compatibility-list">
                                        ${type.canReceive.map(bt => `<span class="compat-tag receive">${bt}</span>`).join('')}
                                    </div>
                                </td>
                                <td class="donate-cell">
                                    <div class="compatibility-list">
                                        ${type.canDonate.map(bt => `<span class="compat-tag donate">${bt}</span>`).join('')}
                                    </div>
                                </td>
                                <td class="antigens-cell">${type.antigens}</td>
                                <td class="antibodies-cell">${type.antibodies}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="compatibility-legend">
                <h3>Understanding Blood Type Compatibility</h3>
                <div class="legend-items">
                    <div class="legend-item">
                        <span class="legend-color receive"></span>
                        <span>Can Receive From</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color donate"></span>
                        <span>Can Donate To</span>
                    </div>
                </div>
            </div>
            
            <div class="compatibility-notes">
                <h3>Important Notes</h3>
                <ul>
                    <li><strong>Universal Donor:</strong> O- can donate to all blood types</li>
                    <li><strong>Universal Recipient:</strong> AB+ can receive from all blood types</li>
                    <li><strong>Rh Factor:</strong> Rh+ can receive from both Rh+ and Rh-, but Rh- can only receive from Rh-</li>
                    <li><strong>Emergency:</strong> In life-threatening situations, O- blood can be given to anyone</li>
                    <li><strong>Always verify:</strong> Cross-matching is always performed before actual transfusions</li>
                </ul>
            </div>
            
            <div class="quiz-actions">
                <button class="btn btn-secondary" onclick="backToQuizSelection()">Back to Quiz Types</button>
            </div>
        </div>
    `;
    
    quizContent.innerHTML = html;
    
    // Hide the quiz controls since we're showing a reference table
    document.querySelector('.quiz-controls').style.display = 'none';
}

function displayQuizResults(result) {
    const resultsDisplay = document.getElementById('resultsDisplay');
    
    let html = `
        <div class="quiz-results">
            <h3>Quiz Results</h3>
            <div class="result-summary">
                <div class="score-display">
                    <h2>Your Score: ${result.score}%</h2>
                    <p>${result.correctAnswers} out of ${result.totalQuestions} questions correct</p>
                </div>
            </div>
    `;
    
    // Add blood type analysis if it's a blood type quiz
    if (currentQuizType === 'bloodType') {
        const bloodType = document.getElementById('quizType').textContent;
        html += generateBloodTypeAnalysis(bloodType, result.score);
    }
    
    // Add compatibility chart if it's a compatibility quiz
    if (currentQuizType === 'compatibility') {
        html += generateCompatibilityChart();
    }
    
    html += `
            <div class="detailed-results">
                <h4>Question Review:</h4>
    `;
    
    currentQuiz.forEach((question, index) => {
        const userAnswer = selectedAnswers[index];
        const isCorrect = userAnswer === question.correct;
        const answerClass = isCorrect ? 'correct' : 'incorrect';
        
        html += `
            <div class="question-review ${answerClass}">
                <h5>Question ${index + 1}: ${question.question}</h5>
                <p><strong>Your Answer:</strong> ${question.options[userAnswer]}</p>
                <p><strong>Correct Answer:</strong> ${question.options[question.correct]}</p>
                <p><strong>Explanation:</strong> ${question.explanation}</p>
            </div>
        `;
    });
    
    html += `
            </div>
            <div class="quiz-actions">
                <button class="btn btn-primary" onclick="initializeQuiz()">Take Another Quiz</button>
                <button class="btn btn-secondary" onclick="backToQuizSelection()">Back to Quiz Types</button>
            </div>
        </div>
    `;
    
    resultsDisplay.innerHTML = html;
    
    // Show results section
    handleNavigation({ preventDefault: () => {}, target: { getAttribute: () => 'test-results' } });
}

function generateBloodTypeAnalysis(bloodType, score) {
    const analysis = getBloodTypeAnalysis(bloodType);
    
    return `
        <div class="blood-type-analysis">
            <h3>Blood Type ${bloodType} Analysis</h3>
            <div class="analysis-content">
                <div class="analysis-section">
                    <h4>Key Characteristics:</h4>
                    <ul>
                        <li><strong>Antigens:</strong> ${analysis.antigens}</li>
                        <li><strong>Antibodies:</strong> ${analysis.antibodies}</li>
                        <li><strong>Population:</strong> ${analysis.population}</li>
                    </ul>
                </div>
                
                <div class="analysis-section">
                    <h4>Compatibility:</h4>
                    <div class="compatibility-info">
                        <div class="can-receive">
                            <strong>Can Receive From:</strong> ${analysis.canReceive}
                        </div>
                        <div class="can-donate">
                            <strong>Can Donate To:</strong> ${analysis.canDonate}
                        </div>
                    </div>
                </div>
                
                <div class="analysis-section">
                    <h4>Your Knowledge Level:</h4>
                    <div class="knowledge-level">
                        ${getKnowledgeLevel(score)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getBloodTypeAnalysis(bloodType) {
    const analyses = {
        'A': {
            antigens: 'A antigens on red blood cells',
            antibodies: 'Anti-B antibodies in plasma',
            population: 'About 40% of population',
            canReceive: 'A and O blood types',
            canDonate: 'A and AB blood types'
        },
        'B': {
            antigens: 'B antigens on red blood cells',
            antibodies: 'Anti-A antibodies in plasma',
            population: 'About 15% of population',
            canReceive: 'B and O blood types',
            canDonate: 'B and AB blood types'
        },
        'AB': {
            antigens: 'Both A and B antigens on red blood cells',
            antibodies: 'No antibodies in plasma (universal recipient)',
            population: 'About 6% of population (rarest)',
            canReceive: 'All blood types (universal recipient)',
            canDonate: 'AB blood type only'
        },
        'O': {
            antigens: 'No antigens on red blood cells',
            antibodies: 'Both anti-A and anti-B antibodies',
            population: 'About 25% of population',
            canReceive: 'O blood type only',
            canDonate: 'All blood types (universal donor)'
        }
    };
    
    return analyses[bloodType] || analyses['A'];
}

function getKnowledgeLevel(score) {
    if (score >= 90) {
        return '<span class="knowledge-expert">Expert Level! 🏆</span><br>Excellent understanding of blood type characteristics.';
    } else if (score >= 80) {
        return '<span class="knowledge-advanced">Advanced Level! 🌟</span><br>Very good knowledge of blood type concepts.';
    } else if (score >= 70) {
        return '<span class="knowledge-intermediate">Intermediate Level! 👍</span><br>Good understanding with room for improvement.';
    } else if (score >= 60) {
        return '<span class="knowledge-basic">Basic Level! 📚</span><br>Some understanding, consider reviewing the material.';
    } else {
        return '<span class="knowledge-beginner">Beginner Level! 🎯</span><br>Consider studying blood type basics more thoroughly.';
    }
}

function generateCompatibilityChart() {
    return `
        <div class="compatibility-chart">
            <h3>Blood Type Compatibility Reference</h3>
            <div class="compatibility-grid">
                <div class="compatibility-item">
                    <h4>🅰️ Type A</h4>
                    <p><strong>Receives:</strong> A, O<br><strong>Donates:</strong> A, AB</p>
                </div>
                <div class="compatibility-item">
                    <h4>🅱️ Type B</h4>
                    <p><strong>Receives:</strong> B, O<br><strong>Donates:</strong> B, AB</p>
                </div>
                <div class="compatibility-item">
                    <h4>🆎 Type AB</h4>
                    <p><strong>Receives:</strong> All Types<br><strong>Donates:</strong> AB Only</p>
                </div>
                <div class="compatibility-item">
                    <h4>🅾️ Type O</h4>
                    <p><strong>Receives:</strong> O Only<br><strong>Donates:</strong> All Types</p>
                </div>
            </div>
        </div>
    `;
}

// Test Taker Registration
async function handleTestTakerRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const testTakerData = Object.fromEntries(formData.entries());
    
    // Validate form
    if (!validateForm(e.target)) {
        showMessage('Please fill in all required fields correctly', 'error');
        return;
    }
    
    // Check if test taker already exists
    if (testTakers.find(t => t.testTakerId === testTakerData.testTakerId)) {
        showMessage('Test Taker ID already exists', 'error');
        return;
    }
    
    // Add timestamp
    testTakerData.registrationDate = new Date().toISOString();
    
    // Add to test takers array
    testTakers.push(testTakerData);
    
    showMessage('Test taker registered successfully!', 'success');
    e.target.reset();
    
    // Update stats
    updateStats();
    
    // Add to recent activity
    addActivity(`Test taker ${testTakerData.firstName} ${testTakerData.lastName} registered`);
}

// Search Results
function handleSearchResults() {
    const testTakerId = document.getElementById('searchTestTakerId').value.trim();
    
    if (!testTakerId) {
        showMessage('Please enter a Test Taker ID', 'error');
        return;
    }
    
    const testTaker = testTakers.find(t => t.testTakerId === testTakerId);
    if (!testTaker) {
        showMessage('Test taker not found', 'error');
        return;
    }
    
    const testTakerResults = results.filter(r => r.testTakerId === testTakerId);
    
    displayTestTakerResults(testTaker, testTakerResults);
}

function displayTestTakerResults(testTaker, testTakerResults) {
    const resultsDisplay = document.getElementById('resultsDisplay');
    
    let html = `
        <div class="test-taker-results">
            <h3>Test Taker Information</h3>
            <div class="test-taker-info">
                <p><strong>Name:</strong> ${testTaker.firstName} ${testTaker.lastName}</p>
                <p><strong>Test Taker ID:</strong> ${testTaker.testTakerId}</p>
                <p><strong>Date of Birth:</strong> ${formatDate(testTaker.dateOfBirth)}</p>
                <p><strong>Gender:</strong> ${testTaker.gender}</p>
            </div>
            
            <h3>Test Results</h3>
    `;
    
    if (testTakerResults.length === 0) {
        html += '<p>No test results found for this test taker.</p>';
    } else {
        testTakerResults.forEach(result => {
            if (result.type === 'quiz') {
                html += `
                    <div class="result-item">
                        <h4>Blood Testing Quiz</h4>
                        <p><strong>Score:</strong> ${result.score}%</p>
                        <p><strong>Date:</strong> ${formatDate(result.timestamp)}</p>
                        <p><strong>Correct Answers:</strong> ${result.correctAnswers}/${result.totalQuestions}</p>
                    </div>
                `;
            }
        });
    }
    
    html += '</div>';
    resultsDisplay.innerHTML = html;
}

// Analytics
function loadAnalytics() {
    updateDemographics();
    // Chart.js would be loaded here for visual charts
    console.log('Analytics loaded');
}

function updateDemographics() {
    const maleCount = testTakers.filter(t => t.gender === 'male').length;
    const femaleCount = testTakers.filter(t => t.gender === 'female').length;
    const otherCount = testTakers.filter(t => t.gender === 'other').length;
    
    document.getElementById('maleCount').textContent = maleCount;
    document.getElementById('femaleCount').textContent = femaleCount;
    document.getElementById('otherCount').textContent = otherCount;
}

// Utility Functions
function generateFloatingCells() {
    const floatingCells = document.querySelector('.floating-cells');
    
    for (let i = 0; i < 20; i++) {
        const cell = document.createElement('div');
        cell.style.position = 'absolute';
        cell.style.width = Math.random() * 10 + 5 + 'px';
        cell.style.height = cell.style.width;
        cell.style.background = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`;
        cell.style.borderRadius = '50%';
        cell.style.left = Math.random() * 100 + '%';
        cell.style.animationDelay = Math.random() * 20 + 's';
        cell.style.animationDuration = (Math.random() * 10 + 15) + 's';
        cell.style.animation = 'float 20s infinite linear';
        
        floatingCells.appendChild(cell);
    }
}

function addActivity(text) {
    const activityList = document.getElementById('recentActivity');
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <span class="activity-time">${timeString}</span>
        <span class="activity-text">${text}</span>
    `;
    
    activityList.insertBefore(activityItem, activityList.firstChild);
    
    // Keep only last 5 activities
    while (activityList.children.length > 5) {
        activityList.removeChild(activityList.lastChild);
    }
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

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}
