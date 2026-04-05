let allFlashcards = [];
let filteredFlashcards = [];
let currentIndex = 0;

// DOM Elements
const flashcardEl = document.getElementById('flashcard');
const frontCategoryEl = document.getElementById('front-category');
const frontTextEl = document.getElementById('front-text');
const backCategoryEl = document.getElementById('back-category');
const backTextEl = document.getElementById('back-text');
const categoryFilterEl = document.getElementById('categoryFilter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentIndexEl = document.getElementById('currentIndex');
const totalCardsEl = document.getElementById('totalCards');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadFlashcards();
    
    // Event Listeners
    flashcardEl.addEventListener('click', flipCard);
    prevBtn.addEventListener('click', showPreviousCard);
    nextBtn.addEventListener('click', showNextCard);
    categoryFilterEl.addEventListener('change', handleCategoryChange);
});

// Fetch data from data.json
async function loadFlashcards() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allFlashcards = await response.json();
        
        if (allFlashcards.length === 0) {
            showEmptyState();
            return;
        }

        populateCategories();
        
        // Initialize with all cards
        filteredFlashcards = [...allFlashcards];
        currentIndex = 0;
        
        updateUI();

        // Successful load sweet alert
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Flashcards loaded successfully!',
            showConfirmButton: false,
            timer: 2000,
            background: 'rgba(30, 36, 45, 0.95)',
            color: '#fff'
        });

    } catch (error) {
        console.error("Could not load flashcards:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to load flashcards. Please check if data.json exists.',
            background: 'rgba(30, 36, 45, 0.95)',
            color: '#fff',
            confirmButtonColor: '#1ea1f2'
        });
    }
}

// Extract unique categories and populate the select dropdown
function populateCategories() {
    const categories = [...new Set(allFlashcards.map(card => card.category))];
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilterEl.appendChild(option);
    });
}

// Handle category selection
function handleCategoryChange(e) {
    const selectedCategory = e.target.value;
    
    if (flashcardEl.classList.contains('flipped')) {
        flashcardEl.classList.remove('flipped');
        setTimeout(() => updateFilteredCards(selectedCategory), 300); // wait for flip animation
    } else {
        updateFilteredCards(selectedCategory);
    }
}

function updateFilteredCards(category) {
    if (category === 'All') {
        filteredFlashcards = [...allFlashcards];
    } else {
        filteredFlashcards = allFlashcards.filter(card => card.category === category);
    }
    
    currentIndex = 0;
    
    if (filteredFlashcards.length === 0) {
        showEmptyState();
    } else {
        updateUI();
    }
}

// Flip Card Animation
function flipCard() {
    if (filteredFlashcards.length > 0) {
        flashcardEl.classList.toggle('flipped');
    }
}

// Show specific card based on index
function updateUI() {
    if (filteredFlashcards.length === 0) return;
    
    const currentCard = filteredFlashcards[currentIndex];
    
    // Update text
    frontCategoryEl.textContent = currentCard.category;
    frontTextEl.textContent = currentCard.question;
    
    backCategoryEl.textContent = currentCard.category;
    backTextEl.textContent = currentCard.answer;
    
    // Update counter
    currentIndexEl.textContent = currentIndex + 1;
    totalCardsEl.textContent = filteredFlashcards.length;
    
    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === filteredFlashcards.length - 1;

    // Render Math Formulas (LaTeX)
    if (window.renderMathInElement) {
        renderMathInElement(flashcardEl, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError : false
        });
    }
}

// Navigation Logic
function showNextCard() {
    if (currentIndex < filteredFlashcards.length - 1) {
        // Reset flip state if needed
        let waitTime = 0;
        if (flashcardEl.classList.contains('flipped')) {
            flashcardEl.classList.remove('flipped');
            waitTime = 300; // time to wait for slightly un-flipping before changing text
        }
        
        setTimeout(() => {
            currentIndex++;
            updateUI();
        }, waitTime);
    }
}

function showPreviousCard() {
    if (currentIndex > 0) {
        // Reset flip state if needed
        let waitTime = 0;
        if (flashcardEl.classList.contains('flipped')) {
            flashcardEl.classList.remove('flipped');
            waitTime = 300;
        }
        
        setTimeout(() => {
            currentIndex--;
            updateUI();
        }, waitTime);
    }
}

function showEmptyState() {
    frontCategoryEl.textContent = "N/A";
    frontTextEl.textContent = "No flashcards found for this category.";
    backCategoryEl.textContent = "N/A";
    backTextEl.textContent = "No flashcards found.";
    currentIndexEl.textContent = 0;
    totalCardsEl.textContent = 0;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
}
