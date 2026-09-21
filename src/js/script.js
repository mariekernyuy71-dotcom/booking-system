
const services = [
  { id: 1, name: "Plumbing", category: "Home Services", icon: "fa-wrench",
    description: "Leak repairs, pipe fitting, tap and toilet installation.", price: 10000 },
  { id: 2, name: "Electrical Repair", category: "Home Services", icon: "fa-bolt",
    description: "Wiring faults, sockets, switches and lighting installation.", price: 12000 },
  { id: 3, name: "Phone Repair", category: "Electronics", icon: "fa-mobile-screen",
    description: "Screen replacement, battery replacement and other phone repairs.", price: 15000 },
  { id: 4, name: "Computer Repair", category: "Computer", icon: "fa-laptop",
    description: "Hardware fixes, upgrades and laptop screen or keyboard replacement.", price: 20000 },
  { id: 5, name: "Cleaning", category: "Cleaning", icon: "fa-broom",
    description: "Home and office cleaning, windows, floors and deep cleaning.", price: 8000 },
  { id: 6, name: "AC Servicing", category: "Electronics", icon: "fa-snowflake",
    description: "Air conditioner cleaning, gas refill and full maintenance.", price: 18000 },
];

const categories = ["All", "Electronics", "Home Services", "Cleaning", "Computer"];


let activeCategory = "All";
let searchQuery = "";
let sortOrder = "default";


const grid = document.getElementById("service-grid");
const filtersBox = document.getElementById("category-filters");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const noResults = document.getElementById("no-results");

const modal = document.getElementById("booking-modal");
const bookingForm = document.getElementById("booking-form");
const serviceSelect = document.getElementById("service-select");
const dateInput = document.getElementById("date");
const closeBtn = document.getElementById("close-booking");
const cancelBtn = document.getElementById("cancel-booking");

const confirmModal = document.getElementById("confirm-modal");
const bookingsList = document.getElementById("bookings-list");
const noBookings = document.getElementById("no-bookings");
const toastBox = document.getElementById("toast-container");

const fields = {
  fullName: document.getElementById("full-name"),
  phone: document.getElementById("phone"),
  email: document.getElementById("email"),
  service: serviceSelect,
  date: dateInput,
  time: document.getElementById("time"),
  location: document.getElementById("location"),
};

const formatPrice = (n) => n.toLocaleString("en-US") + " FCFA";

const activeBtn = "bg-blue-600 text-white";
const inactiveBtn = "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50";

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}


function renderFilters() {
  filtersBox.innerHTML = categories.map((cat) => `
    <button type="button" data-category="${cat}"
      class="rounded-full px-5 py-2 text-sm font-semibold transition
             ${cat === activeCategory ? activeBtn : inactiveBtn}">
      ${cat}
    </button>
  `).join("");
}

function getVisibleServices() {
  let list = services.filter((s) => {
    const matchesCategory = activeCategory === "All" || s.category === activeCategory;
    const text = (s.name + " " + s.description + " " + s.category).toLowerCase();
    return matchesCategory && text.includes(searchQuery);
  });

  if (sortOrder === "low") list.sort((a, b) => a.price - b.price);
  if (sortOrder === "high") list.sort((a, b) => b.price - a.price);
  return list;
}

function renderServices() {
  const list = getVisibleServices();

  grid.innerHTML = list.map((s) => `
    <article class="flex flex-col rounded-2xl bg-white p-6 shadow-md transition
                    hover:-translate-y-1 hover:shadow-xl">
      <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl text-blue-600">
        <i class="fa-solid ${s.icon}"></i>
      </div>
      <h3 class="text-xl font-bold">${s.name}</h3>
      <p class="mt-2 flex-1 text-gray-600">${s.description}</p>
      <p class="mt-4 text-sm text-gray-500">Starting from</p>
      <p class="text-lg font-bold text-blue-600">${formatPrice(s.price)}</p>
      <button type="button" data-service="${s.name}"
        class="mt-4 rounded-full bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-700">
        Book Now
      </button>
    </article>
  `).join("");

  noResults.classList.toggle("hidden", list.length > 0);
}


searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  renderServices();
});

sortSelect.addEventListener("change", (e) => {
  sortOrder = e.target.value;
  renderServices();
});

filtersBox.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-category]");
  if (!btn) return;
  activeCategory = btn.dataset.category;
  renderFilters();
  renderServices();
});

grid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-service]");
  if (!btn) return;
  openBooking(btn.dataset.service);
});

serviceSelect.innerHTML =
  '<option value="">Select a service</option>' +
  services.map((s) => `<option value="${s.name}">${s.name}</option>`).join("");

function setMinDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.min = `${year}-${month}-${day}`;
}

function openBooking(serviceName = "") {
  serviceSelect.value = serviceName;
  setMinDate();
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
  fields.fullName.focus();
}

function closeBooking() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
  bookingForm.reset();
  clearErrors();
}

document.querySelectorAll("[data-open-booking]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    openBooking();
  });
});

closeBtn.addEventListener("click", closeBooking);
cancelBtn.addEventListener("click", closeBooking);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeBooking();
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!modal.classList.contains("hidden")) closeBooking();
  if (!confirmModal.classList.contains("hidden")) closeConfirmation();
});


function showError(key, message) {
  const errorEl = document.querySelector(`[data-error="${key}"]`);
  errorEl.textContent = message;
  errorEl.classList.remove("hidden");
  fields[key].classList.remove("border-gray-300");
  fields[key].classList.add("border-red-500");
}

