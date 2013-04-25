window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (cb) { window.setTimeout(cb, 1000 / 60); };

var inp = require('./input');

var particles = [];

var gameState
  , currentLevel
  , ctx
  , countdown
  , gameOverTimer = 2000
  , winnerTimer   = 2000
  , gameTime
  , boulders = []
  , player = {
    img: new Image(),
    width: 423 / 8,
    height: 195 / 8
  };

player.img.src = '/img/Car.png';

var FRICTION     = .2
  , MAX_SPEED    = 7
  , TURN_SPEED   = 6
  , ACCELERATION = .7
  , BRAKE_SPEED  = .5;

var COUNTDOWN = 0
  , PLAYING   = 1
  , GAMEOVER  = 2
  , PAUSED    = 3
  , WINNER    = 4
  ;

var WIDTH  = 900
  , HEIGHT = 500;

var CONFIG = ['',
  { boulders: 2, time: 20, clocks: 10 },
  { boulders: 3, time: 30, clocks: 15 },
  { boulders: 4, time: 40, clocks: 20 }
];

(function prepCanvas() {
  // grab the canvas
  var canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');

  // set the game state
  gameState = PAUSED;

  // start the game loop
  gameLoop();
}());

function start() {
  resetCountDown()
  currentLevel = 1;
  prepGame(currentLevel);
}

function resetCountDown() {
  gameState = COUNTDOWN;
  countdown = { state: 3, time: 1000 }
}

function prepGame(level) {
  // change the top number
  $('.levelNum').text(level);

  // put the clocks in
  $('.timers').html('');
  for (var i = 0; i < CONFIG[level].clocks; ++i)
    $('.timers').append('<img src="/img/Clock.png">')

  // reset player
  player.x = 450;
  player.y = 250;
  player.speed = 0;
  player.rot = 0;

  // reset the boulders
  boulders.length = 0;
  for (var i = 0;  i < CONFIG[level].boulders; ++i)
    boulders.push(createBoulder());
  // set up the time
  gameTime = 2000;
}

function createBoulder(x, y) {
  var newBoulder = {
    img: new Image(),
    width: 318 / 2,
    height: 347 / 2,
    padx: 20,
    pady: 20,
    padw: -20,
    padh: -20,
    rot: 0
  };

  var doesCollide = true;
  while (doesCollide) {
    getNewPos(newBoulder);
    doesCollide = false;
    for (var i = 0; i < boulders.length && !doesCollide; ++i) {
      if (collides(boulders[i], newBoulder)) {
        doesCollide = true;
      }
    }
  }

  resetDeltas(newBoulder);
  newBoulder.img.src = '/img/Boulder.png';
  return newBoulder;
}

function resetDeltas(boulder) {
  boulder.dx = (Math.random() - .5) * .5;
  boulder.dy = (Math.random() - .5) * .5;
  boulder.dr = (Math.random() - .5) * .5;
}

function getNewPos(boulder) {
  var rand = Math.floor(Math.random() * 4);
  boulder.x = Math.floor(Math.random() * (WIDTH - boulder.width));
  boulder.y = Math.floor(Math.random() * (HEIGHT - boulder.height));

  if (rand === 0) {
    boulder.x = 0;
  } else if (rand === 1) {
    boulder.y = 0;
  } else if (rand === 2) {
    boulder.x = WIDTH - boulder.width;
  } else {
    boulder.y = HEIGHT - boulder.height;
  }
}

function collides(obj1, obj2) {
  var pad1 = obj1.padx || 0;
  var pad2 = obj1.pady || 0;
  var pad3 = obj1.padw || 0;
  var pad4 = obj1.padh || 0;

  var paad1 = obj2.padx || 0;
  var paad2 = obj2.pady || 0;
  var paad3 = obj2.padw || 0;
  var paad4 = obj2.padh || 0;

  if (obj1.x + pad1 < obj2.x + obj2.width + paad3) {
    if (obj1.x + obj1.width + pad3 > obj2.x + paad1) {
      if (obj1.y + pad2 < obj2.y + obj2.height + paad4) {
        if (obj1.y + obj1.height + pad4 > obj2.y + paad2) {
          return true;
        }
      }
    }
  }

  return false;
}

