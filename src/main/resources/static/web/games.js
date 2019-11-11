//THIS IS GAMES, THE JSON STUFF, NOT GAME
//Well now its leadership stuff but still not the player fields plz


$(function() {

//globally defining the variable for if someone is logged in or not
let theCurrentUser = ""

// ****************** function definitions *********************** //

        // displays the entire ajax return. probably better in console.log(), easier to read
//        function showHelper(text) {
//                    $("#helper").text(text)
//                }

    //evaluates the scores, number of games played, and number of wins, loses, and ties per player and fills
    //in the leader board. Uses data from players class from ajax
    function fillInLeaderBoard(array) {
        let tableGuts = ""
        array.forEach((element) => {
            let username = element.username;
            let scoreTotal = 0.0
            element.gamePlayer.forEach((gp) => {
                if (gp.score) {
                    scoreTotal += gp.score.score
                }
            })
            let wins = 0;
            let ties = 0;
            let losses = 0;
            if (element.gamePlayer.score) {
                element.gamePlayer.forEach((gp) => {
                    if (gp.score.score==1.0){
                        wins += 1;
                    } else if (gp.score.score==0.5){
                        ties += 1;
                    } else {
                        losses += 1;
                    }
                })
            }

            let gameQuantity = element.gamePlayer.length

            tableGuts += `<tr><td>${username}</td><td>${scoreTotal}</td><td>${wins}</td><td>${ties}</td><td>${losses}</td><td>${gameQuantity}</td></tr>`
        })

        $("#leadershipBoardGuts").html(tableGuts);
    }

    //evaluates the scores, number of games played, and number of wins, loses, and ties per player and fills
    //in the leader board. Uses data from players class from ajax
    function fillInGamesBoard(array) {
        let tableGuts = ""
        array.forEach((game) => {
            let gameNumber = game.id
            let date = game.date
            let players = ""
            let status = ""
            game.gamePlayer.forEach((gp) => {
                players += gp.player.username
                players += "<br>"
            })

            //TO DO: this should say 'need another player to start!' or 'game ongoing' (better way to say those 2 that sounds cool)
            //      add some conditionals for the players
            if (game.gamePlayer[0].score == null) {
                status = "TBD"
            } else {
                if(game.gamePlayer[0].score.score == 0.5) {
                    status = "Tie!"
                } else if (game.gamePlayer[0].score.score == 1.0) {
                    status = game.gamePlayer[0].player.username + " won!"
                } else {
                    status = game.gamePlayer[1].player.username + " won!"
                }
            }

            let gameURL = window.location.href.replace(window.location.pathname, "/web/game.html?gp="+gameNumber)

            let currentPlayer = game.currentPlayer.username
            if (players.includes(currentPlayer)) {
                tableGuts += `<tr><td>${gameNumber}</td><td>${date}</td><td>${players}</td><td>${status}</td><td><button class="btn btn-dark"><a href=${gameURL}> Go to game! </a></button></td></tr>`
            } else {
                if (game.gamePlayer[1]) {
                    tableGuts += `<tr><td>${gameNumber}</td><td>${date}</td><td>${players}</td><td>${status}</td><td></td></tr>`
                } else if (currentPlayer != "null") {
                    tableGuts += `<tr><td>${gameNumber}</td><td>${date}</td><td>${players}</td><td>${status}</td><td><button data-game=${gameNumber} class="btn btn-dark join-game-btn"> Join Game </button> </td></tr>`
                } else {
                    tableGuts += `<tr><td>${gameNumber}</td><td>${date}</td><td>${players}</td><td>${status}</td><td></td></tr>`
                }

            }
        })
        $("#gamesBoardGuts").html(tableGuts);
    }

    //testing if there exists an authenticated user so that we can show the proper login/logout forms
    function isAuthenticated() {
        $.get("/api/games")
        .done(function(data) {
        if (data[0].currentPlayer.username == "null") {
            console.log("no one is logged in right now")
            $("#logout-form").hide()
            $("#login-form").show()
            $("#register-form").show()
            loadGameData()
            theCurrentUser = null
        } else {
            console.log(data[0].currentPlayer.username + " is logged in")
            $("#logout-form").show()
            $("#login-form").hide()
            $("#register-form").hide()
            loadGameData()
            theCurrentUser = data[0].currentPlayer.username;
        }
        })
        .fail(function() {console.log("failure")})
    }

    //get data for leaderboard
    function loadLeaderData() {
        $.get("/api/players")
        .done(function(data) {
            data.forEach((player) => {
            })
        //looping through data to fill the table
        fillInLeaderBoard(data)
        })
    }

    //get data for games
    function loadGameData() {
        $.get("/api/games")
        .done(function(data) {
        //disabled unless debugging
//            data.forEach((game) => {
//                console.log(game)
//            })
        //looping through the data to fill the table
        fillInGamesBoard(data)
        })
    }

    // logging in and logging out
    function login(evt) {
        evt.preventDefault();
        var form = evt.target

        //checking that the username and password match and you are logged in
        $.post("/app/login",
            { username: form["elements"][0].value,
            password: form["elements"][1].value })
        .done(function() {
            console.log("success")
            alert("Logged in!")
            isAuthenticated()})
        .fail(function() {
            console.log("Failure")
            alert("Failed to log in. Please ensure your username and password are correct. If you are new, please use the registration form to register as a new user.")});
    }
    //Logging out
    function logout(evt) {
        evt.preventDefault();
        $.post("/app/logout")
        .done(isAuthenticated())
        .fail();
        console.log("user logged out")
    }

    //registering
    function register(evt) {
        console.log("registering")
        evt.preventDefault();
        var form = evt.target

        if(form["elements"][1].value.length < 8) {
            alert("You were not registered correctly. Please ensure you've met the guidelines below, or that you don't already have an account.")
        } else {
            $.post("/app/players",
                { username: form["elements"][0].value,
                password: form["elements"][1].value })
            .done(function() {
                console.log("success")
                alert("User successfully registered! Please log in.")})
            .fail(function(xhr, status, error) {
                console.log("failure")
                alert("You were not registered correctly. Please ensure you've met the guidelines below, or that you don't already have an account.")});
            }
    }

    function createNewGame(player) {
        console.log(player)
        $.post("/api/games",
                    { creator: player})
                .done(function(data) {
                    console.log("Success")
                    alert("Game was created!")
                    newURL = window.location.href.replace(window.location.pathname, "/web/game.html?gp=" + data)
                    $(window).attr('location', newURL)
                })
                .fail(function() {
                    console.log("Failure")
                    alert("Failed to create game. Please ensure you are logged in and try again.")});
    }

    //function to add a player to an open game
    function joinGame(evt, player) {
        gameNum = evt.target.getAttribute('data-game')
        evt.preventDefault();
        $.post("/api/gameplayers",
            {game_id: gameNum,
            username: player})
        .done(function(data) {
            console.log(data)
            console.log("success")
        })
        .fail(function() {
            console.log("failure")
        });
    }


    //Wrapper Functions for functions being called by an event

    //wrapper function for registering
    function wrapperFunctionReg() {
        register(event)
    }

    //wrapper functions for log in and log out
    function wrapperFunctionIn() {
        login(event)
    }

    function wrapperFunctionOut() {
        logout(event)
    }

    function wrapperFunctionNewGame() {
        console.log(theCurrentUser)
        if (theCurrentUser != null) {
            createNewGame(theCurrentUser);
        } else {
            alert("Please log in to create a game. If you are new, please register first.")
        }
    }

    function wrapperFunctionJoinGame() {
        if (theCurrentUser != null) {
            joinGame(event, theCurrentUser);
        } else {
            alert("Please log in to create a game. If you are new, please register first.")
        }
    }


// ****************** function calls and Ajax call *********************** //

    //is there an authenticated user on load?
    isAuthenticated()

    //creating the leader board on load
    loadLeaderData();
    loadGameData();

    //listener for login form submission to trigger log in
    $('#login-form').submit(wrapperFunctionIn)
    $('#login-form').submit(() => {
          $('#login-form').trigger("reset")})

    //listener for logout form submission to trigger log out
    $('#logout-form').submit(wrapperFunctionOut)

    //listener for registration form submission to trigger registering a new person
    $('#register-form').submit(wrapperFunctionReg)
    $('#register-form').submit(() => {
        $('#register-form').trigger("reset")})

    //listener for 'start new game' button click to trigger creating a new game
    $('#new-game-btn').click(wrapperFunctionNewGame)

    //listener for 'join game' button click to trigger adding another player to a game
    $("#gamesBoardGuts").ready ( function () {
        $('#gamesBoardGuts').on ("click", ".join-game-btn", function () {
            wrapperFunctionJoinGame()
        });
    });
})


