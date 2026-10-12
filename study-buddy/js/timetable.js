const timetableBody = document.getElementById("timetable-body");
const hours = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function loadTimetable() {
  for (let i = 0; i < hours.length; i++) {
    const row = document.createElement("tr");
    const timeCell = document.createElement("td");
    timeCell.textContent = hours[i];
    row.appendChild(timeCell);

    for (let j = 0; j < days.length; j++) {
      const key = `${days[j]}-${hours[i]}`;
      const saved = localStorage.getItem(key) || "";
      const cell = document.createElement("td");
      cell.contentEditable = true;
      cell.textContent = saved;
      cell.addEventListener("input", () => {
        localStorage.setItem(key, cell.textContent);
      });
      row.appendChild(cell);
    }

    timetableBody.appendChild(row);
  }
}

function sendTimetable() {
  let content = "My Weekly Timetable:\n\n";
  for (let i = 0; i < hours.length; i++) {
    content += `${hours[i]}:\n`;
    for (let j = 0; j < days.length; j++) {
      const key = `${days[j]}-${hours[i]}`;
      const entry = localStorage.getItem(key) || " - ";
      content += `${days[j]}: ${entry}\n`;
    }
    content += "\n";
  }

  const subject = "Study Buddy Timetable";
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
  window.location.href = mailtoLink;
}

function sendReminder() {
  const email = document.getElementById("peerEmail").value;
  const message = document.getElementById("reminderMessage").value;

  if (!email || !message) {
    alert("Please fill in both the email and message.");
    return;
  }

  const subject = "Study Buddy Task Reminder";
  const link = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  window.location.href = link;
}

document.addEventListener("DOMContentLoaded", loadTimetable);

// Open a draft in the user's own email client. No third-party email token,
// automatic mail delivery, or outgoing network request from this static app.
const emailForm = document.getElementById('form');
if (emailForm) emailForm.addEventListener('submit', function (event) {
  event.preventDefault();
  if (!emailForm.reportValidity()) return;
  const recipient = document.getElementById('to_email').value.trim();
  const sender = document.getElementById('from_email').value.trim();
  const message = document.getElementById('message').value.trim();
  const body = message + '\\n\\nFrom: ' + sender + '\\nPrepared with Study Buddy';
  window.location.href = 'mailto:' + encodeURIComponent(recipient) +
    '?subject=' + encodeURIComponent('Study Buddy Reminder') +
    '&body=' + encodeURIComponent(body);
});
