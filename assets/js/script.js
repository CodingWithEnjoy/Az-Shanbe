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
  const userId = document.getElementById("userId").value.trim();
  const userIdInput = document.getElementById("userId");

  if (name === "" || userId === "") {
    alert("لطفاً نام و یوزرنیم خود را وارد کنید!");
    return;
  }

  if (!validateUsername(userIdInput)) {
    alert("یوزرنیم فقط می‌تواند شامل حروف، اعداد، نقطه و زیرخط (_) باشد.");
    return;
  }

  localStorage.setItem("hasVisited", "true");
  localStorage.setItem("username", name);
  localStorage.setItem("userId", userId);

  showApp();
};

function showApp() {
  welcome.classList.add("hidden");
  app.classList.remove("hidden");

  const name = localStorage.getItem("username") || "کاربر";
  const userId = localStorage.getItem("userId") || "";

  userDisplay.textContent = name;

  const profileName = document.getElementById("profileName");
  if (profileName) {
    profileName.textContent = name;
  }

  const profileUserId = document.getElementById("profileUserId");
  if (profileUserId) {
    profileUserId.textContent = userId ? `@${userId}` : "";
  }

  loadTasks();
  updateProgressChartFromStorage();
}

function validateUsername(input) {
  const regex = /^[a-zA-Z0-9._]+$/;
  if (!regex.test(input.value.trim())) {
    input.style.borderBottom = "1px solid #ff3535";
    return false;
  } else {
    input.style.borderBottom = "1px solid rgb(147, 147, 147)";
    return true;
  }
}

const userIdInput = document.getElementById("userId");
if (userIdInput) {
  userIdInput.addEventListener("input", () => validateUsername(userIdInput));
}

const colorButtons = document.querySelectorAll(".color-btn");

colorButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selected = btn.dataset.color;
    const color = getComputedStyle(document.documentElement).getPropertyValue(
      `--${selected}`,
    );
    document.documentElement.style.setProperty("--primary", color);
    localStorage.setItem("themeColor", selected);
  });
});

// Apply saved theme on load
const savedColor = localStorage.getItem("themeColor");
if (savedColor) {
  const color = getComputedStyle(document.documentElement).getPropertyValue(
    `--${savedColor}`,
  );
  document.documentElement.style.setProperty("--primary", color);
}

const secondaryButtons = document.querySelectorAll(".secondary-btn");

secondaryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const selected = btn.dataset.color;
    const color = getComputedStyle(document.documentElement).getPropertyValue(
      `--${selected}`,
    );
    document.documentElement.style.setProperty("--secondary", color);
    localStorage.setItem("secondaryColor", selected);
  });
});

// Apply saved secondary theme on load
const savedSecondary = localStorage.getItem("secondaryColor");
if (savedSecondary) {
  const color = getComputedStyle(document.documentElement).getPropertyValue(
    `--${savedSecondary}`,
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
        <button class="edit-btn" data-index="${index}"><img src="/assets/icons/edit.svg" alt="" /></button>
        <button class="delete-btn" data-index="${index}"><img src="/assets/icons/delete.svg" alt="" /></button>
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
  updateTaskInfo(doneCount, tasks.length);
}

function updateTaskInfo(done, total) {
  const pending = total - done;
  const pendingCountEl = document.getElementById("pendingCount");
  const messageEl = document.getElementById("taskMessage");

  pendingCountEl.textContent = `${pending} کار باقی مونده`;

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  let message = "";

  if (total === 0) {
    message = "بیکاری ؟ 🤨";
  } else if (percent === 100) {
    message = "یوووووووووو !!!! 🔥";
  } else if (percent >= 75) {
    message = "یکم مونده فقط 🤏";
  } else if (percent >= 50) {
    message = "نصفش رفتههه ✨";
  } else if (percent >= 25) {
    message = "هنوز اول راهی ☹️";
  } else {
    message = "هنوز کاری نکردی 🤬";
  }

  messageEl.textContent = message;
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
        <button onclick="editNote(${index})"><img src="/assets/icons/edit.svg" alt="" /></button>
        <button onclick="deleteNote(${index})"><img src="/assets/icons/delete.svg" alt="" /></button>
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

const editUserIdBtn = document.getElementById("editUserIdBtn");
const editUserIdModal = document.getElementById("editUserIdModal");
const newUserIdInput = document.getElementById("newUserIdInput");
const saveUserIdBtn = document.getElementById("saveUserIdBtn");
const cancelUserIdEditBtn = document.getElementById("cancelUserIdEditBtn");

// Show modal
editUserIdBtn.addEventListener("click", () => {
  newUserIdInput.value = localStorage.getItem("userId") || "";

  editUserIdModal.classList.remove("hidden", "open");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      editUserIdModal.classList.add("open");
    });
  });
});

