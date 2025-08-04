const welcome = document.getElementById("welcome");
const app = document.getElementById("app");
const userDisplay = document.getElementById("userDisplay");
const todoList = document.getElementById("todoList");

// Task inputs
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskDate = document.getElementById("taskDate");
const customDate = document.getElementById("customDate");
const taskTime = document.getElementById("taskTime");

const plusBtn = document.getElementById("plusBtn");
const taskDrawer = document.getElementById("taskDrawer");
const overlay = document.getElementById("overlay");
const addTaskBtn = document.getElementById("addTaskBtn");

const buttons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

let editingIndex = null;

// Check localStorage for first visit
if (localStorage.getItem("hasVisited")) {
  showApp();
} else {
  initSwiper();
}

function initSwiper() {
  new Swiper(".swiper", {
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    allowTouchMove: true,
    direction: "horizontal",
  });
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all buttons
    buttons.forEach((b) => b.classList.remove("active"));
    // Add active class to clicked button
    btn.classList.add("active");

    // Hide all pages
    pages.forEach((page) => {
      page.classList.remove("active");
      page.classList.add("hidden"); // 🟡 This line is missing in your code
    });

    // Show selected page
    const pageId = btn.getAttribute("data-page");
    const targetPage = document.getElementById(pageId);
    targetPage.classList.remove("hidden"); // ✅ Show it
    targetPage.classList.add("active"); // ✅ Add active class
  });
});

window.startApp = function () {
  const name = document.getElementById("username").value.trim();
  if (name === "") {
    alert("لطفاً نام خود را وارد کنید!");
    return;
  }
  localStorage.setItem("hasVisited", "true");
  localStorage.setItem("username", name);
  showApp();
};

function showApp() {
  welcome.classList.add("hidden");
  app.classList.remove("hidden");
  const name = localStorage.getItem("username") || "کاربر";
  userDisplay.textContent = name;

  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.textContent = name;
  }

  loadTasks();
  updateProgressChartFromStorage();
}

const colorButtons = document.querySelectorAll(".color-btn");

colorButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selected = btn.dataset.color;
    const color = getComputedStyle(document.documentElement).getPropertyValue(
      `--${selected}`
    );
    document.documentElement.style.setProperty("--primary", color);
    localStorage.setItem("themeColor", selected);
  });
});

// Apply saved theme on load
const savedColor = localStorage.getItem("themeColor");
if (savedColor) {
  const color = getComputedStyle(document.documentElement).getPropertyValue(
    `--${savedColor}`
  );
  document.documentElement.style.setProperty("--primary", color);
}

const secondaryButtons = document.querySelectorAll(".secondary-btn");

secondaryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selected = btn.dataset.color;
    const color = getComputedStyle(document.documentElement).getPropertyValue(
      `--${selected}`
    );
    document.documentElement.style.setProperty("--secondary", color);
    localStorage.setItem("secondaryColor", selected);
  });
});

// Apply saved secondary theme on load
const savedSecondary = localStorage.getItem("secondaryColor");
if (savedSecondary) {
  const color = getComputedStyle(document.documentElement).getPropertyValue(
    `--${savedSecondary}`
  );
  document.documentElement.style.setProperty("--secondary", color);
}

// 📝 Add/Edit Task
function addTask() {
  const title = taskTitle.value.trim();
  const desc = taskDesc.value.trim();
  const dateOption = taskDate.value;
  const time = taskTime.value;

  if (title === "") {
    alert("عنوان کار را وارد کنید!");
    return;
  }

  let date = "";
  const today = new Date();
  if (dateOption === "today") {
    date = today.toISOString().split("T")[0];
  } else if (dateOption === "tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split("T")[0];
  } else if (dateOption === "custom") {
    date = customDate.value;
    if (!date) {
      alert("لطفاً یک تاریخ انتخاب کنید.");
      return;
    }
  }

  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

  if (editingIndex !== null) {
    // Update task
    tasks[editingIndex] = { ...tasks[editingIndex], title, desc, date, time };
    editingIndex = null;
  } else {
    // Add new task
    tasks.push({ title, desc, date, time, done: false });
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));

  taskTitle.value = "";
  taskDesc.value = "";
  taskDate.value = "today";
  customDate.value = "";
  taskTime.value = "";

  loadTasks();
  toggleDrawer(false);
}

