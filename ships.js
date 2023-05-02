
// Our vars that we will use in our game
var canvas; // the canvas
var scoreEl;
var score;
var livesEl;
var lives;
var context; // for drawing on the canvas
var playerImage;
var invaderImage;
var keys;
var shipSpeed = 15;
var projectileSpeed = -8;
var shipRotetion = 0.15; // how much our ship will rotate when moving right/left
var colInvaders;
var rowInvaders;
var invaderWidth;
var invaderHeight;
var startedNewGame;
var currentUser; // the last user who loged in to the system
var logedIn = 0;
var InAGame;
var FlagShoot = true

var gridCounter = 1;

var shooting_Key
var Game_Time

// all the sounds
var hit_bad;
var game_music;
var hit_good;
var shot_sound;


canvas = document.getElementById("theCanvas");
context = canvas.getContext("2d");

scoreEl = document.getElementById("scoreEl");
livesEl = document.getElementById("livesEl")
timeEl = document.getElementById("timeEl")

canvas.width = 1366;
canvas.height = 768;

// specify the keys to move the ship up/down/right/left and shoot projectiles
keys = {
   left: {
      pressed: false
   },
   right: {
      pressed: false
   },
   up: {
      pressed: false
   },
   down: {
      pressed: false
   },
   shoot: {
      pressed: false
   }
}


class User {
   constructor({username, password, firstName, lastName, email, dob}) {
      this.username = username;
      this.password = password;
      this.firstName = firstName;
      this.lastName = lastName;
      this.email = email
      this.dob = dob;
   }
   highScores;
}

class Player {
   constructor() {
      this.velocity = {
         x: 0,
         y: 0
      }

      this.rotation = 0;
      this.opacity = 1;

      // creating our ship Image
      playerImage = new Image();
      playerImage.src = 'hero.png';
      playerImage.onload = () => {
         var shipscale = 0.15;
         this.Image = playerImage;
         this.width = playerImage.width * shipscale;
         this.height = playerImage.height * shipscale;
         this.position = 
         {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height - this.height - 30
         }
      }
   }

   draw() {
      // creating effect of ship rotation
      context.save()
      context.globalAlpha = this.opacity;
      context.translate(
         player.position.x + player.width / 2,
         player.position.y + player.height / 2
      )
      context.rotate(this.rotation)
      context.translate(
         -player.position.x - player.width / 2,
         -player.position.y - player.height / 2
      )
      context.drawImage(this.Image, this.position.x, this.position.y, this.width, this.height)
      context.restore();
   }

   update() {
      if(this.Image){
         this.draw();
         this.position.x += this.velocity.x;
         this.position.y += this.velocity.y;
      }
   }
}

class Projectile {
   constructor({position, velocity}) {
      this.position = position;
      this.velocity = velocity;
      this.radius = 4;
   }

   draw() {
      context.beginPath();
      context.arc(this.position.x, this.position. y, this.radius, 0, Math.PI*2);
      context.fillStyle = 'red';
      context.fill();
      context.closePath
   }

   update() {
      this.draw();
      this.position.x += this.velocity.x
      this.position.y += this.velocity.y
   }
}

class Particle {
   constructor({position, velocity, radius, color, fade}) {
      this.position = position;
      this.velocity = velocity;
      this.radius = radius;
      this.color = color;
      this.fade = fade;
      this.opacity = 1;
   }

   draw() {
      context.save()
      context.globalAlpha = this.opacity;
      context.beginPath();
      context.arc(this.position.x, this.position. y, this.radius, 0, Math.PI*2);
      context.fillStyle = this.color;
      context.fill();
      context.closePath
      context.restore();
   }

   update() {
      this.draw();
      this.position.x += this.velocity.x
      this.position.y += this.velocity.y

      if(this.fade) this.opacity -= 0.01; // make enemy ship & player ship particles fade away after explosion
   }
}

class InvaderProjectile {
   constructor({position, velocity}) {
      this.position = position;
      this.velocity = velocity;

      this.width = 5;
      this.height = 15;
   }

   draw() {
      context.fillStyle = 'yellow';
      context.fillRect(this.position.x, this.position.y, this.width, this.height)
   }

   update() {
      this.draw();
      this.position.x += this.velocity.x
      this.position.y += this.velocity.y
   }
}

