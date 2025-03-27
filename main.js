const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game images
const noteImage1 = new Image();
noteImage1.src = "./img/bemol.png";

const noteImage2 = new Image();
noteImage2.src = "./img/basAnahtari.png";

const noteImage3 = new Image();
noteImage3.src = "./img/diyez.png";

const noteImage4 = new Image();
noteImage4.src = "./img/dortlukNota.png";

const noteImage5 = new Image();
noteImage5.src = "./img/ikilikNota.png";

const noteImage6 = new Image();
noteImage6.src = "./img/solAnahtari.png";

const noteImage7 = new Image();
noteImage7.src = "./img/sekizlikNota.png";

const noteImage8 = new Image();
noteImage8.src = "./img/Porte.png";

// Note types with associated questions
const noteTypes = [
    { image: noteImage1, questionIndex: 0 }, // Flat
    { image: noteImage2, questionIndex: 2 }, // Bass clef
    { image: noteImage3, questionIndex: 1 }, // Sharp
    { image: noteImage4, questionIndex: 3 }, // Quarter note
    { image: noteImage5, questionIndex: 4 }, // Half note
    { image: noteImage6, questionIndex: 2 }, // Treble clef
    { image: noteImage7, questionIndex: null } // Eighth note
];

let currentNoteType = noteTypes[0];
let currentNote = {
    x: 30,
    y: 30,
    width: 50,
    height: 50,
    speedX: 2,
    speedY: 4,
};

const staffCollector = {
    x: 225,
    y: 460,
    width: 120,
    height: 30,
    speed: 5,
};

let collectionCounter = 0;
let gamePaused = false;

const questionBank = [
    {
        question: "What's the name of this musical sign?",
        image: noteImage1,
        answers: ["Flat", "Sharp", "Natural", "Clef"],
        correctAnswer: "Flat"
    },
    {
        question: "Which symbol represents a sharp note?",
        image: noteImage3,
        answers: ["♭", "♯", "♮", "𝄢"],
        correctAnswer: "♯"
    },
    {
        question: "What is this symbol called?",
        image: noteImage6,
        answers: ["Bass clef", "Treble clef", "Alto clef", "Percussion clef"],
        correctAnswer: "Treble clef"
    },
    {
        question: "How many beats does a quarter note get in 4/4 time?",
        image: noteImage4,
        answers: ["1", "2", "4", "0.5"],
        correctAnswer: "1"
    },
    {
        question: "Which note is twice as long as a quarter note?",
        image: noteImage5,
        answers: ["Eighth note", "Half note", "Whole note", "Sixteenth note"],
        correctAnswer: "Half note"
    }
];

// Key states
const keys = {};
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

// Game functions
function checkCollection(note, staff) {
    return (
        note.x > staff.x &&
        note.x + note.width < staff.x + staff.width &&
        note.y + note.height > staff.y
    );
}

function showModalMessage(title, message, onContinue, image = null) {
    gamePaused = true;
    
    const modal = document.createElement("div");
    modal.className = "game-modal";
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            ${image ? `<img src="${image.src}" class="modal-image">` : ''}
            <p>${message}</p>
            <button class="modal-btn continue-btn">Continue</button>
        </div>
    `;

    modal.querySelector(".continue-btn").onclick = () => {
        document.body.removeChild(modal);
        gamePaused = false;
        if (onContinue) onContinue();
    };

    document.body.appendChild(modal);
}

function showQuestionWithOptions(questionObj) {
    gamePaused = true;
    
    const modal = document.createElement("div");
    modal.className = "game-modal";
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${questionObj.question}</h2>
            ${questionObj.image ? `<img src="${questionObj.image.src}" class="modal-image">` : ''}
            <div class="answers-container"></div>
        </div>
    `;

    const answersContainer = modal.querySelector(".answers-container");
    questionObj.answers.forEach(answer => {
        const button = document.createElement("button");
        button.className = "modal-btn answer-btn";
        button.textContent = answer;
        
        button.onclick = () => {
            answersContainer.innerHTML = `
                <div class="feedback ${answer === questionObj.correctAnswer ? 'correct' : 'incorrect'}">
                    ${answer === questionObj.correctAnswer 
                        ? `✓ Correct! ${answer} is right!` 
                        : `✗ Wrong! The answer was ${questionObj.correctAnswer}`}
                </div>
                <button class="modal-btn continue-btn">Continue</button>
            `;
            
            modal.querySelector(".continue-btn").onclick = () => {
                document.body.removeChild(modal);
                gamePaused = false;
                collectionCounter = 0;
                resetGame();
            };
        };
        
        answersContainer.appendChild(button);
    });

    document.body.appendChild(modal);
}

function resetGame() {
    const randomNoteIndex = Math.floor(Math.random() * noteTypes.length);
    currentNoteType = noteTypes[randomNoteIndex];
    
    currentNote.x = Math.random() > 0.5 ? 30 : 430;
    currentNote.y = Math.random() > 0.5 ? 30 : 0;
    currentNote.speedX = 4 * (Math.random() > 0.5 ? 1 : 1.5);
    currentNote.speedY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

function update() {
    if (gamePaused) return;

    // Staff movement
    if (keys["ArrowLeft"]) staffCollector.x -= staffCollector.speed;
    if (keys["ArrowRight"]) staffCollector.x += staffCollector.speed;

    // Boundary check
    staffCollector.x = Math.max(0, Math.min(canvas.width - staffCollector.width, staffCollector.x));

    // Update note position
    currentNote.x += currentNote.speedX;
    currentNote.y += currentNote.speedY;

    // Wall collision
    if (currentNote.x < 0 || currentNote.x + currentNote.width > canvas.width) {
        currentNote.speedX = -currentNote.speedX;
    }
    if (currentNote.y < 0 || currentNote.y + currentNote.height > canvas.height) {
        currentNote.speedY = -currentNote.speedY;
    }

    // Collection check
    if (checkCollection(currentNote, staffCollector)) {
        collectionCounter++;
        resetGame();
    }

    // Question check
    if (collectionCounter === 5) {
        if (currentNoteType?.questionIndex !== null && questionBank[currentNoteType.questionIndex]) {
            showQuestionWithOptions(questionBank[currentNoteType.questionIndex]);
        } else {
            showModalMessage(
                "Great Job!", 
                "You collected 5 musical symbols!",
                () => {
                    collectionCounter = 0;
                    resetGame();
                },
                currentNoteType?.image
            );
        }
    }
}

function draw() {
    if (gamePaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw current note
    if (currentNoteType?.image) {
        ctx.drawImage(
            currentNoteType.image,
            currentNote.x,
            currentNote.y,
            currentNote.width,
            currentNote.height
        );
    }

    // Draw staff collector
    ctx.drawImage(
        noteImage8,
        staffCollector.x,
        staffCollector.y,
        staffCollector.width,
        staffCollector.height
    );

    // Draw current symbol indicator
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("Collecting:", 10, 20);
    if (currentNoteType?.image) {
        ctx.drawImage(currentNoteType.image, 100, 5, 30, 30);
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize game
const imagesToLoad = [noteImage1, noteImage2, noteImage3, noteImage4, noteImage5, noteImage6, noteImage7, noteImage8];
let loadedImages = 0;

imagesToLoad.forEach(img => {
    img.onload = () => {
        loadedImages++;
        if (loadedImages === imagesToLoad.length) {
            resetGame();
            gameLoop();
        }
    };
});