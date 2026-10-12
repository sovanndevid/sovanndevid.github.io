let countdownInterval;
let targetTime;
let isRunning = false;

function startCountdown() {
  const date = document.getElementById("event-date").value;
  const time = document.getElementById("event-time").value;
  const dateTime = new Date(`${date}T${time}`);

  if (!date || !time) {
    alert("Please enter both date and time.");
    return;
  }

  targetTime = dateTime;
  if (isRunning) return;

  countdownInterval = setInterval(updateCountdown, 1000);
  isRunning = true;
}

function updateCountdown() {
  const now = new Date();
  const diff = targetTime - now;

  if (diff <= 0) {
    clearInterval(countdownInterval);
    document.getElementById("countdown").innerText = "00:00:00";
    isRunning = false;
    celebrate();
    return;
  }

  const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
  const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

  document.getElementById("countdown").innerText = `${hours}:${minutes}:${seconds}`;
}

function pauseCountdown() {
  clearInterval(countdownInterval);
  isRunning = false;
}

function resetCountdown() {
  clearInterval(countdownInterval);
  document.getElementById("countdown").innerText = "00:00:00";
  isRunning = false;
}

function celebrate() {
  alert("🎉 Time's up! Good luck with your event!");
}