function clearError(key) {
  const errorEl = document.querySelector(`[data-error="${key}"]`);
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
  fields[key].classList.remove("border-red-500");
  fields[key].classList.add("border-gray-300");
}

function clearErrors() {
  Object.keys(fields).forEach(clearError);
}

Object.keys(fields).forEach((key) => {
  fields[key].addEventListener("input", () => clearError(key));
});

function validateForm() {
  clearErrors();
  const errors = {};

  const name = fields.fullName.value.trim();
  if (name === "") errors.fullName = "Please enter your full name.";
  else if (name.length < 3) errors.fullName = "Name must be at least 3 characters.";

  const phone = fields.phone.value.replace(/[\s-]/g, "");
  if (phone === "") errors.phone = "Please enter your phone number.";
  else if (!/^\+?\d{8,15}$/.test(phone))
    errors.phone = "Enter a valid phone number (8 to 15 digits).";

  const email = fields.email.value.trim();
  if (email === "") errors.email = "Please enter your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email like name@example.com.";

  if (fields.service.value === "") errors.service = "Please select a service.";

  if (fields.date.value === "") errors.date = "Please choose a date.";
  else if (fields.date.value < fields.date.min)
    errors.date = "The date cannot be in the past.";

  if (fields.time.value === "") errors.time = "Please choose a time.";

  if (fields.location.value.trim() === "")
    errors.location = "Please enter your location.";

  Object.keys(errors).forEach((key) => showError(key, errors[key]));

  const firstKey = Object.keys(errors)[0];
  if (firstKey) fields[firstKey].focus();

  return firstKey === undefined;
}


function generateBookingId() {
  let count = 1;
  try {
    count = Number(localStorage.getItem("bookingCounter") || 0) + 1;
    localStorage.setItem("bookingCounter", count);
  } catch (err) {
    count = Math.floor(Math.random() * 900) + 100;
  }
  return `BK-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;
}

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem("bookings")) || [];
  } catch (err) {
    return [];
  }
}

function saveBookings(list) {
  try {
    localStorage.setItem("bookings", JSON.stringify(list));
  } catch (err) {
    console.error("Could not save bookings", err);
  }
}


function showToast(message, type = "success") {
  const color = type === "success" ? "bg-green-600" : "bg-gray-900";
  const toast = document.createElement("div");
  toast.className = `${color} rounded-lg px-5 py-3 text-white shadow-lg transition duration-300`;
  toast.textContent = message;
  toastBox.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


function showConfirmation(id, booking) {
  document.getElementById("confirm-id").textContent = id;
  document.getElementById("confirm-name").textContent = booking.name;
  document.getElementById("confirm-service").textContent = booking.service;
  document.getElementById("confirm-date").textContent = formatDate(booking.date);
  document.getElementById("confirm-time").textContent = booking.time;
  document.getElementById("confirm-location").textContent = booking.location;

  confirmModal.classList.remove("hidden");
  confirmModal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
}

function closeConfirmation() {
  confirmModal.classList.add("hidden");
  confirmModal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
}

document.getElementById("close-confirm").addEventListener("click", closeConfirmation);

confirmModal.addEventListener("click", (e) => {
  if (e.target === confirmModal) closeConfirmation();
});


const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-green-100 text-green-800",
  Completed: "bg-blue-100 text-blue-800",
  Cancelled: "bg-red-100 text-red-800",
};

function renderBookings() {
  const list = loadBookings().reverse();
  noBookings.classList.toggle("hidden", list.length > 0);

  bookingsList.innerHTML = list.map((b) => `
    <article class="rounded-2xl bg-white p-6 shadow-md">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm text-gray-500">Booking ID</p>
          <p class="font-bold text-blue-600">${escapeHTML(b.id)}</p>
        </div>
        <span class="rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[b.status]}">
          ${b.status}
        </span>
      </div>

      <h3 class="mt-4 text-xl font-bold">${escapeHTML(b.service)}</h3>
      <ul class="mt-3 space-y-1 text-gray-600">
        <li><i class="fa-solid fa-user w-5"></i> ${escapeHTML(b.name)}</li>
        <li><i class="fa-solid fa-calendar w-5"></i> ${formatDate(b.date)} at ${escapeHTML(b.time)}</li>
        <li><i class="fa-solid fa-location-dot w-5"></i> ${escapeHTML(b.location)}</li>
      </ul>

      ${b.status === "Pending" || b.status === "Confirmed" ? `
        <button type="button" data-cancel="${escapeHTML(b.id)}"
          class="mt-5 rounded-full border border-red-500 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white">
          Cancel booking
        </button>` : ""}
    </article>
  `).join("");
}

bookingsList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-cancel]");
  if (!btn) return;

  const list = loadBookings();
  const booking = list.find((b) => b.id === btn.dataset.cancel);
  if (!booking) return;

  booking.status = "Cancelled";
  saveBookings(list);
  renderBookings();
  showToast("Booking cancelled", "info");
});

bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const booking = {
    id: generateBookingId(),
    name: fields.fullName.value.trim(),
    phone: fields.phone.value.trim(),
    email: fields.email.value.trim(),
    service: fields.service.value,
    date: fields.date.value,
    time: fields.time.value,
    location: fields.location.value.trim(),
    message: document.getElementById("message").value.trim(),
    status: "Pending",
  };

  const list = loadBookings();
  list.push(booking);
  saveBookings(list);

  closeBooking();
  showConfirmation(booking.id, booking);
  renderBookings();
  showToast("Booking saved to My Bookings");
});

renderFilters();
renderServices();
renderBookings();