//THIS IS GAMES, THE JSON STUFF, NOT GAME
//Well now its leadership stuff but still not the player fields plz


$(function() {

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
                console.log(username)
                let scoreTotal = 0.0
                element.gamePlayer.forEach((gp) => {
                    scoreTotal += gp.score.score
                })
                console.log(scoreTotal)
                let wins = 0;
                let ties = 0;
                let losses = 0;
                element.gamePlayer.forEach((gp) => {
                    if (gp.score.score==1.0){
                        wins += 1;
                    } else if (gp.score.score==0.5){
                        ties += 1;
                    } else {
                        losses += 1;
                    }
                })

                let gameQuantity = element.gamePlayer.length
                console.log(gameQuantity)

                tableGuts += `<tr><td>${username}</td><td>${scoreTotal}</td><td>${wins}</td><td>${ties}</td><td>${losses}</td><td>${gameQuantity}</td></tr>`
            })
            $("#leadershipBoardGuts").html(tableGuts);
        }


// ****************** function calls and Ajax call *********************** //


        //ajax call
        function loadData() {

            $.get("/api/players")
            .done(function(data) {
            console.log(data)
            data.forEach((player) => {
                console.log(player)
            })
            fillInLeaderBoard(data)
            })
            }

      loadData();

        // logging in and logging out
      function login(evt) {
        evt.preventDefault();
        var form = evt.target
        console.log(form["elements"][0].value)
        let dataToSend = { username: form["elements"][0].value,
                                          password: form["elements"][1].value };


        $.post("/app/login",
               { username: form["elements"][0].value,
                 password: form["elements"][1].value },
                 function(data) {// success callback
                      console.log('data: ' + data);
                 })
         .done(function() {console.log("success")
         alert("Logged in!")
         isAuthenticated()})
         .fail(function() {console.log("Failure")
         alert("Failed to log in. Please ensure your username and password are correct. If you are new, please use the registration form to register as a new user.")});

}
      function logout(evt) {
      console.log(event)
        evt.preventDefault();
        $.post("/app/logout")
         .done(isAuthenticated())
         .fail();
         console.log("user logged out")
      }

      function wrapperFunctionIn() {
        login(event)
      }

      function wrapperFunctionOut() {
        logout(event)
      }

      $('#login-form').submit(wrapperFunctionIn)
      $('#login-form').submit(() => {
            $('#login-form').trigger("reset")})
      $('#logout-form').submit(wrapperFunctionOut)


      //registering
      function register(evt) {
                console.log("registering")
              evt.preventDefault();
              var form = evt.target
              console.log(form["elements"][0].value)
              if(form["elements"][1].value.length < 8) {
              alert("You were not registered correctly. Please ensure you've met the guidelines below, or that you don't already have an account.")
              } else {
              $.post("/app/players",
                { username: form["elements"][0].value,
                password: form["elements"][1].value })
              .done(function() {console.log("success")
              alert("User successfully registered! Please log in.")})
              .fail(function(xhr, status, error) {console.log("failure")
              alert("You were not registered correctly. Please ensure you've met the guidelines below, or that you don't already have an account.")});
              }

                }

            function wrapperFunctionReg() {
              register(event)
            }

            $('#register-form').submit(wrapperFunctionReg)
            $('#register-form').submit(() => {
                        $('#register-form').trigger("reset")})


            function isAuthenticated() {
            $.get("/api/games")
            .done(function(data) {
            console.log(data)
            if (data[0].currentPlayer.username == "null") {
                console.log("nah!")
                $("#logout-form").hide()
                $("#login-form").show()
                $("#register-form").show()
            } else {
                console.log(data[0].currentPlayer.username)
                $("#logout-form").show()
                $("#login-form").hide()
                $("#register-form").hide()
            }
            })
            .fail(function() {console.log("failure")})
            }

            isAuthenticated()
})


