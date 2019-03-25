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
let i = 1;
let playersKeyArray = [];
let playerKey1;
let playerKey2;
let currentPath;
let tempKey;
let gameObj = {};
let count = 0;
let winsOne = 0
let winsTwo = 0;
let ties = 0;

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
  $("#connection-watch").text(`No. of connections ${snapshot.numChildren()}`)
  console.log('snapshot value', snapshot.val());
  console.log('snapshot key', snapshot.key);

  snapshot.forEach((childSnapshot) => {
    console.log(childSnapshot.key)
    tempKey = childSnapshot.key
    if (!playersKeyArray.includes(childSnapshot.key)) {
      playersKeyArray.unshift(childSnapshot.key)
    }

  })
})


$("#submit-btn").on("click", function (event) {
  event.preventDefault();


  let playersChoice = $("#choice-input").val().trim();
  console.log('player choice', playersChoice)
  // Get key value
  console.log('temp key', tempKey)

  // Update Firebase database with player's choice
  database.ref(currentPath + "/player/").update({
    choice: playersChoice,
    wins: 0
  });
  $("#submit-btn").addClass("disabled")
  $("#submit-btn").hide()
  $("#choice-input").val("")
  $("#player-message").text(`You selected ${playersChoice}`)

});

// Check players choices
database.ref().on("child_changed", function (snapshot) {
  snapshot.forEach((childSnapshot) => {
    console.log('key', childSnapshot.key)

    // Store in object to apply game logic
    let objKey = childSnapshot.key
    let objValueChoice = childSnapshot.val().player.choice
    let objValueWins = childSnapshot.val().player.wins
    // Add player's choice and wins to game object
    Object.assign(gameObj, { [objKey]: [objValueChoice, objValueWins] })
    console.log("object", gameObj)

  });
  // Add game logic
  // Get players' response 
  let firstResponseKey = gameObj[Object.keys(gameObj)[0]];
  let secondResponseKey = gameObj[Object.keys(gameObj)[1]];

  let firstResponse = gameObj[Object.keys(gameObj)[0]][0];
  let secondResponse = gameObj[Object.keys(gameObj)[1]][0];

  let firstResponseWins = gameObj[Object.keys(gameObj)[0]][1];
  let secondResponseWins = gameObj[Object.keys(gameObj)[1]][1];
  // Update global variable wins count
  winsOne = firstResponseWins
  winsTwo = secondResponseWins

  let firstKey = Object.keys(gameObj).find(key => gameObj[key] === firstResponseKey);
  let secondKey = Object.keys(gameObj).find(key => gameObj[key] === secondResponseKey);

  console.log('player response', firstResponse, secondResponse)
  console.log('player response', firstKey, secondKey)

  if (
    (firstResponse === "rock" && secondResponse === "scissors") ||
    (firstResponse === "scissors" && secondResponse === "paper") ||
    (firstResponse === "paper" && secondResponse === "rock")
  ) {
    console.log(`${firstResponse} wins`)
    winsOne++
    // Update wins count in Firebase database;
    console.log('update One wins: ', winsOne)
    // database.ref('/playerConnections/' + firstKey + '/player/').update({
    //   wins: winsOne
    // });

  } else if (firstResponse === secondResponse) {
    console.log("tie")
    ties++
  } else {
    console.log(`${secondResponse} wins`)
    winsTwo++
    // Update wins count in Firebase database;
    console.log('update Two wins: ', winsTwo)
    // database.ref('/playerConnections/' + secondKey + '/player/').update({
    //   wins: winsTwo
    // });

  }
  // Update wins count and clear prior player choice
  console.log('update count', winsOne, winsTwo)
  database.ref('/playerConnections/' + firstKey + '/player/').set({
    choice: '',
    wins: winsOne
  });

  database.ref('/playerConnections/' + secondKey + '/player/').set({
    choice: '',
    wins: winsTwo
  });

})
