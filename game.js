const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 500;

let score = 0;
let level = 1;
let canMove = false;
let dropStarted = false;

let currentQ = null;

// =======================
// 🎮 START GAME
// =======================
function startGame(){
  document.getElementById("startScreen").style.display="none";
  document.getElementById("gameUI").style.display="block";

  loadAIQuestion();

  setTimeout(()=>{
    canMove = true;
    dropStarted = true;
    loop();
  },8000);
}

// =======================
// 🤖 GEMINI AI ENGINE
// =======================
async function getGeminiQuestion(){

  const API_KEY = "AQ.Ab8RN6JZfZ7oOQRJqJw_-7eXKvOLg_Lz957-bz6Gh-Gs7aDFhg";

  const prompt = `
Türkçe bir genel kültür sorusu üret.

ZORUNLU FORMAT:
{
  "question": "string",
  "answers": ["A","B","C","D"],
  "correct": 0
}

Kurallar:
- sadece JSON döndür
- açıklama yazma
- 4 şık olmalı
`;

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
    {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        contents:[{parts:[{text:prompt}]}]
      })
    }
  );

  const data = await res.json();

  let text = data.candidates[0].content.parts[0].text;

  try {
    return JSON.parse(text);
  } catch(e) {
    console.log("JSON fix retry");
    return await getGeminiQuestion();
  }
}

// =======================
// 🧠 LOAD QUESTION
// =======================
async function loadAIQuestion(){

  currentQ = await getGeminiQuestion();

  document.getElementById("question").innerText =
    currentQ.question;

  let div = document.getElementById("answers");
  div.innerHTML="";

  currentQ.answers.forEach((a,i)=>{
    let b = document.createElement("button");
    b.innerText = a;

    b.onclick = ()=>checkAnswer(b,i);

    div.appendChild(b);
  });
}

// =======================
// 🎯 ANSWER SYSTEM
// =======================
function checkAnswer(btn,i){

  let buttons = document.querySelectorAll("#answers button");

  if(i === currentQ.correct){

    btn.style.background="green";

    score += 50;
    document.getElementById("score").innerText=score;

    canMove = true;

    setTimeout(()=>{
      loadAIQuestion();
    },600);

  } else {

    btn.style.background="red";
    shake();

    setTimeout(()=>{
      buttons.forEach(b=>{
        b.style.background="";
      });
    },400);
  }
}

// =======================
// ⚡ SHAKE EFFECT
// =======================
function shake(){
  document.body.style.transform="translateX(5px)";
  setTimeout(()=>document.body.style.transform="translateX(-5px)",50);
  setTimeout(()=>document.body.style.transform="translateX(0)",100);
}

// =======================
// 🎮 SIMPLE TETRIS LOOP (placeholder engine)
// =======================
let piece = {x:4,y:0};

function loop(){
  if(dropStarted){
    piece.y++;
    draw();
  }

  setTimeout(loop,800 - level*50);
}

function draw(){
  ctx.clearRect(0,0,300,500);
  ctx.fillStyle="#00f0ff";
  ctx.fillRect(piece.x*20,piece.y*20,20,20);
}
