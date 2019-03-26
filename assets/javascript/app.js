// Initialize Firebase
var config = {
  apiKey: "AIzaSyAYhkQjyM34uUO-T-NoBkKwxoh6QKvOV6w",
  authDomain: "rps-online-game.firebaseapp.com",
  databaseURL: "https://rps-online-game.firebaseio.com",
  projectId: "rps-online-game",
  storageBucket: "rps-online-game.appspot.com",
  messagingSenderId: "462775286328"
};
firebase.initializeApp(config);

// Global variables 
let gameObj = {};
let playersKeyArray = [];
let currentPath;
let tempKey;
let playerOneWins = 0;
let playerTwoWins = 0;
let ties = 0;

// Inital setup
$("#game-message").text("Game is Ready")


// Firebase database reference
let database = firebase.database();

// Directory to store/track Player1 and Player2 connections
let playerConnectionsRef = database.ref("/playerConnections/");

// Check player connection ".info/connected"
let connectedRef = database.ref(".info/connected");

// Player connection state changes
connectedRef.on("value", function (snapshot) {
  // If player is connected
  if (snapshot.val()) {
    // Add player to connected list
    let con = playerConnectionsRef.push(true);
    // Remove player from connection when they disconnect
    con.onDisconnect().remove();
    // Get current Firebase database path
    currentPath = String(con.path)
    console.log('currentPath', currentPath)
    // show player connection
    $("#player-connection").text(con.path)
  }
});

// On first load or change to connections list
playerConnectionsRef.on("value", function (snapshot) {
  // Get the number of players/children in the connections list and display on app
  $("#connection-watch").text(`Number of players: ${snapshot.numChildren()}`)
  console.log('snapshot value', snapshot.val());

  snapshot.forEach((childSnapshot) => {
    console.log(childSnapshot.key)
    tempKey = childSnapshot.key
    if (!playersKeyArray.includes(childSnapshot.key)) {
      playersKeyArray.unshift(childSnapshot.key)
    }
  });
});

$("#submit-btn").on("click", function (event) {
  event.preventDefault();

  let playersChoice = $("#choice-input").val().trim().toLowerCase();

  // Validate playerChoice 
  console.log(typeof playersChoice)

  console.log(playersChoice)
  if (playersChoice !== "rock" && playersChoice !== "paper" && playersChoice !== "scissors") {
    $("#game-message").text("Your enter an invalid name.  Please enter selection again.")
    $("#choice-input").val(" ")
  } else {
    $("#game-message").text("")
    console.log('player choice', playersChoice)
    // Get player's key value
    console.log('player key', tempKey)

    // Update Firebase database with player's choice
    database.ref(currentPath + "/player/").update({
      choice: playersChoice
    });
    // Set values
    $("#choice-input").val(" ")
    // Hide submit button;
    $("#submit-btn").hide()
  }
});

// Get players choices from Firebase database
database.ref().on("child_changed", function (snapshot) {
  snapshot.forEach((childSnapshot) => {
    console.log('childSnaphot players choice', childSnapshot.val());
    // Update game object
    let objKey = childSnapshot.key
    let objPlayerChoice = childSnapshot.val().player.choice
    Object.assign(gameObj, { [objKey]: [objPlayerChoice] })
  });
  console.log('Game Object', gameObj)

  // **Game Logic**
  // Get player's key id
  let playerOneKey = Object.keys(gameObj)[0];
  let playerTwoKey = Object.keys(gameObj)[1];

  // Get player's choice
  let playerOneChoice = gameObj[playerOneKey].toString();
  let playerTwoChoice = gameObj[playerTwoKey].toString();

  console.log('player one', playerOneKey, playerOneChoice)
  console.log('player two', playerTwoKey, playerTwoChoice)

  if (
    (playerOneChoice === "rock" && playerTwoChoice === "scissors") ||
    (playerOneChoice === "scissors" && playerTwoChoice === "paper") ||
    (playerOneChoice === "paper" && playerTwoChoice === "rock")
  ) {
    console.log(`${playerOneKey} ${playerOneChoice} wins`)
    playerOneWins++
    // Update scoreboard
    $("#player-one-wins").text(`Player One wins: ${playerOneWins}`)
    $("#game-message").text(`${playerOneChoice} wins`)
    // show submit button;
    $("#submit-btn").show()
  } else if (playerOneChoice === playerTwoChoice) {
    console.log("tie")
    ties++
    // Update scoreboard
    $("#ties").text(`Ties: ${ties}`)
    $("#game-message").text(`Both players selected ${playerTwoChoice}`)
    // show submit button;
    $("#submit-btn").show()
  } else {
    console.log(`${playerTwoKey} ${playerTwoChoice} wins`)
    playerTwoWins++
    // Update scoreboard
    $("#player-two-wins").text(`Player Two wins: ${playerTwoWins}`)
    $("#game-message").text(`${playerTwoChoice} wins`)
    // show submit button;
    $("#submit-btn").show()
  };

  console.log('Scoreboard:', playerOneWins, playerTwoWins, ties)

  // Remove player choice from Firebase database
  console.log('update current path', `${currentPath}/player/choice`)
  // let location = database.ref(currentPath + '/player')
  // location.child('choice').update({ child: null })
  //   .then(function () {
  //     console.log('successful')
  //   })


  playerOneChoice = null;
  playerTwoChoice = null;
  // gameObj = {};
  console.log('game object', gameObj)




});


