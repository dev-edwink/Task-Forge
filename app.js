const search = document.getElementById("search");
const theme = document.getElementById("themeBtn");
const formModal = document.getElementById("formModal");
const taskForm = document.getElementById("taskForm");
const cancel = document.querySelectorAll("[data-close]");
const taskSave = document.getElementById("saveBtn");
const addTask = document.getElementById("addTaskBtn");
const detailsModal = document.getElementById("detailsModal");


const addedTasks = JSON.parse(localStorage.getItem("Task")) || [];
loadTasks();

addTask.addEventListener("click", newTaskForm);
document.addEventListener("keydown", (event) => {
  if (
    event.key.toLowerCase() === "n" &&
    formModal.hidden &&
    !event.target.matches("input, textarea, select")
  ) {
    newTaskForm();
  }
});

function newTaskForm() {
  editingIndex = null;
  taskForm.reset();
  formModal.hidden = false;
}

cancel.forEach((btn) => {
  btn.addEventListener("click", closePopup);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePopup(event);
  }
});

function closePopup() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.hidden = true;
  });
  editingIndex = null;
}

taskForm.addEventListener("submit", handleSubmit);
taskForm.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "Enter") {
    handleSubmit(event);
  }
});

function handleSubmit(e) {
  e.preventDefault();
  const title = taskForm.elements["title"].value.trim();
  const description = taskForm.elements["description"].value.trim();
  const category = taskForm.elements["category"].value;
  const priority = taskForm.elements["priority"].value;
  const due = taskForm.elements["due"].value;

  if (title !== "" && description !== "") {
    const newTask = {
      title: title,
      description: description,
      category: category,
      priority: priority,
      due: due,
      completed: false,
      created: Date.now()
    };
    if (editingIndex !== null) {
      addedTasks[editingIndex] = {
        ...addedTasks[editingIndex],
        title,
        description,
        category,
        priority,
        due,
      };
    } else {
      addedTasks.push(newTask);
    }

    editingIndex = null;
    saveTask();
    loadTasks();
    taskForm.reset();
    formModal.hidden = true;
  }
}

function saveTask() {
  localStorage.setItem("Task", JSON.stringify(addedTasks));
}

function loadTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  addedTasks.forEach((task, index) => {
    const li = document.getElementById("taskTemplate").content.firstElementChild.cloneNode(true);

    li.querySelector(".t-title").textContent = task.title;
    li.querySelector(".t-desc").textContent = task.description;
    li.querySelector(".cat").textContent = task.category;
    li.querySelector(".pri").textContent = task.priority;
    li.querySelector(".status").textContent = task.completed ? "completed" : "pending";
    li.querySelector(".due").textContent = "Due " + task.due;
    li.querySelector('[data-action="edit"]').addEventListener("click", () =>
      editTask(index),
    );
    li.querySelector('[data-action="delete"]').addEventListener("click", () =>
      deleteTask(index),
    );
    li.querySelector('[data-action="complete"]').addEventListener("click", () =>
      toggleComplete(index),
    );
    li.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      showDetails(index);
    });

    taskList.append(li);
  });
  
  updateStats();
}

let editingIndex = null;

function editTask(index) {
  const task = addedTasks[index];

  taskForm.elements["title"].value = task.title;
  taskForm.elements["description"].value = task.description;
  taskForm.elements["category"].value = task.category;
  taskForm.elements["priority"].value = task.priority;
  taskForm.elements["due"].value = task.due;

  editingIndex = index;
  formModal.hidden = false;
}

function deleteTask(index) {
  addedTasks.splice(index, 1);
  saveTask();
  loadTasks();
}

function updateStats() {
  const today = new Date().toLocaleDateString("en-CA");

  const total = addedTasks.length;
  const completed = addedTasks.filter((task) => task.completed).length;
  const pending = addedTasks.filter((task) => !task.completed).length;
  const overdue = addedTasks.filter(
    (task) => !task.completed && task.due < today,
  ).length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statDone").textContent = completed;
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statOverdue").textContent = overdue;
}

function toggleComplete(index) {
  const task = addedTasks[index];
  task.completed = !task.completed;
  saveTask();
  loadTasks();
}

let detailsIndex = null;

function showDetails(index) {
  const task = addedTasks[index];
  detailsIndex = index;

  let status = "pending";
  if (task.completed) {
    status = "completed";
  }

  let created = "Unknown";
  if (task.created) {
    created = new Date(task.created).toLocaleDateString();
  }

  document.getElementById("dTitle").textContent = task.title;
  document.getElementById("dDesc").textContent = task.description;
  document.getElementById("dCategory").textContent = task.category;
  document.getElementById("dPriority").textContent = task.priority;
  document.getElementById("dStatus").textContent = status;
  document.getElementById("dDue").textContent = task.due;
  document.getElementById("dCreated").textContent = created;

  detailsModal.hidden = false;
}

function applyTheme(name) {
  document.documentElement.dataset.theme = name; 

  if (name === "dark") {
    theme.textContent = "Light mode";
  } else {
    theme.textContent = "Dark mode";
  }

  localStorage.setItem("theme", name); 
}

theme.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;

  if (currentTheme === "dark") {
    applyTheme("light");
  } else {
    applyTheme("dark");
  }
});

const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  applyTheme(savedTheme);
} else {
  applyTheme("light");
}