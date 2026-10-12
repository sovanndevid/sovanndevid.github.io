// To-Do list
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const saveButton = document.getElementById('saveTaskButton');
const taskList = document.getElementById('taskList');
const savedList = document.getElementById('savedTasks');
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let changesMade = false;

function updateTaskList() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    const number = document.createElement('strong');
    number.textContent = (index + 1) + '.';
    label.appendChild(number);
    label.appendChild(document.createTextNode(' ' + task));
    const controls = document.createElement('div');
    const editButton = document.createElement('button');
    editButton.className = 'edit';
    editButton.textContent = 'Edit';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    deleteButton.textContent = 'Delete';
    controls.append(editButton, deleteButton);
    li.append(label, controls);

    li.querySelector('span').addEventListener('click', () => {
      li.classList.toggle('completed');
    });

    li.querySelector('.edit').addEventListener('click', () => {
      const newTask = prompt('Edit your task:', task);
      if (newTask && newTask.trim()) {
        tasks[index] = newTask.trim();
        updateTaskList();
        changesMade = true;
      }
    });

    li.querySelector('.delete').addEventListener('click', () => {
      tasks.splice(index, 1);
      updateTaskList();
      changesMade = true;
    });

    taskList.appendChild(li);
  });
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  changesMade = false;
}

if (saveButton) {
  saveButton.addEventListener("click", () => {
    saveTasks();
    displaySavedTasks();
    alert("Tasks saved!");
  });
}

taskInput.addEventListener("input", () => {
  changesMade = true;
});

taskInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTaskButton.click();
  }
});

addTaskButton?.addEventListener('click', () => {
  const value = taskInput.value.trim();
  if (value !== '') {
    tasks.push(value);
    updateTaskList();
    taskInput.value = '';
    changesMade = true;
  }
});

window.onbeforeunload = function () {
  if (changesMade) {
    return "You have unsaved changes. Do you really want to leave?";
  }
};

function displaySavedTasks() {
  if (savedList) {
    const saved = JSON.parse(localStorage.getItem("tasks")) || [];
    savedList.replaceChildren();
    saved.forEach((task, i) => {
      const li = document.createElement('li');
      li.textContent = (i + 1) + '. ' + task;
      savedList.appendChild(li);
    });
  }
}

updateTaskList();
displaySavedTasks();
