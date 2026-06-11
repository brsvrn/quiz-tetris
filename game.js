const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 500;

const ROWS = 20;
const COLS = 12;
const SIZE = 20;

let board = Array.from({length:ROWS},()=>Array(COLS).fill(0));

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

let piece;

function newPiece(){
  return {
    shape: shapes[Math.floor(Math.random()*shapes.length)],
    x:4,
    y:0
  };
}

piece = newPiece();

// ---------------- START SYSTEM ----------------
function startGame(){
  document.getElementById("startScreen").style.display="none";
  document.getElementById("gameUI").style.display="block";

  askQuestion();

  setTimeout(()=>{
    canMove=true;
    dropStarted=true;
    loop();
  },10000);
}

// ---------------- DRAW ----------------
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  board.forEach((r,y)=>{
    r.forEach((v,x)=>{
      if(v){
        ctx.fillStyle="#00f0ff";
        ctx.fillRect(x*SIZE,y*SIZE,SIZE,SIZE);
      }
    });
  });

  piece.shape.forEach((r,dy)=>{
    r.forEach((v,dx)=>{
      if(v){
        ctx.fillStyle="#8a2be2";
        ctx.fillRect((piece.x+dx)*SIZE,(piece.y+dy)*SIZE,SIZE,SIZE);
      }
    });
  });
}

// ---------------- MOVE ----------------
function move(dir){
  if(!canMove) return;
  piece.x+=dir;
  draw();
}

// ---------------- ROTATE ----------------
function rotate(){
  if(!canMove) return;
  let newShape = piece.shape[0].map((_,i)=>
    piece.shape.map(r=>r[i]).reverse()
  );
  piece.shape=newShape;
  draw();
}

// ---------------- DROP ----------------
function drop(){
  piece.y++;
  draw();
}

// ---------------- LOOP ----------------
function loop(){
  if(dropStarted) drop();
  setTimeout(loop,800 - level*50);
}

// ---------------- TR QUIZ FIX ----------------
async function fetchQ(){
  let r = await fetch("https://opentdb.com/api.php?amount=1&type=multiple&lang=tr");
  let d = await r.json();
  let q=d.results[0];

  let ans=[...q.incorrect_answers,q.correct_answer];
  ans.sort(()=>Math.random()-0.5);

  return {
    q:q.question,
    a:ans,
    c:ans.indexOf(q.correct_answer)
  };
}

async function askQuestion(){
  let q = await fetchQ();

  document.getElementById("question").innerText=q.q;

  let div=document.getElementById("answers");
  div.innerHTML="";

  q.a.forEach((a,i)=>{
    let b=document.createElement("button");
    b.innerText=a;

    b.onclick=()=>{
      if(i===q.c){
        canMove=true;
        alert("Doğru!");
      } else {
        alert("Yanlış!");
      }
    };

    div.appendChild(b);
  });
}
