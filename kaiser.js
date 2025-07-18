<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>SuiBall Lock - v3</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{
    width:100%;height:100%;overflow:hidden;
    background:#000;
    display:flex;
    justify-content:center;
    align-items:center;
    user-select:none;
    font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
    color:#eee
  }
  canvas{
    display:block;
    background:#111;
    box-shadow:0 0 25px #09f;
    border-radius:12px
  }
  #scoreboard{
    position:fixed;
    top:10px;
    left:50%;
    transform:translateX(-50%);
    font-size:96px;
    font-weight:900;
    font-family:'Segoe UI Black','Arial Black',sans-serif;
    color:rgba(128,128,128,0.5);
    user-select:none;
    pointer-events:none;
    width:220px;
    display:flex;
    justify-content:center;
    gap:40px;
    text-align:center;
    z-index:10
  }
  #scoreboard span{
    width:auto;
    margin:0
  }
  #goalText{
    position:fixed;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    font-size:140px;
    font-weight:900;
    color:#0f0;
    text-shadow:
      0 0 12px rgba(0,255,0,0.6),
      0 0 24px rgba(0,255,0,0.4),
      0 0 36px rgba(0,255,0,0.3);
    pointer-events:none;
    user-select:none;
    opacity:0;
    transition:opacity .3s ease-in-out;
    z-index:2000
  }
  #winnerText{
    position:fixed;
    top:78%;
    left:50%;
    transform:translate(-50%, -50%);
    font-size:36px;
    font-weight:700;
    color:#0ff;
    text-shadow:0 0 10px #0ff;
    pointer-events:none;
    user-select:none;
    opacity:0;
    transition:opacity 0.3s ease-in-out;
    z-index:3000;
    white-space:nowrap;
    display:flex;
    align-items:center;
    gap:12px;
  }
  #restartBtn{
    position:fixed;
    top:70%;
    left:50%;
    transform:translate(-50%, -50%);
    font-size:28px;
    font-weight:700;
    padding:10px 30px;
    background:#0ff;
    border:none;
    border-radius:12px;
    color:#000;
    cursor:pointer;
    opacity:0;
    transition:opacity 0.3s ease-in-out;
    z-index:3000;
  }
  #restartBtn:hover{
    background:#09c;
    color:#fff;
  }
