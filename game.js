const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

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

let piece = newPieceObj();

function newPieceObj(){
  return {
    shape: shapes[Math.floor(Math.random()*shapes.length)],
    x:4,
    y:0
  };
}

// ------------------ SOUND ------------------
function sound(type){
  let a = new Audio();
  if(type==="ok") a.src="https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg";
  if(type==="bad") a.src="https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg";
  a.play();
}

// ------------------ SHAKE ------------------
function shake(){
  document.body.style.transform="translate(3px,3px)";
  setTimeout(()=>document.body.style.transform="translate(0,0)",80);
}

// ------------------ DRAW ------------------
function draw(){
  ctx.clearRect(0,0,240,400);

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

// ------------------ COLLISION ------------------
function collide(){
  return piece.shape.some((r,dy)=>
    r.some((v,dx)=>{
      let x=piece.x+dx;
      let y=piece.y+dy;
      return v && (y>=ROWS || x<0 || x>=COLS || board[y]?.[x]);
    })
  );
}

// ------------------ MERGE ------------------
function merge(){
  piece.shape.forEach((r,dy)=>{
    r.forEach((v,dx)=>{
      if(v) board[piece.y+dy][piece.x+dx]=1;
    });
  });
}

// ------------------ DROP ------------------
function drop(){
  piece.y++;
  if(collide()){
    piece.y--;
    merge();
    clearLines();
    piece = newPieceObj();
    askQuestion();
  }
  draw();
}

// ------------------ MOVE ------------------
function move(dir){
  if(!canMove) return;
  piece.x+=dir;
  if(collide()) piece.x-=dir;
  shake();
  draw();
}

// ------------------ ROTATE ------------------
function rotate(){
  if(!canMove) return;

  let newShape = piece.shape[0].map((_,i)=>
    piece.shape.map(r=>r[i]).reverse()
  );

  let old = piece.shape;
  piece.shape=newShape;

  if(collide()) piece.shape=old;

  draw();
}

// ------------------ CLEAR LINES ------------------
function clearLines(){
  let lines=0;

  board = board.filter(r=>{
    if(r.every(v=>v)){
      lines++;
      return false;
    }
    return true;
  });

  while(board.length<ROWS)
    board.unshift(Array(COLS).fill(0));

  if(lines){
    score+=lines*100;
    document.getElementById("score").innerText=score;

    level = Math.floor(score/500)+1;
    document.getElementById("level").innerText=level;
  }
}

// ------------------ QUIZ ------------------
async function fetchQ(){
  let r = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");
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

  document.getElementById("question").innerHTML=q.q;

  let div=document.getElementById("answers");
  div.innerHTML="";

  q.a.forEach((a,i)=>{
    let b=document.createElement("button");
    b.innerText=a;

    b.onclick=()=>{
      if(i===q.c){
        canMove=true;
        sound("ok");
        shake();
      } else {
        sound("bad");
        shake();
      }
    };

    div.appendChild(b);
  });
}

// ------------------ LOOP ------------------
function loop(){
  if(dropStarted) drop();
  setTimeout(loop,800 - level*50);
}

// ------------------ START ------------------
function start(){
  askQuestion();

  setTimeout(()=>{
    dropStarted=true;
    canMove=true;
    loop();
  },10000);
}

start();
draw();