var curTime = Date.now();
function gameLoop() {
  requestAnimationFrame(gameLoop);
  var time = Date.now()
    , dTime = time - curTime;
  update(dTime);
  render();
  curTime = time;
}

function render() {
  if (gameState === PAUSED) return;

  // fill in the background
  ctx.fillStyle = 'rgb(13, 149, 247)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // paint the boulders
  for (var i = 0; i < boulders.length; ++i) {
    ctx.translate(boulders[i].x + boulders[i].width / 2, boulders[i].y + boulders[i].height / 2);
    ctx.rotate(boulders[i].rot * Math.PI / 180);
    ctx.drawImage(boulders[i].img, 0, 0, 318, 347, -boulders[i].width / 2, -boulders[i].height / 2, boulders[i].width, boulders[i].height);
    ctx.rotate(-boulders[i].rot * Math.PI / 180);
    ctx.translate(-boulders[i].x - boulders[i].width / 2, -boulders[i].y - boulders[i].height / 2);
  }

  // paint the car
  if (gameState !== GAMEOVER) {
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.rot * Math.PI / 180);
    ctx.drawImage(player.img, 0, 0, 423, 195, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.rotate(-player.rot * Math.PI / 180);
    ctx.translate(-player.x - player.width / 2, -player.y - player.height / 2);
  }

  // paint any particle effects
  for (var i = 0; i < particles.length; ++i) {
    var p = particles[i];
    ctx.drawImage(p.img, 0, 0, p.ow, p.oh, p.x, p.y, p.w, p.h);
  }

  if (gameState === COUNTDOWN) {
    // paint the countdown
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 36px Verdana';
    ctx.fillText(countdown.state || 'GO', 450, 250);
  }

  if (gameState === GAMEOVER) {
    // paint game over screen
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 36px Verdana';
    ctx.fillText('Game Over', 350, 250);
  }

  if (gameState === WINNER) {
    // paint game over screen
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 36px Verdana';
    ctx.fillText('You Win!!', 350, 250);
  }
}

function generateParticles(x, y) {
  // create explosion
  for (var i = 0; i < 80; ++i)
    particles.push(createParticle(x, y, '/img/Smoke.png', true));
  for (var i = 0; i < 160; ++i)
    particles.push(createParticle(x, y, '/img/Fire.png'));

  // create ring
  for (var i = 0; i < 160; ++i) {
    var newPart = createParticle(x, y, '/img/Fire.png');
    newPart.ds = 5;
    particles.push(newPart);
  }

  // create line
  var lineDeg = Math.random() * 360;
  for (var i = 0; i < 80; ++i) {
    var newPart = createParticle(x, y, '/img/Fire.png');
    newPart.ds = Math.random() * 10;
    newPart.dr = lineDeg;
    if (i % 2) newPart.dr += 180;
    particles.push(newPart);
  }
}

function createParticle(x, y, img, isSmoke) {
  var newPart = {
    img: new Image(),
    x: x,
    y: y,
    dr: Math.random() * 360,
    ds: Math.random() * 2,
    life: 800 + Math.random() * 400,
    w: 20,
    h: 20,
    ow: 256,
    oh: 256
  };
  newPart.img.src = img;
  if (isSmoke) {
    newPart.ow = 83;
    newPart.oh = 75;
  }
  return newPart;
}

