// ----------------------------
// STORAGE HELPERS
// ----------------------------
// ----------------------------
// ADMIN SECURITY
// ----------------------------
const ADMIN_PASSWORD = "1234";

function adminLogin() {
  let pass = document.getElementById("adminPass").value;

  if (pass === ADMIN_PASSWORD) {
    localStorage.setItem("isAdminLoggedIn", "true");
    showAdminControls();
  } else {
    alert("Wrong password");
  }
}

function adminLogout() {
  localStorage.removeItem("isAdminLoggedIn");
  location.reload();
}

function showAdminControls() {
  let loggedIn = localStorage.getItem("isAdminLoggedIn");

  if (loggedIn === "true") {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("adminControls").style.display = "block";
  }
}
function getTokens() {
  return JSON.parse(localStorage.getItem("tokens")) || [];
}

function saveTokens(tokens) {
  localStorage.setItem("tokens", JSON.stringify(tokens));
}

function getCurrentToken() {
  return Number(localStorage.getItem("currentToken")) || 1;
}

function setCurrentToken(num) {
  localStorage.setItem("currentToken", num);
}

// ----------------------------
// BOOK TOKEN
// ----------------------------
function bookToken() {
  let name = document.getElementById("name").value;
  let phone = document.getElementById("phone").value;

  if (name === "" || phone === "") {
    alert("Fill all fields");
    return;
  }

  fetch("https://barber-queue.onrender.com/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name,
      phone: phone
    })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById("result").innerText =
      "Your token number is: " + data.token;
  });
}
// ----------------------------
// SHOW LIVE QUEUE
// ----------------------------
function showQueue() {
  let nowServing = document.getElementById("nowServing");
  let queueList = document.getElementById("queueList");
  if (!queueList || !nowServing) return;

  let tokens = getTokens();
  let current = getCurrentToken();

  nowServing.innerText = current;

  queueList.innerHTML = "";

  tokens.forEach(t => {
    if (t.token > current) {
      let li = document.createElement("li");
      li.innerText = "Token " + t.token + " - " + t.name;
      queueList.appendChild(li);
    }
  });
}

setInterval(showQueue, 1000);

// ----------------------------
// ADMIN ACTIONS
// ----------------------------
function markDone() {
  if (localStorage.getItem("isAdminLoggedIn") !== "true") return;

  let current = getCurrentToken();
  let tokens = getTokens();

  tokens = tokens.filter(t => t.token !== current);

  saveTokens(tokens);
  setCurrentToken(current + 1);
}

function skipToken() {
  markDone();
}

function clearQueue() {
  localStorage.removeItem("tokens");
  localStorage.removeItem("currentToken");
  alert("Queue cleared");
}
showAdminControls();
function loadQueueFromServer() {
  fetch("https://barber-queue.onrender.com/queue")
    .then(res => res.json())
    .then(data => {
      if (!document.getElementById("queueList")) return;

      document.getElementById("nowServing").innerText =
        data.nowServing ? data.nowServing.token : "None";

      let list = document.getElementById("queueList");
      list.innerHTML = "";

      data.queue.forEach(item => {
        let li = document.createElement("li");
        li.innerText = "Token " + item.token + " - " + item.name;
        list.appendChild(li);
      });
    });
}

setInterval(loadQueueFromServer, 1000);
function markDone() {
  fetch("https://barber-queue.onrender.com/done", {
    method: "POST"
  });
}

function skipToken() {
  fetch("https://barber-queue.onrender.com/skip", {
    method: "POST"
  });
}