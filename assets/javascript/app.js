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
})


$("#submit-btn").on("click", function (event) {
  event.preventDefault();

  let playersChoice = $("#choice-input").val().trim();
  console.log('player choice', playersChoice)

  // Update Firebase database with player's choice
  database.ref(currentPath + "/player/").update({
    choice: playersChoice
  })
});