function update(dTime) {
  if (gameState === PAUSED) return;

  if (gameState === COUNTDOWN) {
    countdown.time -= dTime;
    if (countdown.time <= 0) {
      --countdown.state;
      countdown.time = 1000;
      if (countdown.state < 0)
        gameState = PLAYING;
    }
    return;
  }

  if (gameState === WINNER) {
    winnerTimer -= dTime;

    if (winnerTimer <= 0) {
      winnerTimer = 2000;
      gameState = PAUSED;
      $('.game').hide();
      $('.menus').show();
    }
    return;
  }

  if (gameState === GAMEOVER) {
    gameOverTimer -= dTime;

    if (gameOverTimer <= 0) {
      gameOverTimer = 2000;
      gameState = PAUSED;
      $('.game').hide();
      $('.menus').show();
      return;
    }
  }

  // update the boulders position
  for (var i = 0; i < boulders.length; ++i) {
    var oldx = boulders[i].x;
    var oldy = boulders[i].y;

    boulders[i].x += boulders[i].dx * dTime;
    boulders[i].y += boulders[i].dy * dTime;
    boulders[i].rot += boulders[i].dr * dTime;

    if (boulders[i].x < 0) {
      boulders[i].x = 0;
      resetDeltas(boulders[i]);
    }

    if (boulders[i].y < 0) {
      boulders[i].y = 0;
      resetDeltas(boulders[i]);
    }

    if (boulders[i].x > WIDTH - boulders[i].width) {
      boulders[i].x = WIDTH - boulders[i].width;
      resetDeltas(boulders[i]);
    }

    if (boulders[i].y > HEIGHT - boulders[i].height) {
      boulders[i].y = HEIGHT - boulders[i].height;
      resetDeltas(boulders[i]);
    }

    for (var j = 0; j < boulders.length; ++j) {
      if (i === j) continue;

      if (collides(boulders[i], boulders[j])) {
        boulders[i].x = oldx;
        boulders[i].y = oldy;
        resetDeltas(boulders[i]);
        resetDeltas(boulders[j]);
      }
    }
  }

  // update any particles
  for (var i = 0; i < particles.length; ++i) {
    var p = particles[i];
    p.life -= dTime;
    if (p.life <= 0) {
      particles.splice(i, 1);
      --i;
      continue;
    }

    p.x += Math.cos(p.dr * Math.PI / 180) * p.ds;
    p.y += Math.sin(p.dr * Math.PI / 180) * p.ds;
  }


  // update the player and game time
  if (gameState !== GAMEOVER) {
    // update the players rotation and acceleration
    player.speed -= FRICTION;
    if (inp.left()) { player.rot -= TURN_SPEED; }
    if (inp.right()) { player.rot += TURN_SPEED; }
    if (inp.up()) { player.speed += ACCELERATION; }
    if (inp.down()) { player.speed -= BRAKE_SPEED; }
    if (player.speed < 0) player.speed = 0;
    if (player.speed > MAX_SPEED) player.speed = MAX_SPEED;

    // update the players position
    player.x += player.speed * -Math.cos(player.rot * Math.PI / 180);
    player.y += player.speed * -Math.sin(player.rot * Math.PI / 180);

    if (player.x <= 0) player.x = 0;
    if (player.y <= 0) player.y = 0;
    if (player.x >= WIDTH - player.width) player.x = WIDTH - player.width;
    if (player.y >= HEIGHT - player.height) player.y = HEIGHT - player.height;

    // check for collisions
    for (var i = 0; i < boulders.length; ++i) {
      if (collides(player, boulders[i])) {
        player.speed = 0;
        gameState = GAMEOVER;
        generateParticles(player.x, player.y);
      }
    }

    gameTime -= dTime;
    if (gameTime <= 0) {
      $($('.timers').find('img')[0]).remove();
      gameTime = 2000;
      if ($('.timers').find('img').length === 0) {
        ++currentLevel;
        if (currentLevel > 3) {
          gameState = WINNER;
        } else {
          prepGame(currentLevel);
          resetCountDown();
        }
      }
    }
  }
}

exports.start = start;
