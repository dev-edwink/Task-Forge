const search = document.getElementById("search");
const theme = document.getElementById("themeBtn");
const formModal = document.getElementById("formModal");
const taskForm = document.getElementById("taskForm");
const cancel = document.querySelectorAll("[data-close]");
const taskSave = document.getElementById("saveBtn");
const addTask = document.getElementById("addTaskBtn");
const detailsModal = document.getElementById("detailsModal");
const fStatus = document.getElementById("fStatus");
const fPriority = document.getElementById("fPriority");
const fCategory = document.getElementById("fCategory");
const fSort = document.getElementById("fSort");
const selectAll = document.getElementById("selectAll");
const selCount = document.getElementById("selCount");
const bulkBar = document.getElementById("bulkBar");
const selected = new Set();

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
      id: Date.now(),
      created: new Date(Date.now()).toISOString(),
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

  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach((task) => {
    const index = addedTasks.indexOf(task);
    const status = getStatus(task);
    const li = document
      .getElementById("taskTemplate")
      .content.firstElementChild.cloneNode(true);

    li.querySelector(".t-title").textContent = task.title;
    li.querySelector(".t-desc").textContent = task.description;
    li.querySelector(".cat").textContent = task.category;
    li.querySelector(".pri").textContent = task.priority;
    li.querySelector(".status").textContent = status;
    li.classList.toggle("completed", status === "completed");
    li.classList.toggle("pending", status === "pending");
    li.classList.toggle("overdue", status === "overdue");
    li.querySelector(".due").textContent = "Due " + task.due;
    // li.querySelector(".id").textContent = "id " + task.id;
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
      if (e.target.closest("button, input")) return;
      showDetails(index);
    });
    li.dataset.id = task.id;
    li.querySelector(".sel").checked = selected.has(task.id);

    taskList.append(li);
  });

  updateStats();
  updateBulk(visibleTasks);
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
  const [removed] = addedTasks.splice(index, 1);
  selected.delete(removed.id);
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

  const status = getStatus(task);

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

detailsModal.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-detail]");
  if (!btn || detailsIndex === null) return;

  if (btn.dataset.detail === "edit") {
    detailsModal.hidden = true;
    editTask(detailsIndex);
  }

  if (btn.dataset.detail === "delete") {
    const task = addedTasks[detailsIndex];
    detailsModal.hidden = true;
    deleteTask(detailsIndex);
  }
});

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

function isOverdue(task) {
  const today = new Date().toLocaleDateString("en-CA");
  return !task.completed && task.due < today;
}

function getVisibleTasks() {
  const query = search.value.trim().toLowerCase();

  const result = addedTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query);

    let matchesStatus = true;
    if (fStatus.value === "completed") matchesStatus = task.completed;
    else if (fStatus.value === "pending") matchesStatus = !task.completed;
    else if (fStatus.value === "overdue") matchesStatus = isOverdue(task);

    const matchesPriority =
      fPriority.value === "all" ||
      task.priority.toLowerCase() === fPriority.value;
    const matchesCategory =
      fCategory.value === "all" ||
      task.category.toLowerCase() === fCategory.value;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const rank = { low: 1, medium: 2, high: 3, critical: 4 };
  const sorters = {
    newest: (a, b) => new Date(b.created) - new Date(a.created),
    oldest: (a, b) => new Date(a.created) - new Date(b.created),
    "A-Z": (a, b) => a.title.localeCompare(b.title),
    "Z-A": (a, b) => b.title.localeCompare(a.title),
    highestPriority: (a, b) => rank[b.priority] - rank[a.priority],
    lowestPriority: (a, b) => rank[a.priority] - rank[b.priority],
    closestDueDate: (a, b) => a.due.localeCompare(b.due),
    furthestDueDate: (a, b) => b.due.localeCompare(a.due),
  };
  if (sorters[fSort.value]) result.sort(sorters[fSort.value]);

  return result;
}

[fStatus, fPriority, fCategory, fSort].forEach((select) => {
  select.addEventListener("change", loadTasks);
});

search.addEventListener("input", loadTasks);

function updateBulk(visibleTasks) {
  selCount.textContent = `${selected.size} selected`;

  selectAll.checked =
    visibleTasks.length > 0 && visibleTasks.every((t) => selected.has(t.id));

  bulkBar.querySelectorAll("[data-bulk]").forEach((btn) => {
    if (selected.size === 0) btn.setAttribute("disabled", "");
    else btn.removeAttribute("disabled");
  });
}

document.getElementById("taskList").addEventListener("change", (e) => {
  const box = e.target.closest(".sel");
  if (!box) return;

  const id = Number(box.closest("li").dataset.id);
  if (box.checked) selected.add(id);
  else selected.delete(id);

  updateBulk(getVisibleTasks());
});

selectAll.addEventListener("change", () => {
  getVisibleTasks().forEach((t) => {
    if (selectAll.checked) selected.add(t.id);
    else selected.delete(t.id);
  });
  loadTasks();
});

bulkBar.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-bulk]");
  if (!btn || selected.size === 0) return;

  const action = btn.dataset.bulk;

  if (action === "delete") {
    for (let i = addedTasks.length - 1; i >= 0; i--) {
      if (selected.has(addedTasks[i].id)) addedTasks.splice(i, 1);
    }
    selected.clear();
    saveTask();
    loadTasks();
    return;
  }

  addedTasks.forEach((t) => {
    if (selected.has(t.id)) t.completed = action === "complete";
  });
  saveTask();
  loadTasks();
});

function getStatus(task) {
  if (task.completed) return "completed";
  const today = new Date().toLocaleDateString("en-CA");
  if (task.due < today) return "overdue";
  return "pending";
}