class Invader {
   constructor({position, type}) {
     this.velocity = {
       x: 0,
       y: 0
     };
     
     this.Image = null; // Initialize the Image property to null
 
     // Load the image and set it to the Image property when it's done loading
     loadImage(GetInvaderImage(type))
       .then((image) => {
         const invaderscale = GetInvaderScale(type);
         this.Image = image;
         this.invaderScore = GetInvaderScore(type);
         this.width = image.width * invaderscale[0];
         this.height = image.height * invaderscale[1];
         this.position = {
           x: position.x,
           y: position.y
         };
       })
       .catch((error) => {
         console.error(`Failed to load image: ${error}`);
       });
   }
 

   draw(){
      context.drawImage(this.Image, this.position.x, this.position.y, this.width, this.height)
   }

   update({velocity}) {
      if(this.Image){
         this.draw({});
         this.position.x += velocity.x;
         this.position.y += velocity.y;
      }
   }

   shoot(invaderProjectiles) {
      invaderProjectiles.push(new InvaderProjectile({
         position: {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height
         },
         velocity: {
            x: 0,
            y: 5
         }
      }))
   }
}

class Grid {
   constructor() {
     this.position = {
       x: 0,
       y: 200
     }
     
     this.velocity = {
       x: 5,
       y: 0
     }
 
     this.invaders = [];
     const rowInvaders = 4;
     const colInvaders = 5;
     this.width = colInvaders * 30;
     let type = 1;
     for (let x = 0; x < colInvaders; x++) {
       for (let y = 0; y < rowInvaders; y++) {
         if (y > 0 && y % 3 === 0){
            this.invaders.push(new Invader({position: {x: x * 60 - 15, y: y * 60 - 15}, type}));
            type++;
            break;
         }
         this.invaders.push(new Invader({position: {x: x * 60, y: y * 60}, type}));
         type++;
       }
     }
   }
 
   update(){
      if (timeElapsed > 0 && timeElapsed % 5 === 0 && frames % 301 === 0 && gridCounter < 5) {
         this.velocity = {x: this.velocity.x * 1.2, y: this.velocity.y};
         gridCounter++;
      }
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      if(this.position.x + this.width + 120 >= canvas.width || this.position.x <= 0) {
         this.velocity.x = - this.velocity.x
      }
   }
}

//###############################################################################################################


var myScores = []
var player = new Player();
var projectiles = [];
var grids = [];
var invaderProjectiles = []
var particles = []
var backgroundStarsParticles = []
var stars = 1;
var numberOfLives = 3;
var frames = 0;
let invadersShots = 0;
let game = {
   over: false,
   active: true
}
score = 0;
lives = 3;
startedNewGame = true;
var allUsers = []


