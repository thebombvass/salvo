// THIS IS GAME, THE FIELD VIEW, NOT GAMES

//main function
$(function() {

    let carrierDummy = []
    let cruiserDummy = []
    let battleshipDummy = []
    let destroyerDummy = []
    let shipsDummy = {carrierDummy: carrierDummy, cruiserDummy: carrierDummy, battleshipDummy: battleshipDummy, destroyerDummy: destroyerDummy}

    let occupiedBoxArray = []
    let horzVertz = ""

    //*******************Function Creation ****************

    //creates the table showing your own boats and how they doing
    function createBoards() {
    let rowsHtml = "<td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td>"
        let tableLabel = "<thead><tr> <th scope='col'> </th> <th scope='col'>A</th></th> <th scope='col'>B</th></th> <th scope='col'>C</th></th> <th scope='col'>D</th></th> <th scope='col'>E</th></th> <th scope='col'>F</th></th> <th scope='col'>G</th></th> <th scope='col'>H</th></th> <th scope='col'>I</th></th> <th scope='col'>J</th> </tr></thead>"
        //for loop for inside the <tbody>//
        let innerTbody = ""
        for(i=1; i<11; i++) {
            innerTbody += ("<tr><th scope='row'>"+ i +"</th>" + rowsHtml + "</tr>")
        }

        $('#yourBoard').html(`${tableLabel} <tbody> ${innerTbody} </tbody>`)
        $('#opponentBoard').html(`${tableLabel} <tbody> ${innerTbody} </tbody>`)
    }

    //highlights specific cells on the players board based on int inputs for row and column
    //used later on in ajax call to set up ships
    function createShip(row, col) {
        //TO DO: add parsing for a->1 b->2 etc.
        $("#yourBoard").find("tbody tr").eq(row-1).children().eq(col).addClass('bg-warning');
    }

    //adds a red 'B' for 'bomb' to specific cells on the players board based on int inputs for row and column
    //used later on in setUpGrid
    function createSalvo(row, col, hitMiss, board) {
        if (board == 1) {
            if (hitMiss == "H") {
                $("#yourBoard").find("tbody tr").eq(row-1).children().eq(col).css({'background-image': `url("/boatExplode.png")`, "background-size": "cover"});
            } else if (hitMiss == "M") {
                $("#yourBoard").find("tbody tr").eq(row-1).children().eq(col).css({'background-image': `url("/waterExplode.png")`, "background-size": "cover"});
            }
        } else if (board == 2) {
            if (hitMiss == "H") {
                $("#opponentBoard").find("tbody tr").eq(row-1).children().eq(col).css({'background-image': `url("/boatExplode.png")`, "background-size": "cover"});
            } else if (hitMiss == "M") {
                $("#opponentBoard").find("tbody tr").eq(row-1).children().eq(col).css({'background-image': `url("/waterExplode.png")`, "background-size": "cover"});
            }
        }
    }

    //changing the letter connotations into numbers for setUpShips input (string)
    function parseColumns(col) {
        let newObj = {A:1, B:2, C:3, D:4 ,E:5, F:6, G:7, H:8, I:9, J:10}
        return newObj[col]
    }

    //setting up initial ships and salvoes. Accepts following parameters
    //'array'-array- to collect the locations on the grid using parseColumns()
    //'shipSalvo'-string- to determine if we are creating ships on the board or salvoes. feeds into createShip() or createSalvo()
    //'board'-int- to determine if these will be set up on your board or your opponents board
    //called inside the ajax call so create the entire 2 boards with ships and slavoes
    function setUpGrid(array, shipSalvo, board) {
        let initialLocations = []
        if (shipSalvo == "ship") {
            for (let i=0; i < array.length; i++) {
                let locations = array[i].locations
                for (let i=0; i < locations.length; i++) {
                    let theCol = parseColumns(locations[i][0])
                    let theRow = locations[i].slice(1)
                    initialLocations.push({theRow: theRow, theCol: theCol})
                }
            }
            for (let i=0; i < initialLocations.length; i++) {
                param1 = initialLocations[i].theRow
                param2 = initialLocations[i].theCol
                createShip(param1, param2)
            }
        }

        if (shipSalvo == "salvo") {
            for (let i=0; i < array.length; i++) {
                let salvo = array[i]
                let theCol = parseColumns(salvo.location[0])
                let theRow = salvo.location.slice(1)
                let hitMiss = salvo.hitMiss
                initialLocations.push({theRow: theRow, theCol: theCol, hitMiss: hitMiss})
            }
            for (let i=0; i < initialLocations.length; i++) {
                param1 = initialLocations[i].theRow
                param2 = initialLocations[i].theCol
                param3 = initialLocations[i].hitMiss
                createSalvo(param1, param2, param3, board)
            }
        }
    }

    //testing if there exists an authenticated user so that we can show the proper login/logout forms
    function whosAuthenticated() {
        $.get("/api/games")
        .done(function(data) {
        if (data[0].currentPlayer.username == "null") {
            theCurrentUser = null
        } else {
            theCurrentUser = data[0].currentPlayer.username;
        }
        })
        .fail(function() {console.log("failure")})
    }

    //function that appropriately fills the box (if there) of ships during the ship building phase in the beginning of the game
    function fillShipsToBuildBox() {
        //check which ships are available for the list of ships to show
        let shipsToShow = {}
        for (var key in shipsDummy) {
            if (shipsDummy[key].length == 0) {
                shipsToShow[key] = shipsDummy[key]
            }
        }
        console.log(shipsToShow)
    }

    //ajax call to get game information specific to the user logged in
    function loadGameInfo(pageContext, pageQuery) {
        $.ajax({
            type: 'GET',
            url: `http://${pageContext}/api/game_view/${pageQuery}`,
            success: function(data) {
            console.log(data)
                //dynamically add data relevant to this game
                let date = data.date
                let player1 = data.username1;
                let shipsPlayer1 = data.ships1;
                let salvoesPlayer1 = data.salvoes1;
                let player2 =""

                if (shipsPlayer1 == "") {
                    console.log("Enter the Dragon")
                    $('#boxShipsToBuildContainer').show()
                    fillShipsToBuildBox();
                } else {
                    setUpGrid(shipsPlayer1, "ship", 1); //1 - 1
                    setUpGrid(salvoesPlayer1, "salvo", 2)//1 - 2

                    //if there is no second player
                    if (data.username2 == null) {
                        player2 = "[Waiting for another player to join...]"
                    //if there is a second player
                    } else {
                        player2 = data.username2;
                        let salvoesPlayer2 = data.salvoes2;
                        setUpGrid(salvoesPlayer2, "salvo", 1); //2-1
                    }
                $('#playersDescription').text(`This game started at ${date} is between ${player1} (you) and ${player2}`)
                }
            },
            statusCode: {
                403: function() {
                    console.log("403")
                    $('#gameFieldView').html(`<h2 class="text-center text-danger">ERROR: We're sorry but you do not have access to this page. Please return home and log in to see your games</h2>`)
                },
                500: function() {
                    console.log("500")
                    $('#gameFieldView').html(`<h2 class="text-center text-danger">ERROR: We're sorry but we don't recognize this URL. Please return home and log in to see your games</h2>`)
                }
            }
        });
    }


    //*****************Function Calls *******************
    //display your board on the page
    $('#boxShipsToBuildContainer').hide()

    createBoards();

    let pageContext = window.location.hostname +":"+ window.location.port
    let pageQuery = new URLSearchParams(window.location.search).get("gp")

    loadGameInfo(pageContext, pageQuery);

//end of main
});