// 📋 Load Tasks
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  todoList.innerHTML = "";

  let doneCount = 0;

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = "todo-item";
    if (task.done) div.classList.add("done");

    // <small>${formatDate(task.date)} - ${task.time || "بدون زمان"}</small>

    div.innerHTML = `
      <div class="todo-text">
        <strong>${escapeHtml(task.title)}</strong><br/>
        ${task.desc ? `${escapeHtml(task.desc)}<br/>` : ""}
      </div>
      <div class="todo-actions">
        <button class="edit-btn" data-index="${index}"><img src="icons/edit.svg" alt="" /></button>
        <button class="delete-btn" data-index="${index}"><img src="icons/delete.svg" alt="" /></button>
      </div>
    `;

    div.querySelector(".edit-btn").onclick = (e) => {
      e.stopPropagation();
      startEditTask(index);
    };

    div.querySelector(".delete-btn").onclick = (e) => {
      e.stopPropagation();
      deleteTask(index);
    };

    div.onclick = () => toggleDone(index);
    todoList.appendChild(div);

    if (task.done) doneCount++;
  });

  updateProgressChart(doneCount, tasks.length);
}

// ✏️ Start editing task
function startEditTask(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const task = tasks[index];
  if (!task) return;

  taskTitle.value = task.title;
  taskDesc.value = task.desc;
  taskTime.value = task.time || "";

  // Set date option
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  if (task.date === todayStr) {
    taskDate.value = "today";
    customDate.classList.add("hidden");
  } else if (task.date === tomorrowStr) {
    taskDate.value = "tomorrow";
    customDate.classList.add("hidden");
  } else {
    taskDate.value = "custom";
    customDate.value = task.date;
    customDate.classList.remove("hidden");
  }

  editingIndex = index;
  toggleDrawer(true);
}

// 🗑️ Delete task
function deleteTask(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks.splice(index, 1);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  loadTasks();
}

// ✅ Toggle done status
function toggleDone(index) {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  tasks[index].done = !tasks[index].done;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  loadTasks();
}

// 🗓 Format date
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Show/hide custom date
taskDate.addEventListener("change", () => {
  customDate.classList.toggle("hidden", taskDate.value !== "custom");
});

// 📊 Animate progress
function updateProgressChart(completed, total) {
  const label = document.getElementById("progressLabel");
  const circle = document.getElementById("progressCircle");
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  label.textContent = `${percent}%`;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  circle.style.strokeDashoffset = offset;
}

function updateProgressChartFromStorage() {
  const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
  const doneCount = tasks.filter((t) => t.done).length;
  updateProgressChart(doneCount, tasks.length);
}

// Navigation
const navButtons = document.querySelectorAll(".bottom-nav .nav-btn");
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const page = btn.dataset.page;
    console.log("Navigate to page:", page);
  });
});

// Drawer toggle
function toggleDrawer(show) {
  if (!taskDrawer) return;

  if (show === undefined) {
    show = !taskDrawer.classList.contains("open");
  }

  if (show) {
    taskDrawer.classList.remove("hidden");
    void taskDrawer.offsetWidth;
    taskDrawer.classList.add("open");

    if (overlay) {
      overlay.classList.remove("hidden");
      void overlay.offsetWidth;
      overlay.classList.add("open");
    }
  } else {
    taskDrawer.classList.remove("open");
    if (overlay) overlay.classList.remove("open");

    setTimeout(() => {
      taskDrawer.classList.add("hidden");
      if (overlay) overlay.classList.add("hidden");
    }, 300);
  }
}

if (plusBtn) {
  plusBtn.addEventListener("click", () => {
    editingIndex = null; // Reset edit mode
    taskTitle.value = "";
    taskDesc.value = "";
    taskDate.value = "today";
    customDate.value = "";
    taskTime.value = "";
    customDate.classList.add("hidden");
    toggleDrawer(true);
  });
}

if (overlay) {
  overlay.addEventListener("click", () => {
    toggleDrawer(false);
  });
}

if (addTaskBtn) {
  addTaskBtn.addEventListener("click", addTask);
}

const profile = document.querySelector(".profile");
const overlay2 = document.querySelector(".overlay2");

profile.addEventListener("click", () => {
  profile.classList.add("expanded");
  overlay2.classList.remove("hidden");
});

overlay2.addEventListener("click", () => {
  profile.classList.remove("expanded");
  overlay2.classList.add("hidden");
});

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const notesList = document.getElementById("notesList");

let editingNoteIndex = null;

