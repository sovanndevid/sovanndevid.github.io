let sessionTime = 25;
let breakTime = 5;
let timeLeft = sessionTime * 60;
let timer;
let isSession = true;
let isRunning = false;

const timeDisplay = document.getElementById("time");
const modeDisplay = document.getElementById("mode");
const modal = document.getElementById("sessionModal");
const modalTitle = document.getElementById("modalTitle");

const circle = document.querySelector(".progress-ring__circle");
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function updateTimeDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function updateCircle() {
  const total = isSession ? sessionTime * 60 : breakTime * 60;
  const percent = timeLeft / total;
  circle.style.strokeDashoffset = circumference * (1 - percent);
}

function updateModeDisplay() {
  modeDisplay.textContent = isSession ? "Session" : "Break";
  document.body.classList.remove("session-mode", "break-mode");
  document.body.classList.add(isSession ? "session-mode" : "break-mode");

  circle.style.stroke = isSession ? "#2563eb" : "#10b981"; // blue or green
}

function startTimer() {
  if (!isRunning) {
    timer = setInterval(() => {
      timeLeft--;
      updateTimeDisplay();
      updateCircle();

      if (timeLeft <= 0) {
        clearInterval(timer);
        isRunning = false;
        modalTitle.textContent = isSession ? "Session Complete!" : "Break Complete!";
        modal.style.display = "flex";
      }
    }, 1000);
    isRunning = true;
  }
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = isSession ? sessionTime * 60 : breakTime * 60;
  updateTimeDisplay();
  updateCircle();
}

function setTime(session, brk) {
  sessionTime = session;
  breakTime = brk;
  isSession = true;
  timeLeft = session * 60;
  updateModeDisplay();
  updateTimeDisplay();
  updateCircle();
  resetTimer();
}

function startBreakManually() {
  // Switch to break mode
  clearInterval(timer);
  isSession = false;
  timeLeft = breakTime * 60;
  updateModeDisplay();
  updateTimeDisplay();
  updateCircle();
  startTimer(); // Start the break timer after switching
  closeModal(); // Close the modal after starting the break
}

function startNewSession() {
  // Switch to session mode
  clearInterval(timer);
  isSession = true;
  timeLeft = sessionTime * 60;
  updateModeDisplay();
  updateTimeDisplay();
  updateCircle();
  startTimer(); // Start a new session after switching
  closeModal(); // Close the modal after starting the session
}

function closeModal() {
  modal.style.display = "none";
  updateModeDisplay();
  updateTimeDisplay();
  updateCircle();
}

// Adding event listeners to modal buttons
document.getElementById("startBreakButton").addEventListener('click', function() {
  startBreakManually();
  closeModal(); // Close modal after starting the break
});

document.getElementById("startNewSessionButton").addEventListener('click', function() {
  startNewSession();
  closeModal(); // Close modal after starting a new session
});

document.getElementById("closeModalButton").addEventListener('click', function() {
  closeModal(); // Close modal without starting anything
});

updateModeDisplay();
updateTimeDisplay();
updateCircle();