function animate() {
   if (!game.active) {
      showPage('GameOver');
      return
   }
   if (game.over) {
      GameOver(1,score,timeElapsed);
      return
   }

   requestAnimationFrame(animate)
   context.fillStyle = 'black'; // controlls our background color
   context.fillRect(0, 0, canvas.width, canvas.height);
   
   player.update();
   if(stars) {
      createBackgroundStars();
      stars = 0;
   }

   backgroundStarsParticles.forEach((particle) => {
      if(particle.position.y >= canvas.height) {
         particle.position.x = Math.random() * canvas.width;
         particle.position.y = -particle.radius;
      }
      else {
         particle.update()
      }

   })

   particles.forEach((particle, i) => {
      if(particle.opacity <=0) { // garbage collection for particles that faded away
         setTimeout(() => {
            particles.splice(i, 1)
         }, 0)
      }
      else {
         particle.update()
      }
   })

   invaderProjectiles.forEach((invaderProjectile, index) => {
      if(invaderProjectile.position.y + invaderProjectile.height >= canvas.height) { // garbage collection for invaders projectiles that crossed the screen
         setTimeout(() => {
            invaderProjectiles.splice(index, 1)
         }, 0)
      }
      else {
         invaderProjectile.update()
      }
      if(!game.over && invaderProjectile.position.y + invaderProjectile.height >= player.position.y && // check if enemy prijectile hits our ship
         invaderProjectile.position.y <= player.position.y + player.height &&
         invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
         invaderProjectile.position.x <= player.position.x + player.width) {
            setTimeout(() => {
               invaderProjectiles.splice(index, 1);
            }, 0)
            createParticles({object: player, how_many:50, fade: true, color: 'white'}); // ship explode
            hit_good.play()
            MoveShipToMiddle()
            if (lives > 1) {
               lives = lives - 1;
               livesEl.innerHTML = lives;
            }
            else {
               setTimeout(() => {
                  game.active = false;
               }, 0)
               lives = lives - 1;
               livesEl.innerHTML = lives;
               console.log("You Lost")
               player.opacity = 0;
               game.over = true;
               GameOver(2, score, timeElapsed)
               return;
            }
      }
   })

   projectiles.forEach((projectile, index) => {
      if (projectile.position.y + projectile.radius <= -1) { // garbage collection for ship projectiles that crossed the screen
         setTimeout(() => {
            projectiles.splice(index, 1)
         }, 0)
         
      }
      else {
         projectile.update()
      }
   })

   grids.forEach((grid, gridIndex) => {
      grid.update();

      // create enemy shooting
      if(invadersShots % 100 === 0 && grid.invaders.length > 0) {
         grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
      }

      grid.invaders.forEach((invader, i)=> {
         invader.update({velocity: grid.velocity})

         projectiles.forEach((projectile, j) => {
            if( // check if our projectile hits an invader
               projectile.position.y - projectile.radius <= invader.position.y + invader.height && 
               projectile.position.x + projectile.radius >= invader.position.x &&
               projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
               projectile.position.y + projectile.radius >= invader.position.y
            ) { // and if so => erase that invader from the screen

               setTimeout(() => { // check if the proctile hits the right target and it still exists in the invaders/projectiles array
                  const invaderFound = grid.invaders.find((invader2) => invader2 === invader)
                  const projectileFound = projectiles.find((projectile2) => projectile2 === projectile)
               
                  if(invaderFound && projectileFound) { // actual deletion from arays
                     // if(score + invader.invaderScore > 250){
                     //    score = 250;
                     // }
                     // else {
                     //    score += invader.invaderScore;
                     // }
                     score += invader.invaderScore;
                     scoreEl.innerHTML = score;
                     createParticles({object: invader, how_many:15, fade: true, color: '#BAA0DE'});
                     hit_bad.play()
                     grid.invaders.splice(i, 1);
                     projectiles.splice(j, 1);

                     if (grid.invaders.length > 0) {
                        const firstInvader = grid.invaders[0];
                        const lastInvader = grid.invaders[grid.invaders.length -1]
                        grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                        grid.position.x = firstInvader.position.x;
                     }
                     else {
                        grids.splice(gridIndex, 1)
                        console.log("Champion!");
                        game.over = true;
                     }
                  }
               }, 0)
            }
         })
      })
   })


   if (keys.right.pressed && player.position.x + player.width <= canvas.width){
      player.velocity.x = shipSpeed;
      player.rotation = shipRotetion;
  }

  else if (keys.left.pressed && player.position.x > 0) {
      player.velocity.x = -shipSpeed
      player.rotation = -shipRotetion
  }
  
  else {
      player.velocity.x = 0
      player.rotation = 0
  }
  
  if (keys.up.pressed && player.position.y > (0.6 * canvas.height))
      player.velocity.y = -shipSpeed

  else if (keys.down.pressed && player.position.y <= canvas.height - player.height)
      player.velocity.y = shipSpeed

  else {
      player.velocity.y = 0
      player.rotation = 0
  }

   // create grid of enemies
   if(frames === 0) {
      grids.push(new Grid())
      frames = 0;
   }

   frames++; // finished one loop of animation
   invadersShots++;
}


function GameOver(gameOverType, score, gameTime) {
   resetTimer()
   game_music.pause();

   // Clear the message and score elements
   if(gameOverType===1) {
      document.getElementById('GameOverMessage').innerHTML = 'Champion!'
   }
   else if(gameOverType===2) {
      document.getElementById('GameOverMessage').innerHTML = 'You Lost'
   }
   else if(gameOverType===3 && score < 100) {
      document.getElementById('GameOverMessage').innerHTML = 'you can do better!'
   }
   else if(gameOverType===3 && score >= 100) {
      document.getElementById('GameOverMessage').innerHTML = 'Winner!'
   }
   else if(gameOverType === 4) {
      resetTimer()
      return;
   }

   // Add the user's score to the high scores array
   var now = new Date().toLocaleString();
   myScores.push({
      score: score,
      date: now
   });

   // Sort the high scores array in descending order of score
   myScores.sort(function(a, b) {
      return b.score - a.score;
   });

   // Create a table to display the high scores
   var scoresTable = '<table>';
   scoresTable += '<tr><th>Rank</th><th>Score</th><th>Date</th></tr>';

   for (var i = 0; i < Math.min(10, myScores.length); i++) {
      scoresTable += '<tr>';
      scoresTable += '<td>' + (i+1) + '</td>';
      scoresTable += '<td>' + myScores[i].score + '</td>';
      scoresTable += '<td>' + myScores[i].date + '</td>';
      scoresTable += '</tr>';
   }

   scoresTable += '</table>';

   // Add the high scores table to the scores element
   document.getElementById('scores').innerHTML = scoresTable;

   // Show the Game Over page
   showPage('GameOver');

}