function loadNotes() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notesList.innerHTML = "";

  notes.forEach((note, index) => {
    const noteDiv = document.createElement("div");
    noteDiv.className = "note-item";
    noteDiv.innerHTML = `
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.content)}</p>
      <div class="note-actions">
        <button onclick="editNote(${index})"><img src="icons/edit.svg" alt="" /></button>
        <button onclick="deleteNote(${index})"><img src="icons/delete.svg" alt="" /></button>
      </div>
    `;
    notesList.appendChild(noteDiv);
  });
}

function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!title || !content) {
    alert("لطفاً عنوان و متن یادداشت را وارد کنید.");
    return;
  }

  const notes = JSON.parse(localStorage.getItem("notes") || "[]");

  if (editingNoteIndex !== null) {
    notes[editingNoteIndex] = { title, content };
    editingNoteIndex = null;
  } else {
    notes.push({ title, content });
  }

  localStorage.setItem("notes", JSON.stringify(notes));
  noteTitle.value = "";
  noteContent.value = "";
  loadNotes();
}

function editNote(index) {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  const note = notes[index];
  if (!note) return;

  noteTitle.value = note.title;
  noteContent.value = note.content;
  editingNoteIndex = index;
}

function deleteNote(index) {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notes.splice(index, 1);
  localStorage.setItem("notes", JSON.stringify(notes));
  loadNotes();
}

if (saveNoteBtn) {
  saveNoteBtn.addEventListener("click", saveNote);
}

loadNotes();

const logoutBtn = document.getElementById("logoutBtn");
const editNameBtn = document.getElementById("editNameBtn");
const editModal = document.getElementById("editModal");
const newNameInput = document.getElementById("newNameInput");
const saveNameBtn = document.getElementById("saveNameBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

// Show modal
editNameBtn.addEventListener("click", () => {
  newNameInput.value = localStorage.getItem("username") || "";

  // 1️⃣ Reset classes
  editModal.classList.remove("hidden", "open");

  // 2️⃣ Trigger show + animation
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      editModal.classList.add("open");
    });
  });
});

// Cancel:
cancelEditBtn.addEventListener("click", () => {
  editModal.classList.remove("open");
  editModal.addEventListener("transitionend", function handler(e) {
    if (e.propertyName === "opacity") {
      editModal.classList.add("hidden");
      editModal.removeEventListener("transitionend", handler);
    }
  });
});

// Save Name:
saveNameBtn.addEventListener("click", () => {
  const newName = newNameInput.value.trim();
  if (!newName) return alert("نام نمی‌تواند خالی باشد!");
  localStorage.setItem("username", newName);
  userDisplay.textContent = newName;
  profileName.textContent = newName;

  editModal.classList.remove("open");
  editModal.addEventListener("transitionend", function handler(e) {
    if (e.propertyName === "opacity") {
      editModal.classList.add("hidden");
      editModal.removeEventListener("transitionend", handler);
    }
  });
});

// Close modal if background is clicked
editModal.addEventListener("click", (event) => {
  if (event.target === editModal) {
    // Only close if clicked *on the background*, not on the modal-content
    editModal.classList.remove("open");
    editModal.addEventListener("transitionend", function handler(e) {
      if (e.propertyName === "opacity") {
        editModal.classList.add("hidden");
        editModal.removeEventListener("transitionend", handler);
      }
    });
  }
});

// Elements
const btnAppearance = document.getElementById("btnAppearance");
const btnAbout = document.getElementById("btnAbout");
const slidePanel = document.getElementById("slidePanel");
const closePanelBtn = document.getElementById("closePanelBtn");
const appearanceContent = document.getElementById("appearanceContent");
const aboutContent = document.getElementById("aboutContent");

function openPanel(content) {
  // Show slide panel
  slidePanel.classList.remove("hidden");
  setTimeout(() => {
    slidePanel.classList.add("show");
  }, 10);

  // Show correct content
  if (content === "appearance") {
    appearanceContent.classList.remove("hidden");
    aboutContent.classList.add("hidden");
  } else if (content === "about") {
    aboutContent.classList.remove("hidden");
    appearanceContent.classList.add("hidden");
  }
}

function closePanel() {
  slidePanel.classList.remove("show");
  setTimeout(() => {
    slidePanel.classList.add("hidden");
  }, 300);
}

// Button event listeners
btnAppearance.addEventListener("click", () => openPanel("appearance"));
btnAbout.addEventListener("click", () => openPanel("about"));
closePanelBtn.addEventListener("click", closePanel);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.error('SW registration failed:', err));
  });
}
