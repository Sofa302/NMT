let currentSubject = "";
let allQuestions = [];
let filteredQuestions = [];
let currentQuestion = null;

const API_URL = "https://reportsapi-a7tx.onrender.com/db/questions";

// ================= MENU =================
function openSubject(sub) {

  currentSubject = sub;

  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz").style.display = "block";
  document.getElementById("addBtn").style.display = "none";

  loadFromAPI(sub);
}

function backToMenu() {

  document.getElementById("menu").style.display = "grid";
  document.getElementById("quiz").style.display = "none";
  document.getElementById("addForm").style.display = "none";
  document.getElementById("addBtn").style.display = "block";
}

// ================= LOAD =================
async function loadFromAPI(category) {

  try {

    const res = await fetch(API_URL);
    const data = await res.json();

    allQuestions = data.data;

    filteredQuestions = allQuestions.filter(q =>
      q.category &&
      q.category.toLowerCase() === category.toLowerCase()
    );

    nextQuestion();

  } catch (e) {
    console.error(e);
    alert("Помилка API");
  }
}

// ================= RANDOM =================
function getRandomQuestion() {
  return filteredQuestions[
    Math.floor(Math.random() * filteredQuestions.length)
  ];
}

// ================= WRONG ANSWERS =================
function getWrongAnswers(correct, type) {

  let answers = filteredQuestions
    .filter(q => q.question_type === type)
    .map(q => q.right_answer)
    .filter(ans => ans !== correct);

  answers.sort(() => Math.random() - 0.5);

  return answers.slice(0, 3);
}

// ================= NEXT =================
function nextQuestion() {

  if (filteredQuestions.length === 0) {
    alert("Немає питань");
    return;
  }

  currentQuestion = getRandomQuestion();

  const correct = currentQuestion.right_answer;
  const type = currentQuestion.question_type;

  const wrong = getWrongAnswers(correct, type);

  const options = [...wrong, correct];
  options.sort(() => Math.random() - 0.5);

  renderQuestion(currentQuestion.question, options, correct);
}

// ================= RENDER =================
function renderQuestion(text, options, correct) {

  document.getElementById("question").innerText = text;

  const container = document.getElementById("options");
  container.innerHTML = "";

  // ❌ КНОПКА ВИДАЛЕННЯ (збоку біля питання)
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "❌";
  deleteBtn.style.marginLeft = "10px";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.background = "red";
  deleteBtn.style.color = "white";
  deleteBtn.style.border = "none";
  deleteBtn.style.borderRadius = "5px";

  deleteBtn.onclick = () => deleteQuestion(currentQuestion);

  document.getElementById("question").appendChild(deleteBtn);

  // варіанти
  options.forEach(opt => {

    const div = document.createElement("div");
    div.className = "option";
    div.innerText = opt;

    div.onclick = () => checkAnswer(opt, correct);

    container.appendChild(div);
  });
}

// ================= CHECK =================
function checkAnswer(selected, correct) {

  const ok =
    selected.toString().trim().toLowerCase() ===
    correct.toString().trim().toLowerCase();

  if (ok) alert("✅ Правильно");
  else alert("❌ Неправильно\nПравильна: " + correct);
}

// ================= DELETE =================
async function deleteQuestion(q) {

  if (!confirm("Видалити це питання?")) return;

  try {

    // пробуємо видалити з API (якщо є id)
    if (q.id) {
      await fetch(`https://reportsapi-a7tx.onrender.com/db/del-question/${q.id}`, {
        method: "DELETE"
      });
    }

    // видаляємо локально
    filteredQuestions = filteredQuestions.filter(item => item !== q);

    alert("❌ Питання видалено");

    nextQuestion();

  } catch (e) {
    console.error(e);
    alert("Помилка видалення");
  }
}

// ================= SHOW ADD =================
function showAdd() {

  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz").style.display = "none";
  document.getElementById("addForm").style.display = "block";
  document.getElementById("addBtn").style.display = "none";
}

// ================= SAVE =================
async function saveQuestion() {

  const sub = document.getElementById("subject").value;
  const text = document.getElementById("qText").value;
  const correct = document.getElementById("correct").value;
  const type = document.getElementById("type").value;

  if (!text || !correct) {
    alert("Заповни всі поля");
    return;
  }

  const newQuestion = {
    question: text,
    right_answer: correct,
    question_type: type,
    category: sub
  };

  try {

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuestion)
    });

    alert("✅ Додано");

    backToMenu();

  } catch (e) {
    console.error(e);
    alert("Помилка API");
  }
}