</style>
</head>
<body>
  <div id="scoreboard">
    <span id="score1">0</span>
    <span id="score2">0</span>
  </div>
  <div id="goalText">GOL!</div>
  <div id="winnerText"></div>
  <button id="restartBtn">Reiniciar</button>
  <canvas id="game"></canvas>
  <script type="module">
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const goalTextEl = document.getElementById('goalText');
    const score1El = document.getElementById('score1');
    const score2El = document.getElementById('score2');
    const winnerTextEl = document.getElementById('winnerText');
    const restartBtn = document.getElementById('restartBtn');

    function resize() {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.9;
    }
    resize();
    window.addEventListener('resize', resize);

    const player1 = {
      x: 100,
      y: 0,
      radius: 50,
      color1: '#00eaff',
      color2: '#004a66',
      speed: 7,
      vx: 0,
      vy: 0,
      up: false,
      down: false,
      left: false,
      right: false,
      score: 0,
    };

    const player2 = {
      x: 0,
      y: 0,
      radius: 50,
      color1: '#ff4500',
      color2: '#660200',
      speed: 7,
      vx: 0,
      vy: 0,
      up: false,
      down: false,
      left: false,
      right: false,
      score: 0,
    };

    let gameEnded = false;
    let goalScored = false;

    window.addEventListener('keydown', e => {
      if(gameEnded) return;
      switch(e.code) {
        case 'KeyW': player1.up = true; break;
        case 'KeyS': player1.down = true; break;
        case 'KeyA': player1.left = true; break;
        case 'KeyD': player1.right = true; break;
        case 'ArrowUp': player2.up = true; break;
        case 'ArrowDown': player2.down = true; break;
        case 'ArrowLeft': player2.left = true; break;
        case 'ArrowRight': player2.right = true; break;
      }
    });

    window.addEventListener('keyup', e => {
      if(gameEnded) return;
      switch(e.code) {
        case 'KeyW': player1.up = false; break;
        case 'KeyS': player1.down = false; break;
        case 'KeyA': player1.left = false; break;
        case 'KeyD': player1.right = false; break;
        case 'ArrowUp': player2.up = false; break;
        case 'ArrowDown': player2.down = false; break;
        case 'ArrowLeft': player2.left = false; break;
        case 'ArrowRight': player2.right = false; break;
      }
    });

    function movePlayer(p) {
      p.vx = 0; p.vy = 0;
      if(p.up) p.vy = -p.speed;
      if(p.down) p.vy = p.speed;
      if(p.left) p.vx = -p.speed;
      if(p.right) p.vx = p.speed;
      p.x += p.vx;
      p.y += p.vy;
      p.x = Math.min(Math.max(p.radius, p.x), canvas.width - p.radius);
      p.y = Math.min(Math.max(p.radius, p.y), canvas.height - p.radius);
    }

    function drawPlayer(p) {
      const grad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.3, p.x, p.y, p.radius);
      grad.addColorStop(0, p.color1);
      grad.addColorStop(1, p.color2);
      ctx.fillStyle = grad;
      ctx.shadowColor = p.color1;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 30,
      speedX: 0,
      speedY: 0,
      trail: [],
      portalEffect: 0,
    };

    const ballDefaultSpeed = 6;
    const ballDefaultSpeedYTarget = 0;
    const decelRate = 0.05;

    function approach(current, target, delta) {
      if(current < target) return Math.min(current + delta, target);
      else if(current > target) return Math.max(current - delta, target);
      return current;
    }

    function drawBall() {
      if(goalScored && ball.portalEffect <= 0) {
        return;
      }

      if(ball.portalEffect > 0) {
        ctx.save();
        ctx.globalAlpha = ball.portalEffect;
        const scale = ball.portalEffect;
        ctx.translate(ball.x, ball.y);
        ctx.scale(scale, scale);
        ctx.translate(-ball.x, -ball.y);
      }

      ball.trail.push({x: ball.x, y: ball.y, alpha: 0.5});
      if(ball.trail.length > 20) ball.trail.shift();

      ball.trail.forEach((t, i) => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,0,${t.alpha * (i / ball.trail.length)})`;
        ctx.shadowColor = 'rgba(255,255,0,0.8)';
        ctx.shadowBlur = 10;
        ctx.arc(t.x, t.y, ball.radius * 0.9, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.beginPath();
      const grad = ctx.createRadialGradient(
        ball.x - ball.radius / 3,
        ball.y - ball.radius / 3,
        ball.radius * 0.1,
        ball.x,
        ball.y,
        ball.radius
      );
      grad.addColorStop(0, '#ffff66');
      grad.addColorStop(1, '#999900');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 15;
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if(ball.portalEffect > 0) {
        ctx.restore();
      }
    }

    function drawGoals() {
      const goalWidth = 8;
      const goalHeight = canvas.height * 0.4;
      const goalY = canvas.height * 0.3;

      ctx.lineWidth = goalWidth;

      // Left goal
      ctx.strokeStyle = '#0099ff';
      ctx.shadowColor = '#0099ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(goalWidth / 2, goalY);
      ctx.lineTo(goalWidth / 2, goalY + goalHeight);
      ctx.stroke();

      // Right goal
      ctx.strokeStyle = '#ff4500';
      ctx.shadowColor = '#ff4500';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(canvas.width - goalWidth / 2, goalY);
      ctx.lineTo(canvas.width - goalWidth / 2, goalY + goalHeight);
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    function updateBall() {
      if(goalScored || gameEnded) {
        ball.portalEffect -= 0.04;
        if(ball.portalEffect < 0) ball.portalEffect = 0;
        return;
      }

      ball.x += ball.speedX;
      ball.y += ball.speedY;

      if(ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.speedY *= -1;
      }
      if(ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.speedY *= -1;
      }

      ball.speedX = approach(ball.speedX, (ball.speedX > 0 ? ballDefaultSpeed : -ballDefaultSpeed), decelRate);
      ball.speedY = approach(ball.speedY, ballDefaultSpeedYTarget, decelRate);

      [player1, player2].forEach(p => {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < ball.radius + p.radius) {
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY) + 0.7;
          ball.speedX = Math.cos(angle) * speed;
          ball.speedY = Math.sin(angle) * speed;
          ball.x = p.x + Math.cos(angle) * (ball.radius + p.radius + 1);
          ball.y = p.y + Math.sin(angle) * (ball.radius + p.radius + 1);

          const maxSpeed = 16;
          if(Math.abs(ball.speedX) > maxSpeed) ball.speedX = maxSpeed * Math.sign(ball.speedX);
          if(Math.abs(ball.speedY) > maxSpeed) ball.speedY = maxSpeed * Math.sign(ball.speedY);
        }
      });

      if(ball.x - ball.radius < 4) {
        if(ball.y > canvas.height * 0.3 && ball.y < canvas.height * 0.7) {
          handleGoal(player2);
        } else {
          ball.x = ball.radius;
          ball.speedX *= -1;
        }
      }

      if(ball.x + ball.radius > canvas.width - 4) {
        if(ball.y > canvas.height * 0.3 && ball.y < canvas.height * 0.7) {
          handleGoal(player1);
        } else {
          ball.x = canvas.width - ball.radius;
          ball.speedX *= -1;
        }
      }
    }

    function handleGoal(scoringPlayer) {
      if (goalScored || gameEnded) return;
      goalScored = true;
      scoringPlayer.score++;
      updateScore();
      goalTextEl.style.opacity = '1';
      ball.portalEffect = 1;
      ball.trail = [];
      checkWinCondition();

      // Faz o texto sumir em 1.8s
      setTimeout(() => {
        goalTextEl.style.opacity = '0';
      }, 1700);

      // Reposiciona um pouco depois, 1.9s
      setTimeout(() => {
        if (!gameEnded) {
          resetPositionsAfterGoal(scoringPlayer);
          goalScored = false;
          ball.portalEffect = 0;
          ball.trail = [];
        }
      }, 2000);
    }

    function checkWinCondition() {
      const diff = Math.abs(player1.score - player2.score);
      if(diff >= 5) {
        gameEnded = true;
        winnerTextEl.textContent = player1.score > player2.score ? 'Jogador 1 venceu!' : 'Jogador 2 venceu!';
        winnerTextEl.style.opacity = '1';
        restartBtn.style.opacity = '1';
      }
    }

    function resetPositionsAfterGoal(scoringPlayer) {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      let direction;
      if(scoringPlayer === player1) direction = 1;
      else direction = -1;
      ball.speedX = ballDefaultSpeed * direction;
      ball.speedY = ballDefaultSpeedYTarget;
      player1.x = 100;
      player1.y = canvas.height / 2;
      player2.x = canvas.width - 100;
      player2.y = canvas.height / 2;
    }

    function resetPositionsInitial() {
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      let direction = Math.random() < 0.5 ? -1 : 1;
      ball.speedX = ballDefaultSpeed * direction;
      ball.speedY = ballDefaultSpeedYTarget;
      player1.x = 100;
      player1.y = canvas.height / 2;
      player2.x = canvas.width - 100;
      player2.y = canvas.height / 2;
      ball.trail = [];
    }

    function updateScore() {
      score1El.textContent = player1.score;
      score2El.textContent = player2.score;
    }

    function drawField() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGoals();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 90, 0, Math.PI * 2);
      ctx.stroke();
    }

    function initialPositions() {
      player1.x = 100;
      player1.y = canvas.height / 2;
      player2.x = canvas.width - 100;
      player2.y = canvas.height / 2;
    }

    restartBtn.onclick = () => {
      player1.score = 0;
      player2.score = 0;
      updateScore();

      winnerTextEl.style.opacity = '0';
      restartBtn.style.opacity = '0';
      goalTextEl.style.opacity = '0';

      gameEnded = false;
      goalScored = false;

      resetPositionsInitial();

      player1.up = player1.down = player1.left = player1.right = false;
      player2.up = player2.down = player2.left = player2.right = false;
    };

    initialPositions();
    updateScore();
    resetPositionsInitial();

    function loop() {
      drawField();
      movePlayer(player1);
      movePlayer(player2);
      updateBall();
      drawPlayer(player1);
      drawPlayer(player2);
      drawBall();
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>