// Cancel
cancelUserIdEditBtn.addEventListener("click", () => {
  editUserIdModal.classList.remove("open");
  editUserIdModal.addEventListener("transitionend", function handler(e) {
    if (e.propertyName === "opacity") {
      editUserIdModal.classList.add("hidden");
      editUserIdModal.removeEventListener("transitionend", handler);
    }
  });
});

// Save Username
saveUserIdBtn.addEventListener("click", () => {
  const newUserId = newUserIdInput.value.trim();
  if (!newUserId) return alert("یوزرنیم نمی‌تواند خالی باشد!");

  if (!/^[a-zA-Z0-9._]+$/.test(newUserId)) {
    return alert(
      "یوزرنیم فقط می‌تواند شامل حروف، اعداد، نقطه و زیرخط (_) باشد.",
    );
  }

  localStorage.setItem("userId", newUserId);

  const profileUserId = document.getElementById("profileUserId");
  if (profileUserId) {
    profileUserId.textContent = `@${newUserId}`;
  }

  editUserIdModal.classList.remove("open");
  editUserIdModal.addEventListener("transitionend", function handler(e) {
    if (e.propertyName === "opacity") {
      editUserIdModal.classList.add("hidden");
      editUserIdModal.removeEventListener("transitionend", handler);
    }
  });
});

