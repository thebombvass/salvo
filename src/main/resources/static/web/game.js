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
    function createShip(row, col) {
        //TO DO: add parsing for a->1 b->2 etc.
        $("#yourBoard").find("tbody tr").eq(row-1).children().eq(col).addClass('bg-warning');
    }

    //changing the letter connotations into numbers for setUpShips input
    function parseColumns(col) {
        let newObj = {A:1, B:2, C:3, D:4 ,E:5, F:6, G:7, H:8, I:9, J:10}
        return newObj[col]
    }

    //setting up initial ships
    function setUpShips(ships) {
        let initialLocations = []
        for (let i=0; i < ships.length; i++) {
            let locations = ships[i].locations
            console.log(ships[i].locations)
            for (let i=0; i < locations.length; i++) {
                console.log(locations[i])
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

    //Function Calls *******************
    //display your board on the page
    createBoards()

    let pageContext = window.location.hostname +":"+ window.location.port
    let pageQuery = new URLSearchParams(window.location.search).get("gp")
    console.log("the URL is: "+ pageContext + " and: " + pageQuery)

        //ajax call to get game iformation and then do some stuff w it
        $.ajax({
            type: 'GET',
            url: `http://${pageContext}/api/game_view/${pageQuery}`,
            success: function(data) {
                //dynamically add data relevant to this game
                let date = data.date.toString()
                let player1 = data.player.username
                $('#playersDescription').text(`This game started at ${date} is between ${player1} (you) and Player 2`)

                //use data from locations to place ships on the board.
                //uses setUpShips from above
                let ships = data.ships
                setUpShips(ships);
            }
        });

//end of main
});


