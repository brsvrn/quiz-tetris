const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ROWS = 20;
const COLS = 12;
const SIZE = 20;

let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));

let score = 0;
let level = 1;

let canMove = false;
let dropStarted = false;

const shapes = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,0,0],[1,1,1]]
];

let piece = {
  shape: shapes[Math.floor(Math.random()*shapes.length)],
  x: 4,
  y: 0
};

// 🧠 ONLINE SORU
async function fetchQuestion(){
  let res = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
  let data = await res.json();

  let q = data.results[0];
  let answers = [...q.incorrect_answers, q.correct_answer];
  answers.sort(()=>Math.random()-0.5);

  return {
    question: decode(q.question),
    answers: answers.map(a=>decode(a)),
    correct: answers.indexOf(q.correct_answer)
  };
}

function decode(str){
  let txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

// 🎯 SORU GÖSTER
async function askQuestion(){
  let q = await fetchQuestion();

  document.getElementById("question").innerText = q.question;

  let ansDiv = document.getElementById("answers");
  ansDiv.innerHTML = "";

  q.answers.forEach((ans,i)=>{
    let btn = document.createElement("button");
    btn.innerText = ans;

    btn.onclick = ()=>{
      if(i === q.correct){
        canMove = true;
        alert("Doğru!");
      } else {
        alert("Yanlış!");
      }
    };

    ansDiv.appendChild(btn);
  });
}

// 🧱 DRAW
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  board.forEach((row,y)=>{
    row.forEach((v,x)=>{
      if(v){
        ctx.fillStyle="#00f0ff";
        ctx.fillRect(x*SIZE,y*SIZE,SIZE,SIZE);
      }
    });
  });

  piece.shape.forEach((row,dy)=>{
    row.forEach((v,dx)=>{
      if(v){
        ctx.fillStyle="#8a2be2";
        ctx.fillRect((piece.x+dx)*SIZE,(piece.y+dy)*SIZE,SIZE,SIZE);
      }
    });
  });
}

// 🧩 MOVE
function move(dir){
  if(!canMove) return;
  piece.x += dir;
  draw();
}

// 🔄 ROTATE
function rotate(){
  if(!canMove) return;
  let newShape = piece.shape[0].map((_,i)=>
    piece.shape.map(r=>r[i]).reverse()
  );
  piece.shape = newShape;
  draw();
}

// ⬇️ DROP
function drop(){
  piece.y++;
  draw();
}

// 🚀 START
function start(){
  askQuestion();

  setTimeout(()=>{
    canMove = true;

    setInterval(()=>{
      drop();
    },800);

  },10000);
}

start();
draw();