// Close modal on background click
editUserIdModal.addEventListener("click", (event) => {
  if (event.target === editUserIdModal) {
    editUserIdModal.classList.remove("open");
    editUserIdModal.addEventListener("transitionend", function handler(e) {
      if (e.propertyName === "opacity") {
        editUserIdModal.classList.add("hidden");
        editUserIdModal.removeEventListener("transitionend", handler);
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const btnAppearance = document.getElementById("btnAppearance");
  const btnAbout = document.getElementById("btnAbout");
  const slidePanel = document.getElementById("slidePanel");
  const closePanelBtn = document.getElementById("closePanelBtn");
  const appearanceContent = document.getElementById("appearanceContent");
  const aboutContent = document.getElementById("aboutContent");
  const imageSelectModal = document.getElementById("imageSelectModal");
  const imageOptions = document.getElementById("imageOptions");
  const imageSelectTitle = document.getElementById("imageSelectTitle");

  const changeProfileBtn = document.getElementById("changeProfileBtn");
  const changeBannerBtn = document.getElementById("changeBannerBtn");

  const profileImg = document.querySelector(".profile");
  const bannerImg = document.querySelector(".banner");

  const defaultProfileImages = [
    "/assets/profiles/profile1.jpg",
    "/assets/profiles/profile2.jpg",
    "/assets/profiles/profile3.jpg",
    "/assets/profiles/profile4.jpg",
    "/assets/profiles/profile5.jpg",
    "/assets/profiles/profile6.jpg",
    "/assets/profiles/profile7.jpg",
    "/assets/profiles/profile8.jpg",
    "/assets/profiles/profile9.jpg",
    "/assets/profiles/profile10.jpg",
  ];
  const defaultBannerImages = [
    "assets/banners/banner1.jpg",
    "assets/banners/banner2.jpg",
    "assets/banners/banner3.jpg",
    "assets/banners/banner4.jpg",
    "assets/banners/banner5.jpg",
    "assets/banners/banner6.jpg",
    "assets/banners/banner7.jpg",
    "assets/banners/banner8.jpg",
  ];

  // Open slide panel with specified content
  function openPanel(content) {
    slidePanel.classList.remove("hidden");
    setTimeout(() => slidePanel.classList.add("show"), 10);

    appearanceContent.classList.add("hidden");
    aboutContent.classList.add("hidden");
    imageSelectModal.classList.add("hidden");
    imageSelectModal.classList.remove("open");

    if (content === "appearance") {
      appearanceContent.classList.remove("hidden");
    } else if (content === "about") {
      aboutContent.classList.remove("hidden");
    }
  }

  // Close slide panel
  function closePanel() {
    slidePanel.classList.remove("show");
    setTimeout(() => slidePanel.classList.add("hidden"), 300);
  }

  // Open image selector
  function openImageSelector(type) {
    imageOptions.innerHTML = "";

    const images =
      type === "profile" ? defaultProfileImages : defaultBannerImages;
    imageSelectTitle.textContent =
      type === "profile" ? "انتخاب عکس پروفایل" : "انتخاب بنر";

    images.forEach((src) => {
      const img = document.createElement("img");
      img.src = `./${src}`;
      img.className = "selectable-image";

      img.addEventListener("click", () => {
        if (type === "profile") {
          localStorage.setItem("profileImage", src);
          profileImg.src = `./${src}`;
        } else {
          localStorage.setItem("bannerImage", src);
          bannerImg.src = `./${src}`;
        }
        closeImageSelector();
      });

      imageOptions.appendChild(img);
    });

    openPanel(); // make sure panel is open
    imageSelectModal.classList.remove("hidden");
    requestAnimationFrame(() => imageSelectModal.classList.add("open"));
  }

  // Close image selector
  function closeImageSelector() {
    imageSelectModal.classList.remove("open");
    imageSelectModal.addEventListener("transitionend", function handler(e) {
      if (e.propertyName === "opacity") {
        imageSelectModal.classList.add("hidden");
        imageSelectModal.removeEventListener("transitionend", handler);
      }
    });
  }

  // Load saved images from localStorage
  function applySavedImages() {
    const savedProfile = localStorage.getItem("profileImage");
    const savedBanner = localStorage.getItem("bannerImage");

    if (savedProfile) {
      profileImg.src = `./${savedProfile}`;
    }

    if (savedBanner) {
      bannerImg.src = `./${savedBanner}`;
    }
  }

  // Event Listeners
  btnAppearance.addEventListener("click", () => openPanel("appearance"));
  btnAbout.addEventListener("click", () => openPanel("about"));
  closePanelBtn.addEventListener("click", closePanel);

  changeProfileBtn.addEventListener("click", () =>
    openImageSelector("profile"),
  );
  changeBannerBtn.addEventListener("click", () => openImageSelector("banner"));

  window.addEventListener("load", () => {
    applySavedImages();
  });

  // Service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.error("SW registration failed:", err));
    });
  }
});

const lockScreen = document.getElementById("lockScreen");
const lockTitle = document.getElementById("lockTitle");
const passwordDots = document.getElementById("passwordDots");
const setPasswordBtn = document.getElementById("setPasswordBtn");
const removePasswordBtn = document.getElementById("removePasswordBtn");
const closeLockScreenBtn = document.getElementById("closeLockScreen");

let inputPassword = "";
let mode = "unlock"; // "unlock" | "set" | "confirm"
let tempPassword = "";

// Render dots
function renderDots(len) {
  passwordDots.innerHTML = "";
  for (let i = 0; i < len; i++) {
    const dot = document.createElement("span");
    dot.classList.add("filled");
    passwordDots.appendChild(dot);
  }
  for (let i = len; i < 4; i++) {
    const dot = document.createElement("span");
    passwordDots.appendChild(dot);
  }
}

// Reset input
function resetInput() {
  inputPassword = "";
  renderDots(0);
}

// Handle numpad clicks
document.querySelectorAll(".numpad button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const num = btn.dataset.num;
    const action = btn.dataset.action;

    if (num) {
      if (inputPassword.length < 4) {
        inputPassword += num;
        renderDots(inputPassword.length);
      }
    } else if (action === "del") {
      inputPassword = inputPassword.slice(0, -1);
      renderDots(inputPassword.length);
    } else if (action === "ok") {
      if (inputPassword.length !== 4) return;

      if (mode === "unlock") {
        const savedPass = localStorage.getItem("appPassword");
        if (savedPass && inputPassword === savedPass) {
          lockScreen.classList.remove("show"); // slide out
          resetInput();
        } else {
          alert("رمز اشتباه است!");
          resetInput();
        }
      } else if (mode === "set") {
        tempPassword = inputPassword;
        resetInput();
        lockTitle.textContent = "رمز را دوباره وارد کنید";
        mode = "confirm";
      } else if (mode === "confirm") {
        if (inputPassword === tempPassword) {
          localStorage.setItem("appPassword", inputPassword);
          alert("رمز با موفقیت تنظیم شد ✅");
          lockScreen.classList.remove("show"); // slide out after setting
          removePasswordBtn.classList.remove("hidden");
        } else {
          alert("رمزها مطابقت ندارند ❌");
        }
        resetInput();
        mode = "unlock";
        lockTitle.textContent = "رمز عبور را وارد کنید";
      }
    }
  });
});

