// THIS IS GAME, THE FIELD VIEW, NOT GAMES

//PHASES OR MODES FOR THE GAME
//      each phase is followed by a 'wait' phase while you wait for the other player to complete the same action that you did
//      you move onto a new phase when a particular condition is met
// Begin -> Ship Build (setting up ships) -> Turns (firing salvoes) -> Game Over (somebody won)

//main function
$(function() {

    $("#returnHome").click(function() {location.href =location.protocol +"//"+location.hostname+":"+location.port+ "/web/games.html"})

    function typeOut(text, speed) {
       setTimeout(function() {$("#messageBoard").text(text)}, speed)
    }

    function typeWriter (message) {
        text=""
        for(i=0;i<message.length; i++) {
            speed = 50 * (i+1)
            text += message.charAt(i)
            typeOut(text, speed)
        }
    }

    $("#boardSlidesLeft").click(function() {plusDivs(-1)});
    $("#boardSlidesRight").click(function() {plusDivs(+1)});

    var slideIndex = 1;
    showDivs(slideIndex);

    function plusDivs(n) {
        showDivs(slideIndex += n);
    }

    function showDivs(n) {
        var i;
        var x = $(".boardSlides");
        if (n > x.length) {slideIndex = 1}
        if (n < 1) {slideIndex = x.length} ;
        for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";
        }
        x[slideIndex-1].style.display = "block";
    }

    function disableAndEnableBoards(board, disEn, message) {

        //variables to set the id's of the p tag where the message will go and the table that will be
        //disabled or enabled depending on 'board' parameter
        bTextId = ""
        bId =""
        if (board == "1") {
            bTextId = '#yourBoardDisable'
            bId = '#yourBoard'
        } else if (board == "2") {
            bTextId = '#opponentBoardDisable'
            bId = '#opponentBoard'
        }

        //disable the board
        if(disEn == '0') {
            $(bTextId).text(message);
            $(bTextId).show();
            $(bId).removeClass('table-primary')
            $(bId).addClass('table-secondary')
        //enable the board
        } else if (disEn =='1') {
            $(bTextId).hide();
            $(bId).removeClass('table-secondary')
            $(bId).addClass('table-primary')
        }

    }

    //*******************Global Variables ***********************//

    //some comment here ab what these are
    let date
    let pageContext
    let pageQuery
    let player1 = ""
    let player2 = ""
    let gp_id
    let roundNo = 0;
    let salvoRowSelected;
    let salvoColSelected;
    let yourShipsSunk = 0;
    let theirShipsSunk = 0;


    //Dummy variables for the locations of each individual ship. Used to hold their location during the 'ship build'
    // phase before you're ready to commit them to the repo 'ships'
    let carrierDummy = []
    let cruiserDummy = []
    let battleshipDummy = []
    let destroyerDummy = []

    // and object with all the Dummy ship arrays and their locations
    let shipsDummy = {carrierDummy: carrierDummy, cruiserDummy: cruiserDummy, battleshipDummy: battleshipDummy, destroyerDummy: destroyerDummy}

    // Only the ships that are available to drag, drop, be in the placement box, etc. shipDummys that are null.
    // Used in fillShipsToBuildBox() to know which ships are still available for placement
    // Also used in addDragListeners() so that the ships which are available for placement can listen for a drag event
    let shipsToShow = []

    //only the ships that have already been placed. basically antithesis of ShipsToShow, except its a list of locations,
    // not a list of ships. shipDummys that are not null
    // Used in XX function
    let occupiedBoxArray = []

    //whether you are in vertical placement mode or horizontal placement mode, controlled by radio button and XX function
    let horzVertz = "H"

    //this is set every time you begin a drag event and sets this to the current event target (i.e. the ship you're moving)
    // this is used in addDropListeners() to determine, upon drop, if the drop is legal
    // this is set back to null on 'drop' event
    let currentDraggedItem = null;


    //****************************Function Creation *****************************//

        //****functions in 'BEGIN' phase****//

    //Creates the blank HTML table for your board and your opponents board
    function createBoards() {
        let rowsHtml = `<td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td>`
        let tableLabel = "<thead><tr> <th scope='col'> </th> <th scope='col'>A</th></th> <th scope='col'>B</th></th> <th scope='col'>C</th></th> <th scope='col'>D</th></th> <th scope='col'>E</th></th> <th scope='col'>F</th></th> <th scope='col'>G</th></th> <th scope='col'>H</th></th> <th scope='col'>I</th></th> <th scope='col'>J</th> </tr></thead>"
        //for loop for inside the <tbody>//
        let innerTbody = ""
        for(i=1; i<11; i++) {
            innerTbody += ("<tr><th scope='row'>"+ i +"</th>" + rowsHtml + "</tr>")
        }
        $('#yourBoard').html(`${tableLabel} <tbody> ${innerTbody} </tbody>`)

        rowsHtml = "<td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td>"
        tableLabel = "<thead><tr> <th scope='col'> </th> <th scope='col'>A</th></th> <th scope='col'>B</th></th> <th scope='col'>C</th></th> <th scope='col'>D</th></th> <th scope='col'>E</th></th> <th scope='col'>F</th></th> <th scope='col'>G</th></th> <th scope='col'>H</th></th> <th scope='col'>I</th></th> <th scope='col'>J</th> </tr></thead>"
        //for loop for inside the <tbody>//
        innerTbody = ""
        for(i=1; i<11; i++) {
            innerTbody += ("<tr><th scope='row'>"+ i +"</th>" + rowsHtml + "</tr>")
        }
        $('#opponentBoard').html(`${tableLabel} <tbody> ${innerTbody} </tbody>`)
    }

        //****functions in 'SHIP BUILD' phase****//

    //function that appropriately fills the box of ships during the ship building phase in the beginning of the game
    function fillShipsToBuildBox() {
        //check which ships are available for the list of ships to show
        shipsToShow = []
        for (var key in shipsDummy) {
            if (shipsDummy[key].length == 0) {
                shipsToShow.push(key)
            } else {
                //this is gonna have to be fixed, needs parse maybe?
                for (let i=0; i<shipsDummy[key]; i++) {
                    occupiedBoxArray.push(shipsDummy[key][i])
                }
            }
        }
        if (shipsToShow.includes("carrierDummy")) {
            $('#carrierPic').html(`<img id="carrierDragItem${horzVertz}" data-ship="ca${horzVertz}" draggable="true" class="img-fluid" style="max-height:120px"  src="/carrierWhole${horzVertz}.png" alt="cruiser pic" />`)
        } else {
            $('#carrierPic').html(`<button id="removeCarrierBtn" class="btn btn-light">Remove Carrier</button>`);
            $('#removeCarrierBtn').click(function() {
                removeShip('carrier');
            });
        }
        if (shipsToShow.includes("battleshipDummy")) {
           $('#battleshipPic').html(`<img id="battleshipDragItem${horzVertz}" data-ship="ba${horzVertz}" draggable="true" class="img-fluid" style="max-height:120px" src="/battleshipWhole${horzVertz}.png" alt="battleship pic" />`)
        } else {
            $('#battleshipPic').html(`<button id="removeBattleshipBtn" class="btn btn-light">Remove Battleship</button>`)
            $('#removeBattleshipBtn').click(function() {
                removeShip('battleship');
            });
        }
        if (shipsToShow.includes("cruiserDummy")) {
            $('#cruiserPic').html(`<img id="cruiserDragItem${horzVertz}" data-ship="ba${horzVertz}" draggable="true" class="img-fluid" style="max-height:120px" src="/cruiserWhole${horzVertz}.png" alt="cruiser pic" />`)
        } else {
            $('#cruiserPic').html(`<button id="removeCruiserBtn" class="btn btn-light">Remove Cruiser</button>`)
            $('#removeCruiserBtn').click(function() {
                removeShip('cruiser');
            });
        }
        if (shipsToShow.includes("destroyerDummy")) {
           $('#destroyerPic').html(`<img id="destroyerDragItem${horzVertz}" data-ship="de${horzVertz}" draggable="true" class="img-fluid" style="max-height:120px" src="/destroyerWhole${horzVertz}.png" alt="destroyer pic" />`)
        } else {
            $('#destroyerPic').html(`<button id="removeDestroyerBtn" class="btn btn-light">Remove Destroyer</button>`)
            $('#removeDestroyerBtn').click(function() {
                removeShip('destroyer');
            });
        }
        addDragListeners()
        if (shipsToShow.length == 0) {
            $('#saveBtn').prop('disabled', false)
        } else {
            $('#saveBtn').prop('disabled', true)
        }
    }

    //adds Drag event listeners to the ships
    function addDragListeners() {
        //add dragstart and dragend listeners meaning when you drag what happens
        if (shipsToShow.includes("carrierDummy")) {
            let carrierId = `#carrierDragItem${horzVertz}`
            $(carrierId).on('dragstart', function(e) {
                console.log('dragstart')
                setTimeout(function () {
                    currentDraggedItem = $(carrierId);
                    $(carrierId).hide()
                }, 0);
            });
            $(carrierId).on('dragend', function(e) {
                console.log('dragend')
                setTimeout(function() {
                    currentDraggedItem = null;
                    $(carrierId).show()
                }, 0);
            })
        }

        if (shipsToShow.includes("battleshipDummy")) {
            let battleshipId = `#battleshipDragItem${horzVertz}`
            $(battleshipId).on('dragstart', function(e) {
                console.log('dragstart')
                setTimeout(function () {
                    currentDraggedItem = $(battleshipId);
                    $(battleshipId).hide()
                }, 0);
            });

            $(battleshipId).on('dragend', function(e) {
                console.log('dragend')
                setTimeout(function() {
                    currentDraggedItem = $(battleshipId);
                    $(battleshipId).show()
                }, 0);
            })
        }

        if (shipsToShow.includes("cruiserDummy")) {
            let cruiserId = `#cruiserDragItem${horzVertz}`
            $(cruiserId).on('dragstart', function(e) {
                console.log('dragstart')
                setTimeout(function () {
                    currentDraggedItem = $(cruiserId);
                    $(cruiserId).hide()
                }, 0);
            });

            $(cruiserId).on('dragend', function(e) {
                console.log('dragend')
                setTimeout(function() {
                    currentDraggedItem = $(cruiserId);
                    $(cruiserId).show()
                }, 0);
            })
        }

        if  (shipsToShow.includes("destroyerDummy")) {
            let destroyerId = `#destroyerDragItem${horzVertz}`
            $(destroyerId).on('dragstart', function(e) {
                console.log('dragstart')
                setTimeout(function () {
                    currentDraggedItem = $(destroyerId);
                    $(destroyerId).hide()
                }, 0);
            });

            $(destroyerId).on('dragend', function(e) {
                console.log('dragend')
                setTimeout(function() {
                    currentDraggedItem = $(destroyerId);
                    $(destroyerId).show()
                }, 0);
            })
        }
        addDropListeners()
    }

    //this doesn't actually add any event listeners. It adds data attributes to the td cells which
    //determine which ships are allowed to be placed there. First clears all data attributes, then adds
    //them back, so long as they don't conflict with a ship already placed.
    //triggered by add DragListeners and upstream, fillBox
    function addDropListeners() {
        let rows = $("#yourBoard").find("tbody tr")
        let cols = $("#yourBoard").find("tbody tr").eq(0).find("td")

        //reset the data attribute on all boxes everywhere before reading them after every change to ships available
        for (var i=0; i<rows.length; i++) {
            for (var j=0; j <cols.length; j++) {
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box0', 'no')
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box1', 'no')
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box2', 'no')
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box3', 'no')
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box4', 'no')
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box5', 'no')
            }
        }

        //add drop listeners to for carrier vertical placement
        for (var i=0; i<rows.length-4; i++) {
            for (var j=0; j <cols.length; j++) {
                if(!occupiedBoxArray.includes(i+'-'+j)) {
                    $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box0', 'caV')
                } else {
                }
            }
        }

        //add drop listeners to for carrier horizontal placement
        for (var i=0; i<rows.length; i++) {
            for (var j=0; j <cols.length-4; j++) {
                if(!occupiedBoxArray.includes(i+'-'+j)) {
                    $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box1', 'caH')
                }
            }
        }

        //add drop listeners to for cruiser/battleship vertical placement
        for (var i=0; i<rows.length-2; i++) {
            for (var j=0; j <cols.length; j++) {
                if(!occupiedBoxArray.includes(i+'-'+j)) {
                    $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box2', 'baV')
                }
            }
        }

        //add drop listeners to for cruiser/battleship horizontal placement
        for (var i=0; i<rows.length; i++) {
            for (var j=0; j <cols.length-2; j++) {
                if(!occupiedBoxArray.includes(i+'-'+j)) {
                    $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box3', 'baH')
                }
            }
        }

        //add drop listeners to for destroyer vertical placement
        for (var i=0; i<rows.length-1; i++) {
            for (var j=0; j <cols.length; j++) {
                if(!occupiedBoxArray.includes(i+'-'+j)) {
                    $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box4', 'deV')
                }
            }
        }

        //add drop listeners to for destroyer horizontal placement
        for (var i=0; i<rows.length; i++) {
            for (var j=0; j <cols.length-1; j++) {
                if(!occupiedBoxArray.includes(i+'-'+j)) {
                    $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).attr('data-box5', 'deH')
                }
            }
        }
    }

    //this should be called only once to set up listeners that will check where data- attribue on the <td> cell matches
    //the data attribute of the item being dragged to determine legal placement.
    //As ships become placed and boxes become illegal for placement, the data attributes will change to handle this and will
    // automatically not trigger this event listener since it will no longer match
    function dropEventHandler() {
        let rows = $("#yourBoard").find("tbody tr")
        let cols = $("#yourBoard").find("tbody tr").eq(0).find("td")

        for (var i=0; i<rows.length; i++) {
            for (var j=0; j <cols.length; j++) {
                //prevent default
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).on('dragover', function(e) {
                    e.preventDefault();
                });
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).on('dragenter', function(e) {
                    e.preventDefault();
                });
                //add a class to each td cell which says what cell it is (used as 'starter cell' in dropToDummyProcessor upon placement)
                let currbox = i.toString() +"-"+j.toString()
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).addClass(currbox);

                //adding on drop listener which will trigger dropToDummyProcessor() if data attributes match on <td> box and draggable item
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).on('drop', function(e) {
                    for(let i=0; i<6; i++) {
                        let dtag = 'data-box' + i
                        if(e.target.getAttribute(dtag) == currentDraggedItem[0].dataset.ship) {
                            console.log('dropped')
                            dropToDummyProcessor(currentDraggedItem[0].getAttribute('id'), e.target.classList[0])
                        }
                    }
                });
            }
        }
    }

    //called by dropEventHandler on a drop event. converts the cell clicked and the ship being dragged
    //into a placed ship. Uses illegalPlacementNotice and blockingCellswithShip
    function dropToDummyProcessor(ship, starterCell) {
    //down first then over
        let shipLength

        //process starter cell
        let startRow = parseInt(starterCell)
        let startCol = parseInt(starterCell.charAt(2))

        //below is a series of if statements that follows the same pattern:
        //  fill shipDummy w appropriate locations
        //  remove data-ship from appropriate locations
        //  fill squares w ship image
        //  trigger fillbox() to redo available boxes
        //for carrier, then battleship, then cruiser, then destroyer. This will be outlined only for carrier but the rest do the same
        if (ship.includes('ca')) {
            shipLength = 5
            carrierDummy.push(starterCell)
            //depending on horizontal or vertical, the shipDummy will be filled w the appropriate locations
            if (ship.includes('H')) {
                for(i=1; i<shipLength; i++) {
                    carrierDummy.push(startRow.toString() + '-'+ (startCol+i).toString())
                }
            } if (ship.includes('V')) {
                for(i=1; i<shipLength; i++) {
                    carrierDummy.push((startRow+i).toString() + '-'+ startCol.toString())
                }
            }
            //check to ensure that this is a legal placement. if placement is legal...
            if (illegalPlacementNotice(carrierDummy)) {
                //..add the locations to occupiedBoxArray and remove data-ship from those locations//
                blockingCellsWithShip(carrierDummy)
                //place the images of the ship in the appropriate cells
                createShip(carrierDummy, 'carrier', horzVertz)
                fillShipsToBuildBox();
            } else {
                i= 0
                while (i<carrierDummy.length) {
                    carrierDummy.pop();
                    i+1
                }
            }
        } else if (ship.includes('ba')) {
            shipLength = 3
            battleshipDummy.push(starterCell)
            if (ship.includes('H')) {
                for(i=1; i<shipLength; i++) {
                    battleshipDummy.push(startRow.toString() + '-'+ (startCol+i).toString())
                }
            } if (ship.includes('V')) {
                for(i=1; i<shipLength; i++) {
                    battleshipDummy.push((startRow+i).toString() + '-'+ startCol.toString())
                }
            }
            //check to ensure that this is a legal placement. if placement is legal...
            if (illegalPlacementNotice(battleshipDummy)) {
                //..add the locations to occupiedBoxArray and remove data-ship from those locations//
                blockingCellsWithShip(battleshipDummy)
                //place the images of the ship in the appropriate cells
                createShip(battleshipDummy, 'battleship', horzVertz)
                fillShipsToBuildBox();
            } else {
                i= 0
                while (i<battleshipDummy.length) {
                    battleshipDummy.pop();
                    i+1
                }
            }
        } else if (ship.includes('cr')) {
            shipLength = 3
            cruiserDummy.push(starterCell)
            if (ship.includes('H')) {
                for(i=1; i<shipLength; i++) {
                    cruiserDummy.push(startRow.toString() + '-'+ (startCol+i).toString())
                }
            } else if (ship.includes('V')) {
                for(i=1; i<shipLength; i++) {
                    cruiserDummy.push((startRow+i).toString() + '-'+ startCol.toString())
                }
            }
            //check to ensure that this is a legal placement. if placement is legal...
            if (illegalPlacementNotice(cruiserDummy)) {
                //..add the locations to occupiedBoxArray and remove data-ship from those locations//
                blockingCellsWithShip(cruiserDummy)
                //place the images of the ship in the appropriate cells
                createShip(cruiserDummy.reverse(), 'cruiser', horzVertz)
                fillShipsToBuildBox();
            } else {
                i= 0
                while (i<cruiserDummy.length) {
                    cruiserDummy.pop();
                    i+1
                }
            }

        } else {
            shipLength = 2
            destroyerDummy.push(starterCell)
            if (ship.includes('H')) {
                for(i=1; i<shipLength; i++) {
                    destroyerDummy.push(startRow.toString() + '-'+ (startCol+i).toString())
                }
            } if (ship.includes('V')) {
                for(i=1; i<shipLength; i++) {
                    destroyerDummy.push((startRow+i).toString() + '-'+ startCol.toString())
                }
            }
            //check to ensure that this is a legal placement. if placement is legal...
            if (illegalPlacementNotice(destroyerDummy)) {
                //..add the locations to occupiedBoxArray and remove data-ship from those locations//
                blockingCellsWithShip(destroyerDummy)
                //place the images of the ship in the appropriate cells
                createShip(destroyerDummy.reverse(), 'destroyer', horzVertz)
                fillShipsToBuildBox();
            } else {
                i= 0
                while (i<destroyerDummy.length) {
                    destroyerDummy.pop();
                    i+1
                }
            }
        }
    }

    //function that ensures the ship placement in not the starter cell is not conflicting with another ship
    function illegalPlacementNotice(dummyArray) {
        for (i=0;i<dummyArray.length;i++) {
            if(occupiedBoxArray.includes(dummyArray[i])) {
                console.log('ILLEGAL PLACEMENT')
                alert('Sorry, you may not place your ship there, as it will conflict with another ship already placed.')
                return false
            }
        } return true
    }

    //remove data attributes from td cells that contain full ship
    function blockingCellsWithShip(dummyArray) {
        for (i=0;i<dummyArray.length; i++) {
            //..add the locations to occupiedBoxArray..
            occupiedBoxArray.push(dummyArray[i]);
            //..remove data-ship from those locations..//
            $('.'+dummyArray[i]).attr('data-box0', 'no');
            $('.'+dummyArray[i]).attr('data-box1', 'no');
            $('.'+dummyArray[i]).attr('data-box2', 'no');
            $('.'+dummyArray[i]).attr('data-box3', 'no');
            $('.'+dummyArray[i]).attr('data-box4', 'no');
            $('.'+dummyArray[i]).attr('data-box5', 'no');
        }
    }

    //removes the image that is the ship from td cells where the ship was
    function removeShip(ship) {
        //for carrier
        if (ship == 'carrier') {
            //for each location that the carrier occupies...
            for (i=0; i<carrierDummy.length;i++) {
                row = parseInt(carrierDummy[i][0])
                col = parseInt(carrierDummy[i][2])
                //..clear the cells of the image of the ship..
                $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': 'none'});
                //..remove the ship's location from the occupiedBoxArray..
                if(occupiedBoxArray.includes(carrierDummy[i])) {
                    let index = occupiedBoxArray.indexOf(carrierDummy[i]);
                    occupiedBoxArray.splice(index, 1)
                }
                //..return data-ship of the cells back to normal..
                addDropListenersBack(carrierDummy[i])
            }
            //set carrier back to none so that it can be...
            let placeholder = carrierDummy.length
            for (i=0;i<placeholder;i++) {
                carrierDummy.pop()
            }
            //..refilled in the box to be placed again
            fillShipsToBuildBox()

        //for battleship
        } else if (ship == 'battleship') {
            for (i=0; i<battleshipDummy.length;i++) {
                row = parseInt(battleshipDummy[i][0])
                col = parseInt(battleshipDummy[i][2])
                $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': 'none'});
                if(occupiedBoxArray.includes(battleshipDummy[i])) {
                    let index = occupiedBoxArray.indexOf(battleshipDummy[i]);
                    occupiedBoxArray.splice(index, 1)
                }
                //..return data-ship of the cells back to normal..
                addDropListenersBack(battleshipDummy[i])
            }
            //set carrier back to none so that it can be...
            let placeholder = battleshipDummy.length
            for (i=0;i<placeholder;i++) {
                battleshipDummy.pop()
            }
            //..refilled in the box to be placed again
            fillShipsToBuildBox()

        //for cruiser
        } else if (ship == 'cruiser') {
            for (i=0; i<cruiserDummy.length;i++) {
                row = parseInt(cruiserDummy[i][0])
                col = parseInt(cruiserDummy[i][2])
                $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': 'none'});
                if(occupiedBoxArray.includes(cruiserDummy[i])) {
                    let index = occupiedBoxArray.indexOf(cruiserDummy[i]);
                    occupiedBoxArray.splice(index, 1)
                }
                //..return data-ship of the cells back to normal..
                addDropListenersBack(cruiserDummy[i])
            }
            //set carrier back to none so that it can be...
            let placeholder = cruiserDummy.length
            for (i=0;i<placeholder;i++) {
                cruiserDummy.pop()
            }
            //..refilled in the box to be placed again
            fillShipsToBuildBox()

        //for destroyer
        } else {
            for (i=0; i<destroyerDummy.length;i++) {
                row = parseInt(destroyerDummy[i][0])
                col = parseInt(destroyerDummy[i][2])
                $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': 'none'});
                if(occupiedBoxArray.includes(destroyerDummy[i])) {
                    let index = occupiedBoxArray.indexOf(destroyerDummy[i]);
                    occupiedBoxArray.splice(index, 1)
                }
                //..return data-ship of the cells back to normal..
                addDropListenersBack(destroyerDummy[i])
            }
            //set carrier back to none so that it can be...
            let placeholder = destroyerDummy.length
            for (i=0;i<placeholder;i++) {
                destroyerDummy.pop()
            }

            //..refilled in the box to be placed again
            fillShipsToBuildBox()

        }
    }

    //adds the data attributes back to cells where a ship used to be that was removed
    function addDropListenersBack(loc) {
        row = parseInt(loc[0])
        col = parseInt(loc[2])
        //array of boxes that can have this type of listener
        let caV = ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5", "0-6", "0-7", "0-8", "0-9", "1-0", "1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "1-8", "1-9", "2-0", "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "2-7", "2-8", "2-9", "3-0", "3-1", "3-2", "3-3", "3-4", "3-5", "3-6", "3-7", "3-8", "3-9", "4-0", "4-1", "4-2", "4-3", "4-4", "4-5", "4-6", "4-7", "4-8", "4-9", "5-0", "5-1", "5-2", "5-3", "5-4", "5-5", "5-6", "5-7", "5-8", "5-9"]
        let caH = ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5", "1-0", "1-1", "1-2", "1-3", "1-4", "1-5", "2-0", "2-1", "2-2", "2-3", "2-4", "2-5", "3-0", "3-1", "3-2", "3-3", "3-4", "3-5", "4-0", "4-1", "4-2", "4-3", "4-4", "4-5", "5-0", "5-1", "5-2", "5-3", "5-4", "5-5", "6-0", "6-1", "6-2", "6-3", "6-4", "6-5", "7-0", "7-1", "7-2", "7-3", "7-4", "7-5", "8-0", "8-1", "8-2", "8-3", "8-4", "8-5", "9-0", "9-1", "9-2", "9-3", "9-4", "9-5"]
        let baV = ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5", "0-6", "0-7", "0-8", "0-9", "1-0", "1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "1-8", "1-9", "2-0", "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "2-7", "2-8", "2-9", "3-0", "3-1", "3-2", "3-3", "3-4", "3-5", "3-6", "3-7", "3-8", "3-9", "4-0", "4-1", "4-2", "4-3", "4-4", "4-5", "4-6", "4-7", "4-8", "4-9", "5-0", "5-1", "5-2", "5-3", "5-4", "5-5", "5-6", "5-7", "5-8", "5-9", "6-0", "6-1", "6-2", "6-3", "6-4", "6-5", "6-6", "6-7", "6-8", "6-9", "7-0", "7-1", "7-2", "7-3", "7-4", "7-5", "7-6", "7-7", "7-8", "7-9"]
        let baH = ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5", "0-6", "0-7", "1-0", "1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "2-0", "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "2-7", "3-0", "3-1", "3-2", "3-3", "3-4", "3-5", "3-6", "3-7", "4-0", "4-1", "4-2", "4-3", "4-4", "4-5", "4-6", "4-7", "5-0", "5-1", "5-2", "5-3", "5-4", "5-5", "5-6", "5-7", "6-0", "6-1", "6-2", "6-3", "6-4", "6-5", "6-6", "6-7", "7-0", "7-1", "7-2", "7-3", "7-4", "7-5", "7-6", "7-7", "8-0", "8-1", "8-2", "8-3", "8-4", "8-5", "8-6", "8-7", "9-0", "9-1", "9-2", "9-3", "9-4", "9-5", "9-6", "9-7"]
        let deV = ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5", "0-6", "0-7", "0-8", "0-9", "1-0", "1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "1-8", "1-9", "2-0", "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "2-7", "2-8", "2-9", "3-0", "3-1", "3-2", "3-3", "3-4", "3-5", "3-6", "3-7", "3-8", "3-9", "4-0", "4-1", "4-2", "4-3", "4-4", "4-5", "4-6", "4-7", "4-8", "4-9", "5-0", "5-1", "5-2", "5-3", "5-4", "5-5", "5-6", "5-7", "5-8", "5-9", "6-0", "6-1", "6-2", "6-3", "6-4", "6-5", "6-6", "6-7", "6-8", "6-9", "7-0", "7-1", "7-2", "7-3", "7-4", "7-5", "7-6", "7-7", "7-8", "7-9", "8-0", "8-1", "8-2", "8-3", "8-4", "8-5", "8-6", "8-7", "8-8", "8-9"]
        let deH = ["0-0", "0-1", "0-2", "0-3", "0-4", "0-5", "0-6", "0-7", "0-8", "1-0", "1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "1-8", "2-0", "2-1", "2-2", "2-3", "2-4", "2-5", "2-6", "2-7", "2-8", "3-0", "3-1", "3-2", "3-3", "3-4", "3-5", "3-6", "3-7", "3-8", "4-0", "4-1", "4-2", "4-3", "4-4", "4-5", "4-6", "4-7", "4-8", "5-0", "5-1", "5-2", "5-3", "5-4", "5-5", "5-6", "5-7", "5-8", "6-0", "6-1", "6-2", "6-3", "6-4", "6-5", "6-6", "6-7", "6-8", "7-0", "7-1", "7-2", "7-3", "7-4", "7-5", "7-6", "7-7", "7-8", "8-0", "8-1", "8-2", "8-3", "8-4", "8-5", "8-6", "8-7", "8-8", "9-0", "9-1", "9-2", "9-3", "9-4", "9-5", "9-6", "9-7", "9-8"]
        //adding listeners back to each location that the ship used to be in upon removal
        if (caV.includes(loc)) {
            $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).attr('data-box0', 'caV')
        }
        if (caH.includes(loc)) {
            $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).attr('data-box1', 'caH')
        }
        if (baV.includes(loc)) {
            $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).attr('data-box2', 'baV')
        }
        if (baH.includes(loc)) {
            $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).attr('data-box3', 'baH')
        }
        if (deV.includes(loc)) {
            $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).attr('data-box4', 'deV')
        }
        if (deH.includes(loc)) {
            $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).attr('data-box5', 'deH')
        }
    }

        //****functions in 'TURNS' phase****//


    //creates a ship
    function createShip(dummyArray, ship, horzVertz) {
        if(horzVertz == 'V') {
            if(ship == 'carrier' || ship == 'battleship') {
                if(dummyArray[0][0] < dummyArray[1][0]) {
                    dummyArray.reverse()
                }
            }
        }
        //fill in ship tail - this belongs in starter-cell since their backwards
        let row = parseInt(dummyArray[0][0])
        let col = parseInt(dummyArray[0][2])
        let purl = "/"+ship+"Tail"+horzVertz+".png"
        $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': `url(${purl})`, "background-size": "cover"});
        //fill in ship head
        row = parseInt(dummyArray[dummyArray.length-1][0])
        col = parseInt(dummyArray[dummyArray.length-1][2])
        purl = "/"+ship+"Head"+horzVertz+".png"
        $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': `url(${purl})`, "background-size": "cover"});
        //fill in ship middle
        for(i=1;i<dummyArray.length-1; i++) {
            row = parseInt(dummyArray[i][0])
            col = parseInt(dummyArray[i][2])
            purl = "/"+ship+"Middle"+horzVertz+".png"
            $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': `url(${purl})`, "background-size": "cover"});
        }
    }

    //adds a bomb image to specific cells on the players' board based on 'hitMiss', which is set in the db during a turn
    //used later on in setUpGrid
    function createSalvo(Srow, Scol, hitMiss, board) {
        let row = parseInt(Srow)
        let col = parseInt(Scol)
        //if its your board
        if (board == 1) {
            if (hitMiss == "H") {
                $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': `url("/boatExplode.png")`, "background-size": "cover"});
            } else if (hitMiss == "M") {
                $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': `url("/waterExplode.png")`, "background-size": "cover"});
            }
        //if its not your board
        } else if (board == 2) {
            if (hitMiss == "H") {
                $("#opponentBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': `url("/boatExplode.png")`, "background-size": "cover"});
            } else if (hitMiss == "M") {
                $("#opponentBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': `url("/waterExplode.png")`, "background-size": "cover"});
            }
        }
    }

    //setting up initial ships and salvoes. Accepts following parameters:
    //  'array'-array- to collect the locations on the grid using parseColumns()
    //  'shipSalvo'-string- to determine if we are creating ships on the board or salvoes. feeds into createShip() or createSalvo()
    //  'board'-int- to determine if these will be set up on your board or your opponents board
    //called inside the ajax call to create the entire 2 boards with ships and slavoes that are already present
    //this should only be called during the 'turns' mode
    function setUpGrid(array, shipSalvo, board) {
        let initialLocations = []
        if (shipSalvo == "ship") {
            for (let i=0; i < array.length; i++) {
                arr = array[i]
                if(arr.locations[0][0] !== arr.locations[1][0]) {
                    createShip(array[i].locations, array[i].shipType, "V")
                } else {
                    createShip(array[i].locations, array[i].shipType, "H")
                }
            }
        }

        if (shipSalvo == "salvo") {
            console.log(array)
            console.log(shipSalvo)
            for(let i=0; i < array.length; i++) {
                row = array[i].location[0]
                col = array[i].location[2]
                hitMiss = array[i].hitMiss
                //create each salvo
                createSalvo(row, col, hitMiss, board)
            }
        }
    }

    function whosTurnIsIt(salvoesPlayer1, salvoesPlayer2) {
        if (salvoesPlayer1.length > salvoesPlayer2.length) {
            console.log('returning zero')
            return 0
        } else {
            console.log('returning one')
            return 1
        }
    }

    function addSalvoListeners() {
        let rows = $("#yourBoard").find("tbody tr")
        let cols = $("#yourBoard").find("tbody tr").eq(0).find("td")

        for (var i=0; i<rows.length; i++) {
            for (var j=0; j <cols.length; j++) {
                $("#opponentBoard").find("tbody tr").eq(i+0).children().eq(j+1).addClass(i+'-'+j)
            }
        }

        for (var i=0; i<rows.length; i++) {
            for (var j=0; j <cols.length; j++) {
                let box = $("#opponentBoard").find("tbody tr").eq(i+0).children().eq(j+1)
                if(box.css('background-image') == 'none') {
                    $("#opponentBoard").find("tbody tr").eq(i+0).children().eq(j+1).on('click', function(e) {
                        prevRow = parseInt(salvoRowSelected)
                        prevCol = parseInt(salvoColSelected)
                        console.log($("#opponentBoard").find("tbody tr").eq(prevRow).children().eq(prevCol+1))
                        $("#opponentBoard").find("tbody tr").eq(prevRow).children().eq(prevCol+1).removeClass('bg-danger')
                        salvoRowSelected = e.target.classList[0][0]
                        salvoColSelected = e.target.classList[0][2]
                        $("#yourSelection").text(`You have selected to fire at row: ${salvoRowSelected} col: ${salvoColSelected}. Click 'Fire' or select another square below.`)
                        $("#sendSalvoBtn").prop('disabled', false)
                        e.target.classList.add('bg-danger')
                    });
                } else {
                }

            }
        }
    }

    //****AJAX CALLs AND PHASE LOGIC*****


    //ajax post of ship data upon ship placement
    function postAShip(shipList) {
        for (key in shipList) {
            ship = key.slice(0,key.indexOf('Dummy'))
            $.post("/api/ships",
                {ship: ship,
                gamePlayer_id: gp_id,
                locs: shipList[key]})
            .done(function(data) {
                console.log(data)
                console.log("success")
            })
            .fail(function() {
                console.log("failure")
            });
        }
        location.reload();
    }

    //ajax get to get who the current gameplayer is (i.e. the logged in player matching the game_view you are on)
    function getGamePlayer() {
        $.get('/api/gameplayers')
        .done(function(data){
            for(i=0;i<data.length;i++) {
                game_id = data[i].game_id
                player_id = data[i].player_id
                if (game_id == pageQuery && player_id == player1) {
                    console.log(true)
                    gp_id = data[i].id
                    shipsSunk(gp_id);
                } else {
                    console.log(false)

                }
            }
        })
    }

    //send a salvo to the db
    function postASalvo(loc, gp_id, turnNo) {
        console.log("gp_id is "+ gp_id)
        console.log("loc is "+ loc)
        console.log("turnNo is "+ turnNo)
        console.log("gameId is "+ pageQuery)
        $.post("/api/salvoes",
            {gamePlayer_id: gp_id,
            loc: loc,
            turnNo: turnNo,
            gameId: pageQuery})
        .done(function(data) {
            console.log(data)
            console.log("success")
        })
        .fail(function() {
            console.log("failure")
        });
      location.reload();
    }

    //check how many ships are sunk for each  player
    function shipsSunk(gp_id) {
        //how many of your ships are sunk
        $.get(path="/api/shipSunk",
            {game_id: pageQuery,
            gp_id: gp_id})
        .done(function(data){
            console.log(data)
            console.log("success")
            yourShipsSunk = data[0]
            theirShipsSunk = data[1]
                $('#date').text(`Date: ${date}`);
                $('#round').text(`Round: ${roundNo}`);
                $('#yss').text(`Your ships sunk: ${yourShipsSunk}`);
                $('#oss').text(`${player2}'s ships sunk: ${theirShipsSunk}`);
            if(yourShipsSunk==4 || theirShipsSunk==4) {
                $('#yourTurn').hide()
                let winner;
                console.log('GAME OVER')
                if(yourShipsSunk==4) {
                    winner = "them"
                    typeWriter(`${player2} sunk all your ships and won! You put up a good fight soldier, but unfortunately, we lost. Click 'Return Home' at the top of the page to start a new game, join a new game, or review your position on the Leader Board.`)
                    disableAndEnableBoards(1,0, "Your Board Disabled: GAME OVER")
                    disableAndEnableBoards(2,0, "Opponent Board Disabled: GAME OVER")
                } else {
                    winner= "you"
                    typeWriter(`You sunk all of ${player2}'s ships and won! Congratulations on defending our Navy soldier! Click 'Return Home' at the top of the page to start a new game, join a new game, or review your position on the Leader Board.`)
                    disableAndEnableBoards(1,0, "Your Board Disabled: GAME OVER")
                    disableAndEnableBoards(2,0, "Opponent Board Disabled: GAME OVER")
                }
                gameIsOver(pageQuery, gp_id, winner)
            }
        })
        .fail(function() {
            console.log("failure")
        });
    }

    function gameIsOver(game_id, gp_id, winner) {
        $.post(path="/api/scores",
            {game_id: game_id,
            gp_id: gp_id,
            winner: winner
            })
        .done(function(data) {
            console.log(data)
            console.log('success')
        })
        .fail(function() {
            console.log('fail')
        })

    }

    //the main ajax call to get game information specific to the user logged in
    function loadGameInfo(pageContext, pageQuery) {
        $.ajax({
            type: 'GET',
            url: `http://${pageContext}/api/game_view/${pageQuery}`,
            success: function(data) {
            console.log(data)
                //dynamically add data relevant to this game
                date = data.date
                player1 = data.username1;
                let shipsPlayer1 = data.ships1;
                let salvoesPlayer1 = data.salvoes1;
                if (data.username2 == null) {
                    player2 = "[Waiting for another player to join...]"
                } else {
                    player2 = data.username2;
                }
                //retrieve gamePlayer_id
                getGamePlayer();
                console.log('info you want: '+ player2+ " and "+date)

                //add something here so that if you win, it stops everything else. Typewriter and clicking cells turning red

                //**condition met to enter build phase**
                if (shipsPlayer1 == "") {
                    console.log("Enter Build Phase")
                    //ability to see ships to place
                    $('#boxShipsToBuildContainer').show()
                    typeWriter("Let's prepare for battle! Position your ships on your board by dragging and dropping them onto your board. If you are not happy with your ship placement you can remove the ship by clicking the 'remove' button and place it again. Chose if your ships are positioned vertically or horizontally by clicking the radio buttons below. Once all your ships placed, click the 'Save' button below. BEWARE- once you click 'Save' you cannot go back.")
                    //fill ships to place box with available ships
                    //this function triggers adding drag listeners
                    fillShipsToBuildBox();
                    //add drop listeners
                    dropEventHandler();
                    disableAndEnableBoards(1,1, "")
                    disableAndEnableBoards(2,0, "Opponent Board Disabled: you may only place ships on your board")

                //**condition met to enter turns phase**
                } else {
                    console.log("Enter Turns Phase")

                    setUpGrid(shipsPlayer1, "ship", 1); //player1 ships
                    setUpGrid(salvoesPlayer1, "salvo", 2) //player1 salvoes (on p2 ships)

                    //if there is no second player
                    if (data.username2 == null) {
                        disableAndEnableBoards(1,0, "Your Board Disabled: waiting for Player 2");
                        disableAndEnableBoards(2,0, "Opponent Board Disabled: waiting for Player 2");
                        typeWriter("We are currently waiting for another player to join your game and place their ships. Feel free to start another game or join someone else's game while you wait by clicking 'Return Home' button at the top of the screen and scrolling down to the 'Games' section.")
                    //if there is a second player
                    } else {
                        //if second player has placed his ships, you are officially in the turns phase
                        if (data.shipsExist) {
                            //first add salvoes already played
                            let salvoesPlayer2 = data.salvoes2;
                            setUpGrid(salvoesPlayer2, "salvo", 1); //opponents salvoes on your board
                            //set appropriate roundNo
                            roundNo = Math.min(salvoesPlayer1.length, salvoesPlayer2.length)+1
                            //Within Turns Phase, its your turn
                            if(whosTurnIsIt(salvoesPlayer1, salvoesPlayer2) == 1) {
                                $("#yourTurn").show()
                                disableAndEnableBoards(1,1, "");
                                disableAndEnableBoards(2,1, "");
                                typeWriter(`Your turn for Round ${roundNo}! Take your shot by clicking a square on your opponents board below. When you are happy with your selection click the 'Fire' button below.`)
                                addSalvoListeners();
                                $("#sendSalvoBtn").click(function() {postASalvo(salvoRowSelected+"-"+salvoColSelected, gp_id, roundNo)})
                            //Within Turns Phase, its not your turn. time to wait
                            } else {
                                disableAndEnableBoards(1,0, "Your Board Disabled: waiting for Player 2");
                                disableAndEnableBoards(2,0, "Opponent Board Disabled: waiting for Player 2");
                                typeWriter(`It's ${player2}'s turn to take their shot for this round.`)
                                //refreshing to check if they have taken their shot
                                setTimeout(function() {location=""}, 60000)
                                console.log(`Waiting for ${player2} to take his shot for this round. Refresh page to see if they have`)
                            }
                        //if second player has not placed his ships, you chill
                        } else {
                            disableAndEnableBoards(1,0, "Your Board Disabled: waiting for Player 2");
                            disableAndEnableBoards(2,0, "Opponent Board Disabled: waiting for Player 2");
                            typeWriter(`${player2} has joined your game! Waiting for ${player2} to place his or her ships.`)
                            //refreshing to check if they have placed their ships
                            setTimeout(function() {location=""}, 60000)
                            console.log(`Waiting for ${player2} to place his ships. Refresh page to see if they have`)
                        }
                    }
                }
                 $('#date').text(`Date: ${date}`);
                 $('#round').text(`Round: ${roundNo}`);
                 $('#yss').text(`Your ships sunk: ${yourShipsSunk}`);
                 $('#oss').text(`${player2}'s ships sunk: ${theirShipsSunk}`);
                $('#playersDescription').text(`${player1.toUpperCase()} (YOU) v.s. ${player2.toUpperCase()} (PLAYER 2)`)
                //theres another id for a p tag for anything you want under this header, if needed
            },
            statusCode: {
                403: function() {
                    console.log("403")
                    $('#gameFieldView').html(`<h2 class="text-center text-danger">ERROR: We're sorry but you do not have access to this page. Please return home and log in to see your games'</h2>`)
                },
                500: function() {
                    console.log("500")
                    $('#gameFieldView').html(`<h2 class="text-center text-danger">ERROR: We're sorry but we don't recognize this URL. Please return home and log in to see your games</h2>`)
                }
            }
        });
    }

    //*****************Function Calls *******************
    //this should start hidden and only appear if you are entering build ships mode
    //also adding listeners for orientation radio buttons
    $('#horizontalRad').click(function() {horzVertz="H"; fillShipsToBuildBox()})
    $('#verticalRad').click(function() {horzVertz="V"; fillShipsToBuildBox()})
    $('#boxShipsToBuildContainer').hide()
    $('#yourTurn').hide()
    $('#saveBtn').click(function() {postAShip(shipsDummy)})

    //display your boards on the page
    createBoards();

    //initially getting data for the game. Within this ajax call there is logic to understand what mode of the
    //game you are in, i.e. building ships, waiting for the other player to move, your turn, etc.
    pageContext = window.location.hostname +":"+ window.location.port
    pageQuery = new URLSearchParams(window.location.search).get("gp")
    loadGameInfo(pageContext, pageQuery);

//end of main
});


//add-
//  -can only add one red at a time