function setUpGame() {
   player = new Player();
   projectiles = [];
   grids = [];
   invaderProjectiles = []
   particles = []
   backgroundStarsParticles = []
   stars = 1;
   numberOfLives = 3;
   frames = 0;
   invadersShots = 0;
   game = {
      over: false,
      active: true
   }
   score = 0;
   lives = 3;
   startedNewGame = true;
   // stopTimer()
   scoreEl.innerHTML = score;
   livesEl.innerHTML = lives;
   InAGame = 0;
   hit_bad = document.getElementById("hit_bad");
   game_music = document.getElementById("game_music");
   hit_good = document.getElementById("hit_good");
   shot_sound = document.getElementById("shot_sound");
   game_music.currentTime = 0
   gridCounter = 1;
}


function newGame(){
      InAGame = 1;
      setUpGame()
      showPage("play_game");
      animate();
      startTimer(Game_Time * 60);
      game_music.play();
}


function PlayAgain() {
   newGame();
   return;
}

// function restartGame(){}


let timeElapsed = 0; // track the elapsed time in seconds
let timerInterval; // the interval ID returned by setInterval()
let timeRemaining = 0; // the remaining time for the current game

function startTimer(time) {
   resetTimer(); // reset the timer before starting a new one
   timeRemaining = time; // set the remaining time for the current game
   const timerEl = document.getElementById("timeEl");
   timerEl.innerHTML = formatTime(timeRemaining); // update timer display with initial time value

   timerInterval = setInterval(() => {
     timeRemaining--;
     timeElapsed++;
     timerEl.innerHTML = formatTime(timeRemaining);
     if (timeRemaining === 0) {
      clearInterval(timerInterval);
      game.active = false;
      GameOver(3, score, timeElapsed)
     }
   }, 1000);
}


function resetTimer() {
  clearInterval(timerInterval); // stop the current timer
  timeElapsed = 0; // reset the elapsed time
  timeRemaining = 0; // reset the remaining time
  const timerEl = document.getElementById("timeEl");
  timerEl.innerHTML = ""; // clear the timer display
}


function formatTime(time) {
   const minutes = Math.floor(time / 60);
   const seconds = time % 60;
   return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}


window.addEventListener('keydown', ({key}) => {
   console.log(key) //TODO: DELETE
   if(game.over) return
   
   switch (key) {
      case 'ArrowLeft':
         keys.left.pressed = true;
         break;
      case 'ArrowRight':
         keys.right.pressed = true;
         break;
      case 'ArrowUp':
         keys.up.pressed = true;
         break;
      case 'ArrowDown':
         keys.down.pressed = true;
         break;
      case shooting_Key:
         keys.shoot.pressed = true;
         if(FlagShoot) {
            projectiles.push(new Projectile({
               position: {
                  x: player.position.x + player.width / 2,
                  y : player.position.y 
               },
               velocity: {
                  x: 0,
                  y: projectileSpeed
               }
            }))
            FlagShoot = false;
         }

         break;
   }
})


window.addEventListener('keyup', ({key}) => {
   switch (key) {
      case 'ArrowLeft':
         keys.left.pressed = false;
         break;
      case 'ArrowRight':
         keys.right.pressed = false;
      case 'ArrowUp':
         keys.up.pressed = false;
         break;
      case 'ArrowDown':
         keys.down.pressed = false;
         break;
      // case ' ':
      case shooting_Key:   
         keys.shoot.pressed = false;
         FlagShoot = true;
         break;
   }
})


function createParticles({object, how_many, fade, color}) {
   for(let i = 0; i < how_many; i++){
      particles.push(new Particle({
         position: {
            x: object.position.x + object.width / 2,
            y: object.position.y + object.height / 2
         },
         velocity: {
            x: (Math.random() -0.5) * 3,
            y: (Math.random() - 0.5) * 3
         },
         radius: Math.random() * 3,
         color: color || '#BAA0DE',
         fade: fade
      }))
   }
}


