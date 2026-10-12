// Offline, privacy-first study helper for static GitHub Pages hosting.
// No AI claims, user data sent to external services, API keys or HTML injection.
function toggleChatbot() {
  const box = document.getElementById('chatbotBox');
  if (box) box.classList.toggle('active');
}
function responseFor(message) {
  const s = message.toLowerCase();
  if (/pomodoro|focus|timer|break/.test(s)) return "Try Pomodoro: focus for 25 minutes, then take a 5-minute break. Use the Pomodoro page for the timer.";
  if (/task|todo|to-do|checklist/.test(s)) return "Use My Tasks to list your next actions. Click Save to keep them on this device.";
  if (/timetable|schedule|calendar|week/.test(s)) return "Open the Timetable to plan Monday through Friday. Tap a cell to edit it; changes save on this device.";
  if (/countdown|deadline|exam|due/.test(s)) return "Open Count Down and choose a future date and time to track an important deadline.";
  if (/quote|motivat|inspir/.test(s)) return "Need a boost? The Motivational Quotes page has a new message each time you tap the flower.";
  if (/privacy|data|store|save/.test(s)) return "Tasks and timetable entries are stored in this browser's local storage. Clearing browser data may erase them.";
  return "I can help you find the task list, timetable, countdown, Pomodoro timer, or motivational quotes. What would you like to work on?";
}
function appendChatMessage(kind, value) {
  const box = document.getElementById('chatbotMessages');
  if (!box) return;
  const p = document.createElement('p');
  p.className = kind;
  p.textContent = value;
  box.appendChild(p);
  box.scrollTop = box.scrollHeight;
}
function handleChat() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  appendChatMessage('user', value);
  appendChatMessage('bot', responseFor(value));
  input.value = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target?.id === 'chatInput') handleChat();
});
