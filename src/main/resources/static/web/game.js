// THIS IS GAME, THE FIELD VIEW, NOT GAMES

//main function
$(function() {

    //Function Creations ****************

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
    // used later on in ajax call to set up ships
    function createShip(row, col, board) {
        //TO DO: add parsing for a->1 b->2 etc.
        if (board == 1) {
            $("#yourBoard").find("tbody tr").eq(row-1).children().eq(col).addClass('bg-warning');
        } if (board == 2) {
            $("#opponentBoard").find("tbody tr").eq(row-1).children().eq(col).addClass('bg-warning');
        }
    }

    //adds a red 'B' for 'bomb' to specific cells on the players board based on int inputs for row and column
    //used later on in setUpGrid
    function createSalvo(row, col, board) {
            let guy;
            if (board == 1) {
                guy = $("#yourBoard").find("tbody tr").eq(row-1).children().eq(col)[0]
            } else if (board == 2) {
                guy = $("#opponentBoard").find("tbody tr").eq(row-1).children().eq(col)[0]
            }

            if(guy.hasAttribute('class')) {
                if (board == 1) {
                    $("#yourBoard").find("tbody tr").eq(row-1).children().eq(col).css({'background-image': `url("/boatExplode.png")`, "background-size": "cover"});
                } if (board == 2) {
                    $("#opponentBoard").find("tbody tr").eq(row-1).children().eq(col).css({'background-image': `url("/boatExplode.png")`, "background-size": "cover"});
                }
            } else {
                if (board == 1) {
                    $("#yourBoard").find("tbody tr").eq(row-1).children().eq(col).css({'background-image': `url("/waterExplode.png")`, "background-size": "cover"});
                } if (board == 2) {
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
        console.log(shipSalvo)
        let initialLocations = []
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
            if (shipSalvo == "ship") {
                createShip(param1, param2, board)
            } else if (shipSalvo == "salvo") {
                createSalvo(param1, param2, board)
            } else {
            }
        }
    }

    //Function Calls *******************
    //display your board on the page
    createBoards()

    let pageContext = window.location.hostname +":"+ window.location.port
    let pageQuery = new URLSearchParams(window.location.search).get("gp")

        //ajax call to get game information and then do some stuff w it
        $.ajax({
            type: 'GET',
            url: `http://${pageContext}/api/game_view/${pageQuery}`,
            success: function(data) {
                //dynamically add data relevant to this game

                //NOTE TO SELF *******!!!!!!!!!!!*********
                // fix this
                // so the boards keep getting switched weirdly. I think that ajax returns the data in a different order
                // sometimes and you are using [0] and [1] to get the players.
                // Add a conditional that checks that blahblah[0].username == player1 ( as defined previously)
                // Might need to add the same conditional for salvoes.
                //
                // hmmm on second thought this might not be right becasue player 1 and 2 are also defined using [0] or [1]
                // something weird is happening with the bombs being in bizzare places and the conditional that checks for which
                // type of bomb (i.e. hit/miss)
                // ****************!!!!!!!!!!!*****************


                console.log(data)
                let date = data.date.toString()
                let player1 = data.gamePlayers[0].player.username
                let player2 = data.gamePlayers[1].player.username
                $('#playersDescription').text(`This game started at ${date} is between ${player1} (you) and ${player2}`)

                //use data from locations to place ships and salvos on the board.
                //uses setUpShips from above
                let shipsPlayer1 = data.gamePlayers[0].ships
                let shipsPlayer2 = data.gamePlayers[1].ships
                setUpGrid(shipsPlayer1, "ship", 1); //1 - 1
                setUpGrid(shipsPlayer2, "ship", 2); //2 - 2

                //uses setUpShips to add salvoes
                let salvoesPlayer1 = data.gamePlayers[0].salvoes
                console.log(salvoesPlayer1)
                let salvoesPlayer2 = data.gamePlayers[1].salvoes
                console.log(salvoesPlayer2)
                //note - salvoes from one player show up on the board of the other player
                setTimeout(setUpGrid(salvoesPlayer1, "salvo", 2), 1000); //1 - 2
                setTimeout(setUpGrid(salvoesPlayer2, "salvo", 1), 1000); //2 - 1
            }
        });

//end of main
});


