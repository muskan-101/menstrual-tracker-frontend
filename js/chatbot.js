let chatIcon, chatbox, messages, chatInput, typingIndicator, buttonContainer;

document.addEventListener("DOMContentLoaded", () => {
  chatIcon = document.getElementById("chat-icon");
  chatbox = document.getElementById("chatbox");
  messages = document.getElementById("chat-messages");
  chatInput = document.getElementById("chat-input");
  typingIndicator = document.getElementById("typing-indicator");
  buttonContainer = document.getElementById("chat-button-container");

  chatIcon.onclick = toggleChat;
});

const questions = [
  { id: "age", text: "What is your age? 🎂", type: "number" },
  { id: "bmi", text: "What is your BMI? ⚖️", type: "number" },
  { id: "cycle", text: "Is your cycle irregular? 🗓️", type: "binary" },
  { id: "cycle_length", text: "Cycle length in days? ⏳", type: "number" },
  { id: "weight_gain", text: "Do you have unexplained weight gain? ⚖️", type: "binary" },
  { id: "hair_growth", text: "Excessive hair growth (Hirsutism)? 💈", type: "binary" },
  { id: "skin_darkening", text: "Skin darkening (Acanthosis Nigricans)? 🌑", type: "binary" },
  { id: "hair_loss", text: "Hair loss or thinning? 💇‍♀️", type: "binary" },
  { id: "pimples", text: "Frequent pimples/acne? ✨", type: "binary" },
  { id: "fast_food", text: "Do you eat fast food frequently? 🍔", type: "binary" },
  { id: "exercise", text: "Do you exercise regularly? 🏃‍♀️", type: "binary" }
];

let answers = {};
let currentStep = 0;
let isStarted = false;
let isBotTyping = false;

// Toggle chatbox visibility
function toggleChat() {
  chatbox.classList.toggle("hidden");
  if (!isStarted && !chatbox.classList.contains("hidden")) {
    startConversation();
  }
}

function startConversation() {
  isStarted = true;
  addMessage("Bot", "Hi! I'm Bloom, your personal health assistant. Let's check your PCOS risk profile. 🌸");
  setTimeout(() => askQuestion(), 800);
}

function askQuestion() {
  if (currentStep >= questions.length) {
    processAnswers();
    return;
  }

  const question = questions[currentStep];
  showTyping(true);

  setTimeout(() => {
    showTyping(false);
    addMessage("Bot", question.text);

    if (question.type === "binary") {
      showButtons(["Yes", "No"]);
    } else {
      chatInput.focus();
    }
  }, 1000);
}

function handleResponse(response) {
  const question = questions[currentStep];

  // Validation
  if (question.type === "number") {
    const val = parseFloat(response);
    if (isNaN(val) || val <= 0) {
      addMessage("Bot", "Please enter a valid number. 💓");
      return;
    }
    answers[question.id] = val;
  } else if (question.type === "binary") {
    answers[question.id] = (response.toLowerCase() === "yes") ? 1 : 0;
  }

  addMessage("User", response);
  buttonContainer.innerHTML = "";
  currentStep++;
  askQuestion();
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isBotTyping) return;

  chatInput.value = "";
  handleResponse(text);
}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
}

function addMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${sender.toLowerCase()}-message`;
  msgDiv.innerText = text;
  messages.appendChild(msgDiv);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping(show) {
  isBotTyping = show;
  typingIndicator.style.display = show ? "flex" : "none";
  messages.scrollTop = messages.scrollHeight;
}

function showButtons(options) {
  buttonContainer.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "chat-btn";
    btn.innerText = opt;
    btn.onclick = () => handleResponse(opt);
    buttonContainer.appendChild(btn);
  });
}

function processAnswers() {
  showTyping(true);

  fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(answers)
  })
    .then(res => res.json())
    .then(result => {
      showTyping(false);
      let prob = result.probability * 100;
      let text = "";

      if (prob > 70) {
        text = `⚠️ High risk (${prob.toFixed(1)}%). Based on your answers, we highly recommend consulting a healthcare professional for a detailed check-up.`;
      } else if (prob > 40) {
        text = `⚠️ Moderate risk (${prob.toFixed(1)}%). It's a good idea to monitor your symptoms and consider lifestyle improvements.`;
      } else {
        text = `✅ Low risk (${prob.toFixed(1)}%). You're doing great! Keep maintaining a healthy lifestyle. 🌸`;
      }

      addMessage("Bot", text);
      showButtons(["Restart Quiz"]);
      buttonContainer.firstChild.onclick = restartChat;
    })
    .catch(err => {
      showTyping(false);
      console.error(err);
      addMessage("Bot", "❌ Connection Error. Please ensure the analysis server is running and try again.");
      showButtons(["Try Again"]);
      buttonContainer.firstChild.onclick = restartChat;
    });
}

function restartChat() {
  messages.innerHTML = "";
  buttonContainer.innerHTML = "";
  answers = {};
  currentStep = 0;
  startConversation();
}