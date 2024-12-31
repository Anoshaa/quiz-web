// Firebase SDK imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDLQAw3BNVT1HClWts1tedC1PXvbl0l1vg",
    authDomain: "quiz-b5214.firebaseapp.com",
    projectId: "quiz-b5214",
    storageBucket: "quiz-b5214.firebasestorage.app",
    messagingSenderId: "166666763442",
    appId: "1:166666763442:web:0fb00c854019a9ca821dab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Quiz questions
const questions = [
    { question: "Q1) What's the capital of France?", options: ["Paris", "Rome", "Berlin", "Madrid"], answer: "Paris" },
    { question: "Q2) What is the square root of 81?", options: ["7", "8", "9", "10"], answer: "9" },
    { question: "Q3) Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: "Mars" },
    { question: "Q4) Who was the first person to step on the moon?", options: ["Neil Armstrong", "Buzz Aldrin", "Michael Collins", "Yuri Gagarin"], answer: "Neil Armstrong" },
    { question: "Q5) Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: "Nile" },
    { question: "Q6) What element does 'O' represent on the periodic table?", options: ["Osmium", "Ozone", "Opium", "Oxygen"], answer: "Oxygen" },
    { question: "Q7) If John is twice as old as Mary, and in 5 years, John will be 30 years old, how old is Mary now?", options: ["10", "12", "15", "25"], answer: "12" },
    { question: "Q8) Which country won the 2018 FIFA World Cup?", options: ["Germany", "Brazil", "France", "Argentina"], answer: "France" },
    { question: "Q9) If you fold a paper in half and cut a small hole in the center, then unfold it, how many holes will you see?", options: ["1", "2", "3", "4"], answer: "4" },
    { question: "Q10) If two pencils cost 10 cents, how much do 7 pencils cost?", options: ["35 cents", "70 cents", "50 cents", "55 cents"], answer: "70 cents" }
];

// Variables to track quiz state
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;

// Handle user form submission
document.getElementById("user-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    // Ensure that the form inputs are not empty
    if (!name || !email) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill in all the fields.'
        });
        return;
    }

    // Show loader
    document.getElementById("loader").style.display = "block";
    document.querySelector(".button").disabled = true; // Disable the button to prevent multiple submissions

    try {
        // Save user details in Firestore
        const scoreRef = doc(db, "quizScores", email); // Using email as unique identifier
        await setDoc(scoreRef, {
            name,
            email,
            score: 0, // Initially setting the score to 0
            timestamp: serverTimestamp()
        });
        console.log("User details saved to Firestore.");

        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'User details saved!',
            text: 'Proceeding to the quiz...'
        });

        // Hide the user info form and show the quiz
        setTimeout(() => {
            document.getElementById("user-info-form").style.display = "none";
            document.getElementById("quiz-section").style.display = "block";
            loadQuestion();
            document.getElementById("loader").style.display = "none"; // Hide loader
            document.querySelector(".button").disabled = false; // Re-enable the button
        }, 1000); // 1 second delay

    } catch (error) {
        console.error("Error saving user details:", error.message);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an issue saving your details. Please try again.'
        });
        document.getElementById("loader").style.display = "none"; // Hide loader in case of error
        document.querySelector(".button").disabled = false; // Re-enable the button
    }
});

// Load question and options
function loadQuestion() {
    const question = questions[currentQuestionIndex];
    document.getElementById("question-text").textContent = question.question;
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";
    question.options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.classList.add("btn");
        btn.addEventListener("click", () => selectOption(btn, option));
        optionsContainer.appendChild(btn);
    });
}

// Handle option selection
function selectOption(button, option) {
    const buttons = document.querySelectorAll("#options-container .btn");
    buttons.forEach(btn => btn.classList.remove("selected"));
    button.classList.add("selected");
    selectedOption = option;
}

// Handle next button click
document.getElementById("next-btn").addEventListener("click", () => {
    if (!selectedOption) {
        Swal.fire({
            icon: 'warning',
            title: 'No option selected',
            text: 'Please select an option before proceeding.'
        });
        return;
    }

    const correctAnswer = questions[currentQuestionIndex].answer;
    if (selectedOption === correctAnswer) {
        score++;
    }

    // Reset the selected option for the next question
    selectedOption = null;

    // Move to the next question or show results if it was the last question
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        saveScore();
        showResults();
    }
});

// Save quiz score to Firestore
async function saveScore() {
    try {
        const email = document.getElementById("email").value; // Get email from form
        const scoreRef = doc(db, "quizScores", email); // Use email to find the document
        await setDoc(scoreRef, {
            name: document.getElementById("name").value,
            email,
            score,
            totalQuestions: questions.length,
            timestamp: serverTimestamp()
        }, { merge: true }); // Merge with existing data to update score
        console.log("Quiz score saved to Firestore.");

        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Quiz score saved!',
            text: 'Your score has been recorded successfully.'
        });
    } catch (error) {
        console.error("Error saving score:", error.message);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an issue saving your score. Please try again.'
        });
    }
}

// Show results
function showResults() {
    const resultsContainer = document.getElementById("results-container");
    resultsContainer.style.display = "block";
    document.getElementById("quiz-section").style.display = "none";

    const percentage = (score / questions.length) * 100;
    const scoreColor = percentage >= 50 ? "green" : "#c30010";

    let remarks;
    if (percentage === 100) remarks = "Excellent!";
    else if (percentage >= 80) remarks = "Great job!";
    else if (percentage >= 50) remarks = "Good effort!";
    else remarks = "Don't give up! Keep practicing!";

    resultsContainer.innerHTML = `
        <div class="score-background">
            <h2 class="score-heading">Your Score:</h2>
            <div class="score-container" style="border-color: ${scoreColor}; color: ${scoreColor};">
                <div class="score-text">${score} / ${questions.length}</div>
            </div>
            <p class="score-remarks">${remarks}</p>
        </div>
    `;
}