// On load, if password exists, show the lock screen with animation
window.addEventListener("load", () => {
  if (localStorage.getItem("appPassword")) {
    mode = "unlock";
    lockTitle.textContent = "رمز عبور را وارد کنید";
    lockScreen.classList.add("show");
    removePasswordBtn.classList.remove("hidden");
  }
});

setPasswordBtn.addEventListener("click", () => {
  mode = "set";
  lockTitle.textContent = "یک رمز ۴ رقمی وارد کنید";
  resetInput();
  lockScreen.classList.add("show");
  closeLockScreenBtn.classList.remove("hidden"); // show close button
});

// Close button only works for setting password
closeLockScreenBtn.addEventListener("click", () => {
  lockScreen.classList.remove("show");
  resetInput();
  mode = "unlock"; // reset mode
  lockTitle.textContent = "رمز عبور را وارد کنید";
  closeLockScreenBtn.classList.add("hidden"); // hide again
});

// Remove password
removePasswordBtn.addEventListener("click", () => {
  if (confirm("آیا مطمئن هستید که می‌خواهید رمز را حذف کنید؟")) {
    localStorage.removeItem("appPassword");
    alert("رمز حذف شد ❌");
    removePasswordBtn.classList.add("hidden");
  }
});

class RippleEffect {
  /**
   * @param {string} selector
   */
  constructor(selector) {
    this.buttons = document.querySelectorAll(selector);
    this.init();
  }

  /**
   * @param {Event} event
   * @param {HTMLElement} button
   */
  createRipple(event, button) {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    const color =
      button.getAttribute("data-color") || "rgba(180, 180, 180, 0.6)";
    ripple.style.backgroundColor = color;

    ripple.classList.add("ripple");
    button.appendChild(ripple);

    ripple.addEventListener("animationend", () => ripple.remove());
  }

  init() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        this.createRipple(event, button);
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new RippleEffect(".ripple-button");
});

async function loadWeather() {
  try {
    const res = await fetch(
      "https://amirmasoud.netlify.app/api/v1/weather?city=Tehran",
    );
    const data = await res.json();

    const widget = document.getElementById("weatherWidget");
    const tempEl = document.getElementById("weatherTemp");
    const descEl = document.getElementById("weatherDescription");
    const emojiEl = document.getElementById("weatherEmoji");
    const forecastEl = document.getElementById("weatherForecast");

    // Current weather
    const current = data.current;
    tempEl.innerHTML = `${Math.round(current.temp.current)}°`;
    emojiEl.innerHTML = `<img src="https://dasteaval.news/_ipx/q_80/images/weather/${current.weather.icon}.svg" alt="${current.weather.description}" width="30">`;

    // Forecast
    forecastEl.innerHTML = "";
    data.forecast.forEach((day) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <p>${day.dateTitle.replace(/[0-9۰-۹]/g, "")}</p>
        <img src="https://dasteaval.news/_ipx/q_80/images/weather/${day.weather.icon}.svg" alt="${day.weather.description}" width="30">
        <p>${Math.round(day.temp.min)}° / ${Math.round(day.temp.max)}°</p>
      `;
      forecastEl.appendChild(div);
    });

    widget.classList.remove("hidden");
  } catch (err) {
    console.error("Weather load error:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadWeather);

async function loadCurrencies() {
  try {
    const res = await fetch("https://amirmasoud.netlify.app/api/v1/currency");
    const data = await res.json();
    const grid = document.getElementById("currencyGrid");

    const keysToShow = ["usd", "eur", "sekkeh", "18ayar", "usd_usdt", "gbp", "aed"];

    grid.innerHTML = "";

    data.data.forEach((item) => {
      if (keysToShow.includes(item.key)) {
        const card = document.createElement("div");
        card.className = "currency-card";
        card.innerHTML = `
          <div class="currency-info">
            <div class="currency-text">
              <p>${item.title}</p>
              <span>${item.key}</span>
            </div>
            <img src="${item.icon}" alt="${item.title}" />
          </div>
          <div class="currency-icon">
            <span class="currency-price">
              ${Number(item.price).toLocaleString()} ${item.currency}
            </span>
          </div>
        `;
        grid.appendChild(card);
      }
    });

    document.getElementById("currencyWidget").classList.remove("hidden");
  } catch (err) {
    console.error("Currency load error:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadCurrencies);