function createBackgroundStars() {
   for(let i = 0; i < 100; i++){
      backgroundStarsParticles.push(new Particle({
         position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
         },
         velocity: {
            x: 0,
            y: 1
         },
         radius: Math.random() * 3,
         color: 'white',
         fade: false
      }))
   }
}


function showPage(pageId) {
   if(pageId==='play_game' && logedIn===0) {
      alert("You must log in to the system in order to play");
      return;
   }
   // if(pageId !=='play_game') {
   //    GameOver(4, 2, 2)
   // }
   document.getElementById('signupPage').style.display = 'none';
   document.getElementById('loginPage').style.display = 'none';
   document.getElementById('play_game').style.display = 'none';
   document.getElementById('homePage').style.display = 'none';
   document.getElementById('GameOver').style.display = 'none';
   document.getElementById('configurationPage').style.display = 'none';

   document.getElementById(pageId).style.display = 'block';
}

function signUp() {
   // Get the form inputs
   const usernameInput = document.getElementById("username");
   const passwordInput = document.getElementById("password");
   const confirmPasswordInput = document.getElementById("confirm-password");
   const firstNameInput = document.getElementById("first-name");
   const lastNameInput = document.getElementById("last-name");
   const emailInput = document.getElementById("Email");
   const dobInput = document.getElementById("dob");

   // Get the error message elements
   const error = document.getElementById("input-error");

   // Define regex patterns for validation
   const letterPattern = /[a-zA-Z]/;
   const numberPattern = /[0-9]/;
   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   const emailPattern1 =  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

   // Check that all fields are filled
   if (
      !usernameInput.value ||
      !passwordInput.value ||
      !confirmPasswordInput.value ||
      !firstNameInput.value ||
      !lastNameInput.value ||
      !emailInput.value ||
      !dobInput.value
   ) {
      alert("Please fill out all fields.");
      return;
   }

   // Check that first name and last name don't contain numbers
   if (letterPattern.test(firstNameInput.value) === false) {
      error.innerText = "First name can't contain letters.";
      return;
   }

   if (letterPattern.test(lastNameInput.value) === false) {
      error.innerText = "Last name can't contain letters.";
      return;
   }

   // Check that email format is correct
   if (emailPattern1.test(emailInput.value) === false) {
      error.innerText = "Invalid email address.";
      return;
   }

   // Check that password and confirmed password are the same
   if (passwordInput.value !== confirmPasswordInput.value) {
      error.innerText = "Passwords do not match.";
      return;
   }

   // Check that password contains at least 8 characters including at least 1 letter and 1 number
   if (
      passwordInput.value.length < 8 ||
      letterPattern.test(passwordInput.value) === false ||
      numberPattern.test(passwordInput.value) === false
   ) {
      error.innerText = "Password must contain at least 8 characters including at least 1 letter and 1 number.";
      return;
   }

   const new_user = new User({
      username: usernameInput.value,
      password: passwordInput.value,
      firstName: firstNameInput.value,
      lastName: lastNameInput.value,
      email: emailInput.value,
      dob: dobInput.value,
    });

   allUsers.push( new_user )
 
   // Clear the input fields
   document.getElementById("username").value = "";
   document.getElementById("password").value = "";
   document.getElementById("confirm-password").value = "";
   document.getElementById("first-name").value = "";
   document.getElementById("last-name").value = "";
   document.getElementById("Email").value = "";
   document.getElementById("dob").value = "";
   error.innerText = "";

   alert("User created successfully!");

}


function logIn() {
   const username = document.getElementById("log_in_username").value;
   const password = document.getElementById("log_in_password").value;

   if(username === 'p' && password === 'testuser') {
      logedIn = 1;
      document.getElementById("log_in_username").value = "";
      document.getElementById("log_in_password").value = "";
      if(currentUser !== 1) myScores = [];
      currentUser = 1
      showPage('configurationPage');
      return;
   }

   const user = allUsers.find((user) => user.username === username && user.password === password);
   
   if (user) {
      logedIn = 1;
      if (currentUser !== user) myScores = [];
      currentUser = user;
      document.getElementById("log_in_username").value = "";
      document.getElementById("log_in_password").value = "";
      showPage('configurationPage');
      return;
   }
   
   alert("Invalid username or password");
}


//##############################################################################################################

// Event listener for changing shooting key
document.getElementById('shoot_key').addEventListener('keydown', (event) => {
   event.preventDefault(); // prevent the default behavior of the input field
   shootingKey = event.key; // set the shooting key to the key pressed
   if(shootingKey === ' '){
      document.getElementById('shoot_key').value = 'Space'
      return;
   }
   document.getElementById('shoot_key').value = shootingKey; // update the input field with the new value
});

function saveConfiguration() {
   // Get the error message elements
   const error = document.getElementById("configuration_input_error");
   shooting_Key = document.getElementById('shoot_key').value
   if (shooting_Key === 'ArrowUp' || shooting_Key === 'ArrowLeft' || shooting_Key === 'ArrowDown' || shooting_Key === 'ArrowRight') {
      error.innerText = "Can't use keyboard arrows to shoot";
      return;
   }
   if(shooting_Key === 'Space') shooting_Key = ' '
   Game_Time = document.getElementById('game_duration').value
   if (Game_Time < 2) {
      error.innerText = "Game duration can't be less than 2 minutes";
      return;
   }
   newGame();
}


function GetInvaderImage(type) {
   if (type === 1 || type === 5 || type ===  9 || type === 13 || type === 17) {
      return 'invader.png'
   }
   else if (type === 2 || type === 6 || type ===  10 || type === 14 || type === 18) {
      return 'red.png'
   }
   else if (type === 3 || type === 7 || type ===  11 || type === 15 || type === 19) {
      return 'green.png'
   }
   else if (type === 4 || type === 8 || type ===  12 || type === 16 || type === 20){
      return 'yellow.png'
   }
}

function GetInvaderScore(type) {
   if (type === 1 || type === 5 || type ===  9 || type === 13 || type === 17) {
      return 20;
   }
   else if (type === 2 || type === 6 || type ===  10 || type === 14 || type === 18) {
      return 10;
   }
   else if (type === 3 || type === 7 || type ===  11 || type === 15 || type === 19) {
      return 15;
   }
   else if (type === 4 || type === 8 || type ===  12 || type === 16 || type === 20) {
      return 5;
   }
}

function GetInvaderScale(type) {
   if (type === 1 || type === 5 || type ===  9 || type === 13 || type === 17) {
      return [1.5, 1.5];
   }
   else if (type === 2 || type === 6 || type ===  10 || type === 14 || type === 18) {
      return [0.088,0.088];
   }
   else if (type === 3 || type === 7 || type ===  11 || type === 15 || type === 19) {
      return [0.059,0.059];
   }
   else if (type === 4 || type === 8 || type ===  12 || type === 16 || type === 20) {
      return [0.015, 0.015];
   }
}

function loadImage(src) {
   return new Promise((resolve, reject) => {
     const image = new Image();
     image.onload = () => {
       resolve(image);
     };
     image.onerror = (error) => {
       reject(error);
     };
     image.src = src;
   });
 }

 function MoveShipToMiddle() {
   player.position = {
      x: canvas.width / 2 - player.width / 2,
      y: canvas.height - player.height - 30
   };
}


   const openModalButtons = document.querySelectorAll('[data-modal-target]')
   const closeModalButtons = document.querySelectorAll('[data-close-button]')
   const overlay = document.getElementById('overlay')

   openModalButtons.forEach(button => {
      button.addEventListener('click', () => {
         const modal = document.querySelector(button.dataset.modalTarget)
         openModal(modal)
      })
   })

   overlay.addEventListener('click', () => {
      const modals = document.querySelectorAll('.modal.active')
      modals.forEach(modal => {
         closeModal(modal);
      })
   })

   document.addEventListener('keydown', event => {
      const modals = document.querySelectorAll('.modal.active')
      if (event.key === 'Escape') {
        modals.forEach(modal => {
          closeModal(modal);
        })
      }
    })

   closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
         const modal = button.closest('.modal')
         closeModal(modal)
      })
   })


   function openModal(modal) {
      if (modal == null) return;
      modal.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = "hidden"; // disable scrolling
      overlay.addEventListener('click', overlayClickHandler); // add click event handler
    }
    
    function closeModal(modal) {
      if (modal == null) return;
      modal.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = ""; // enable scrolling
      overlay.removeEventListener('click', overlayClickHandler); // remove click event handler
    }
    
    function overlayClickHandler(event) {
      event.stopPropagation(); // prevent click events from reaching underlying elements
      const modals = document.querySelectorAll('.modal.active');
      modals.forEach(modal => {
        closeModal(modal);
      });
    }
    

