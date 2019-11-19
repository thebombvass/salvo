// THIS IS GAME, THE FIELD VIEW, NOT GAMES

//PHASES OR MODES FOR THE GAME
//      each phase is followed by a 'wait' phase while you wait for the other player to complete the same action that you did
//      you move onto a new phase when a particular condition is met
// Begin -> Ship Build (setting up ships) -> Turns (firing salvoes) -> Game Over (somebody won)

//main function
$(function() {

    //*******************Global Variables Declaration for State Management ***********************//

    //Data from loadGameInfo()
    let date
    let player1 = ""
    let player2 = ""
    let gp_id //gameplayer ID
    let roundNo = 0;

    // slide index to start off
    let slideIndex = 1;

    //used in the URL to make the ajax call in loadGameInfo()
    let pageContext //combination of host name and port
    let pageQuery //query, uses game id

    //used when firing a salvo to un-highlight the previously selected cell
    let salvoRowSelected;
    let salvoColSelected;

    //from the ships sunk ajax call and used in stats and to determine if the game is over or not
    let yourShipsSunk = 0;
    let theirShipsSunk = 0;

    //Dummy variables used to hold the location's of ships during the 'ship build' phase before you're ready to commit them to the repo 'ships'
    let carrierDummy = []
    let cruiserDummy = []
    let battleshipDummy = []
    let destroyerDummy = []

    // and object with all the Dummy ship names(key) and an array their locations(value)
    let shipsDummy = {carrierDummy: carrierDummy, cruiserDummy: cruiserDummy, battleshipDummy: battleshipDummy, destroyerDummy: destroyerDummy}

    // Only the ships that are null, i.e. available to drag, drop, and be in the placement box
    let shipsToShow = []

    // A list of locations where ships have already been placed. Essentially if shipsDummy was one long array of all the values.
    let occupiedBoxArray = []

    //whether you are in vertical placement mode or horizontal placement mode, controlled by radio button and XX function
    let horzVertz = "H"

    //this is set every time you begin a drag event and sets this to the current event target (i.e. the ship you're moving)
    // this is set back to null on 'drop' event
    let currentDraggedItem = null;

    //****************************Function Creation *****************************//

        //****functions in 'BEGIN' phase or just re-used throughout game play****//

    //DOES: Creates the blank HTML table for your board and your opponents board
    //PARAMS:
    //DEPENDENCIES:
    //DOM MANIPULATION: #yourBoard, #opponentBoard
    function createBlankBoards() {
        //html for the <thead> tag
        let tHead = "<thead><tr> <th scope='col'> </th> <th scope='col'>A</th></th> <th scope='col'>B</th></th> <th scope='col'>C</th></th> <th scope='col'>D</th></th> <th scope='col'>E</th></th> <th scope='col'>F</th></th> <th scope='col'>G</th></th> <th scope='col'>H</th></th> <th scope='col'>I</th></th> <th scope='col'>J</th> </tr></thead>"
        //html for the cells inside one table row, excluding the label on the left
        let rowsHtml = `<td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td><td data-box0="no" data-box1="no" data-box2="no" data-box3="no"data-box4="no" data-box5="no"> </td>`

        //loop for creating multiple rows using rowsHtml, with label on left//
        let innerTbody = ""
        for(i=1; i<11; i++) {
            innerTbody += ("<tr><th scope='row'>"+ i +"</th>" + rowsHtml + "</tr>")
        }
        //filling the <table> tag for your board
        $('#yourBoard').html(`${tHead} <tbody> ${innerTbody} </tbody>`)

        //this does the same as above, but for the opponent board
        tHead = "<thead><tr> <th scope='col'> </th> <th scope='col'>A</th></th> <th scope='col'>B</th></th> <th scope='col'>C</th></th> <th scope='col'>D</th></th> <th scope='col'>E</th></th> <th scope='col'>F</th></th> <th scope='col'>G</th></th> <th scope='col'>H</th></th> <th scope='col'>I</th></th> <th scope='col'>J</th> </tr></thead>"
        rowsHtml = "<td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td>"
        //for loop for inside the <tbody>//
        innerTbody = ""
        for(i=1; i<11; i++) {
            innerTbody += ("<tr><th scope='row'>"+ i +"</th>" + rowsHtml + "</tr>")
        }
        $('#opponentBoard').html(`${tHead} <tbody> ${innerTbody} </tbody>`)
    }

    //DOES: writing into #messageBoard in a typing animation
    //PARAMS: text - string, text to appear in the #messageBoard; speed- int, time to wait before 'printing' a new character
    //DEPENDENCIES: called by typeWriter();
    //DOM MANIPULATION: fills in text on #messageBoard
    function typeOut(text, speed) {
       setTimeout(function() {$("#messageBoard").text(text)}, speed)
    }

    //DOES: basically a wrapper for typeOut function to type into #messageBoard after timeout
    //PARAMS: message - string, message to be typed into #messageBoard
    //DEPENDENCIES: called in loadGameInfo() and shipsSunk() upon game over
    //DOM MANIPULATION: #messageBoard downstream
    function typeWriter (message) {
        text=""
        for(i=0;i<message.length; i++) {
            speed = 50 * (i+1)
            text += message.charAt(i)
            typeOut(text, speed)
        }
    }

    //just calls showDivs on #boardSlidesLeft or #boardSlidesRight click
    function plusDivs(n) {
        showDivs(slideIndex += n);
    }

    //DOES: changes between 'slides' to display your board or opponent board
    //PARAMS: slidesNo - int, which slide number you are on
    //DEPENDENCIES: called by plusDivs which is triggered by click event on #boardSlidesLeft or #boardSlidesRight;
    //DOM MANIPULATION: .boardSlides; triggered by #boardSlidesLeft or #boardSlidesRight on click;
    function showDivs(slideNo) {
        let slides = $(".boardSlides");
        //if you go too far right or left, this will keep you in the loop of slides
        if (slideNo > slides.length) {
            slideIndex = 1
        }
        if (slideNo < 1) {
            slideIndex = slides.length;
        }
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        slides[slideIndex-1].style.display = "block";
    }

    //DOES: Adding some styling and text around the boards to make it easier for the user to determine which board their actions should happen to
    //PARAMS: board - int, 1 for your board and 2 for opponent board; disEn- int, 0 to disable, 1 to enable; message- message to display above the board as to why its disabled;
    //DEPENDENCIES: called in shipsSunk() and loadGameInfo()
    //DOM MANIPULATION: #yourBoardDisable, #opponentBoardDisable, #yourBoard, #opponentBoard
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


        //****functions in 'SHIP BUILD' phase****//


    //DOES: fills the box of ships to place with appropriate ship images during ship build phase
    //PARAMS:
    //DEPENDENCIES: uses global variables shipsToShow, shipsDummy, occupiedBoxArray, horzVertz; calls addDragListeners()
    //DOM MANIPULATION: #carrierPic, #removeCarrierBtn, #battleshipPic, #removeBattleshipBtn, #cruiserPic, #removeCruiserBtn, #destroyerPic, #removeDestroyerBtn, #saveBtn
    function fillShipsToBuildBox() {
        //check which ships are available for the list of shipsToShow
        shipsToShow = []
        for (var key in shipsDummy) {
            if (shipsDummy[key].length == 0) {
                shipsToShow.push(key)
            } else {
                //ensuring if a ship in shipsDummy is not null that its locations are in the occupiedBoxArray
                for (let i=0; i<shipsDummy[key]; i++) {
                    occupiedBoxArray.push(shipsDummy[key][i])
                }
            }
        }

        //setting up the box of ships to place
        ["carrier", "battleship", "cruiser", "destroyer"].forEach(function(ship) {
            //all the different string interpolations needed
            let dummyVar = ship+"Dummy"
            let shipCapitalized = ship.charAt(0).toUpperCase() + ship.slice(1);
            let picIdSelector = "#"+ship+"Pic"
            let imageId = ship+"DragItem"+horzVertz
            let imageSource = "/"+ship+"Whole"+horzVertz+".png"
            let dataShipAttr
            let removeIdSelector = "#remove"+shipCapitalized+"Btn"
            let removeId = "remove"+shipCapitalized+"Btn"
            if(ship=="carrier") {
                dataShipAttr = "ca"+horzVertz;
            }
            if (ship=="battleship" || ship == "cruiser") {
                dataShipAttr = "ba"+horzVertz;
            }
            if (ship == "destroyer") {
                dataShipAttr = "de"+horzVertz;
            }
            //if the ship is available, show the ship either vertically or horizontally depending on horzVertz
            if (shipsToShow.includes(dummyVar)) {
                $(picIdSelector).html(`<img id="${imageId}" data-ship="${dataShipAttr}" draggable="true" class="img-fluid" style="max-height:120px"  src="${imageSource}" alt="ship pic" />`)
            //if the ship is not available, show a button to remove the ship from the board
            } else {
                $(picIdSelector).html(`<button id="${removeId}" class="btn btn-light">Remove ${shipCapitalized}</button>`);
                $(removeIdSelector).click(function() {
                    removeShip(ship);
                });
            }
        })
        addDragListeners()
        //if there are no ships to show, enable the ability to save ships to the repo
        if (shipsToShow.length == 0) {
            $('#saveShipsBtn').prop('disabled', false)
        } else {
            $('#saveShipsBtn').prop('disabled', true)
        }
    }


    //DOES: adds drag event listeners to the ship images
    //PARAMS:
    //DEPENDENCIES: uses global variables shipsToShow, currentDraggedItem; called by fillShipsToBuildBox() and calls addDropListeners()
    //DOM MANIPULATION: #carrierDragItem${horzVertz}, #battleshipDragItem${horzVertz}, #cruiserDragItem${horzVertz}, #destroyerDragItem${horzVertz}
    function addDragListeners() {
         ["carrier", "battleship", "cruiser", "destroyer"].forEach(function(ship) {
            let shipImageId = "#"+ship+"DragItem"+horzVertz;
            let dummyVar = ship+"Dummy"

            //add dragstart and dragend listeners to ships and set currentDraggedItem
            if (shipsToShow.includes(dummyVar)) {
                $(shipImageId).on('dragstart', function(e) {
                    console.log('dragstart')
                    setTimeout(function () {
                        currentDraggedItem = $(shipImageId);
                        $(shipImageId).hide()
                    }, 0);
                });
                $(shipImageId).on('dragend', function(e) {
                    console.log('dragend')
                    setTimeout(function() {
                        currentDraggedItem = null;
                        $(shipImageId).show()
                    }, 0);
                })
            }

         })
        addDropListeners()
    }


    //DOES: Adds data attributes to the td cells in your board that determine which ships are allowed to be placed there
    //      First clears all data attributes, then adds them back, so long as they don't conflict with a ship already placed. Doesn't actually add any event listeners.
    //PARAMS:
    //DEPENDENCIES: uses global variables occupiedBoxArray; triggered by add DragListeners() and upstream, fillShipsToBuildBox()
    //DOM MANIPULATION: #yourBoard and all <td> cells in it
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

    //DOES: sets up drop event listeners on <td> cells in your board that will check the data-attributes attached by addDropListeners() and determine legal placement.
    //      if starter cell is legal it will move onto other functions to handle what to do with a drop (i.e. place the ship in thr right boxes).
    //PARAMS:
    //DEPENDENCIES: uses global variables currentDraggedItem; called in loadGameInfo(); calls shipPlacementProcessor;
    //DOM MANIPULATION: #yourBoard and all <td> cells in it
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

                //add a class to each td cell which says what cell it is (used as 'starter cell' in shipPlacementProcessor upon placement)
                let currentTdCell = i.toString() +"-"+j.toString()
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).addClass(currentTdCell);

                //adding on drop listener which will trigger shipPlacementProcessor() if data attributes match on <td> cell and currentDraggedItem
                $("#yourBoard").find("tbody tr").eq(i+0).children().eq(j+1).on('drop', function(e) {
                    for(let i=0; i<6; i++) {
                        let dtag = 'data-box' + i
                        if(e.target.getAttribute(dtag) == currentDraggedItem[0].dataset.ship) {
                            console.log('dropped')
                            shipPlacementProcessor(currentDraggedItem[0].getAttribute('id'), e.target.classList[0])
                        }
                    }
                });
            }
        }
    }

    //DOES: places the ship being dragged and dropped into the correct place, if all ship locations are legal
    //PARAMS: ship- id of the item being dragged (ship image); starterCell- data attribute on the <td> tag where the drop event listener was triggered
    //DEPENDENCIES: uses global variables shipDummy; called by dropEventHandler() on drop event; calls illegalPlacementNotice() and blockingCellswithShip();
    //DOM MANIPULATION:
    function shipPlacementProcessor(ship, starterCell) {
        let shipLength

        //process starter cell into row and column
        //note to developer - starterCell data attribute describes down first then over
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
            //check to ensure that this is a legal placement for all locations. if placement is legal...
            if (illegalPlacementNotice(carrierDummy)) {
                //..add the locations to occupiedBoxArray and remove data-ship from those locations//
                blockingCellsWithShip(carrierDummy)
                //place the images of the ship in the appropriate cells
                createShip(carrierDummy, 'carrier', horzVertz)
                //update the box of available ships to reflect recent ship placement. This triggers addDropListeners() so that occupied cells can no longer trigger a drop event
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

    //DOES: Ensures each <td> cell in the ship placement is not conflicting with another ship (not just starterCell)
    //PARAMS: dummyArray - array of locations the ship will potentially take up
    //DEPENDENCIES: uses global variable occupiedBoxArray; called inside shipPlacementProcessor(); returns true if placement is legal, false if placement is illegal;
    //DOM MANIPULATION:
    function illegalPlacementNotice(dummyArray) {
        for (i=0;i<dummyArray.length;i++) {
            if(occupiedBoxArray.includes(dummyArray[i])) {
                console.log('ILLEGAL PLACEMENT')
                alert('Sorry, you may not place your ship there, as it will conflict with another ship already placed.')
                return false
            }
        } return true
    }

    //DOES: remove data attributes from td cells that contain a placed ship so that you cannot place ships there
    //PARAMS: dummyArray - array of locations the ship will potentially take up
    //DEPENDENCIES: uses global variable occupiedBoxArray; called inside shipPlacementProcessor();
    //DOM MANIPULATION: #yourBoard and <td> cells inside
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

    //DOES: removes the ship images from the <td> cells where the ship was
    //PARAMS: ship - string with the name of the ship to be removed
    //DEPENDENCIES: uses global variable shipsDummy, occupiedBoxArray; triggered by a 'Remove' button; calls addDropListenersBack() and fillShipsToBuildBox()
    //DOM MANIPULATION: #yourBoard and <td> cells in it;
    function removeShip(ship) {
        let dummyVar
        if (ship == 'carrier') {
            dummyVar = carrierDummy;
        } else if (ship == 'battleship') {
            dummyVar = battleshipDummy;
        } else if (ship == 'cruiser') {
            dummyVar = cruiserDummy;
        } else {
            dummyVar = destroyerDummy;
        }

        //for each location that the ship occupies...
        for (i=0; i<dummyVar.length;i++) {
            row = parseInt(dummyVar[i][0])
            col = parseInt(dummyVar[i][2])
            //..clear the cells of the image of the ship..
            $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': 'none'});
            //..remove the ship's location from the occupiedBoxArray..
            if(occupiedBoxArray.includes(dummyVar[i])) {
                let index = occupiedBoxArray.indexOf(dummyVar[i]);
                occupiedBoxArray.splice(index, 1)
            }
            //..return data-ship of the cells back to normal..
            addDropListenersBack(dummyVar[i])
        }

        //set dummy variable of the ship back to none so that it can be...
        let placeholder = dummyVar.length
        for (i=0;i<placeholder;i++) {
            dummyVar.pop()
        }
        //..refilled in the box to be placed again
        fillShipsToBuildBox()
    }

    //DOES: adds the data attributes used for drop listeners back to cells where a ship used to be that was removed
    //PARAMS: loc - String, location with row and column of a cell where a ship is
    //DEPENDENCIES: called within removeShip();
    //DOM MANIPULATION: #yourBoard and <td> cells in it
    function addDropListenersBack(loc) {
        row = parseInt(loc[0])
        col = parseInt(loc[2])
        //array of boxes that can have this type of listener for legal placement
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


    //DOES: places images of a ship into the correct cells to 'create a ship' on yourBoard
    //PARAMS: dummyArray- array of locations(string) to place the ship in; ship- string, name of the ship being created; horzVertz - string, "H" fo horizontal or "V" for vertical
    //DEPENDENCIES: uses global variables shipsDummy; called in setUpGrid() (which is called by loadGameInfo upstream) and shipPlacementProcessor();
    //DOM MANIPULATION: #yourBoard and <td> cells in it
    function createShip(dummyArray, ship, horzVertz) {
        //these types of ship images face a different way, so the array needs to be in a dif order
        if(horzVertz == 'V') {
            if(ship == 'carrier' || ship == 'battleship') {
                if(dummyArray[0][0] < dummyArray[1][0]) {
                    dummyArray.reverse()
                }
            }
        }
        //fill in ship tail - this belongs in starter-cell since they're backwards
        let row = parseInt(dummyArray[0][0])
        let col = parseInt(dummyArray[0][2])
        let imageUrl = "/"+ship+"Tail"+horzVertz+".png"
        $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': `url(${imageUrl})`, "background-size": "cover"});

        //fill in ship head
        row = parseInt(dummyArray[dummyArray.length-1][0])
        col = parseInt(dummyArray[dummyArray.length-1][2])
        imageUrl = "/"+ship+"Head"+horzVertz+".png"
        $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': `url(${imageUrl})`, "background-size": "cover"});

        //fill in ship middle
        for(i=1;i<dummyArray.length-1; i++) {
            row = parseInt(dummyArray[i][0])
            col = parseInt(dummyArray[i][2])
            imageUrl = "/"+ship+"Middle"+horzVertz+".png"
            $("#yourBoard").find("tbody tr").eq(row).children().eq(col+1).css({'background-image': `url(${imageUrl})`, "background-size": "cover"});
        }
    }

    //DOES: adds a bomb image to specific cells on the your board based on 'hitMiss', which is set in the salvo repo during a turn
    //PARAMS: Srow - string, row for the salvo location; Scol- string, column for the salvo location; hitMiss- string, "H" for hit and "M" for miss; board- int, 1 for #yourBoard, 2 for #opponentBoard
    //DEPENDENCIES: called by setUpGrid() (which is called by loadGameInfo upstream)
    //DOM MANIPULATION: #yourBoard and #opponentBoard and <td> cells inside each of them
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

    //DOES: Sets up ships and salvoes that are already in the database on the appropriate board
    //PARAMS: array - array of either ship data or salvo data to get string locs from; shipSalvo - string "ship" for ship and "salvo" for salvo; board- int, 1 for #yourBoard, 2 for #opponentBoard
    //DEPENDENCIES: called by loadGameInfo() ajax call, only during turns mode; calls createShip() or createSalvo();
    //DOM MANIPULATION:
    function setUpGrid(array, shipSalvo, board) {
        let initialLocations = []
        if (shipSalvo == "ship") {
            for (let i=0; i < array.length; i++) {
                let arr = array[i]
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

    //DOES: determines if you're allowed to take a shot or not during the turns round
    //PARAMS: salvoesPlayer1 - array from ajax data; salvoesPlayer2 - array from ajax data
    //DEPENDENCIES: called inside loadGameInfo(); returns 0 if you cannot take a shot and 1 if you can take a shot
    //DOM MANIPULATION:
    function whosTurnIsIt(salvoesPlayer1, salvoesPlayer2) {
        if (salvoesPlayer1.length > salvoesPlayer2.length) {
            console.log('returning zero')
            return 0
        } else {
            console.log('returning one')
            return 1
        }
    }

    //DOES: adds listeners for a click event  to #opponentBoard <td> cells when it is your turn so that you can select the cell you want your shot to go in
    //PARAMS:
    //DEPENDENCIES: uses global variables salvoRowSelected and salvoColSelected; called in loadGameInfo();
    //DOM MANIPULATION: #opponentBoard and <td> cells inside it; enables #sendSalvoBtn; fills #yourSelection with the row and column number currently selected
    function addSalvoListeners() {
        let rows = $("#opponentBoard").find("tbody tr")
        let cols = $("#opponentBoard").find("tbody tr").eq(0).find("td")

        //first gives all cells a class specifying the location of that cell
        for (var i=0; i<rows.length; i++) {
            for (var j=0; j <cols.length; j++) {
                $("#opponentBoard").find("tbody tr").eq(i+0).children().eq(j+1).addClass(i+'-'+j)
            }
        }

        //then adds listeners to highlight cells as they are selected, unhighlight cells as new ones are selected, and print the currently selected cell's row and column at the top
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
                }
            }
        }
    }


        //******* AJAX CALLs AND PHASE LOGIC ********//


    //DOES: Ajax Post; sends data to create a new ship entity in the Ship repo
    //PARAMS: shipList - shipsDummy array of objects goes here
    //DEPENDENCIES: uses global variables gp_id, shipsDummy; called on click event of #saveBtn; reloads page on call;
    //DOM MANIPULATION:
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

    //DOES: Ajax Post; send data to create a new salvo entity in the Salvo repo
    //PARAMS: loc - string, location of salvo; gp_id - string, global var; turnNo - string, turn number of this salvo;
    //DEPENDENCIES: uses global variables gp_id, roundNo(in turnNo) and pageQuery; called on click of #sendSalvoBtn (whos event listener is declared inside loadGameInfo();
    //DOM MANIPULATION:
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

    //DOES: Ajax Get; get who the current gameplayer is (i.e. the logged in player matching the game_view you are on)
    //PARAMS:
    //DEPENDENCIES: sets global variables gp_id, pageQuery, and player1; called in loadGameInfo(); calls shipsSunk() Ajax Get;
    //DOM MANIPULATION:
    function getGamePlayer(callback) {
        $.get('/api/gameplayers')
        .done(function(data){
            for(i=0;i<data.length;i++) {
                game_id = data[i].game_id
                player_id = data[i].player_id
                if (game_id == pageQuery && player_id == player1) {
                    gp_id = data[i].id
                    shipsSunk(gp_id, function(gameOver) {
                        console.log(gameOver)
                        callback(gameOver)
                    })
                }
            }
        })
    }

    //DOES: Ajax Get; check how many ships are sunk for each player
    //PARAMS: gp_id - global variable, string;
    //DEPENDENCIES: uses global variables gp_id, yourShipsSunk, theirShipsSunk, date, roundNo, player2, pageQuery; called by getGamePlayer() and loadGameInfo upstream;
    //              calls typeWriter(), disableAndEnableBoards(), gameIsOver() when the game is determined to be completed
    //DOM MANIPULATION: filling in #date, #round, #yss, #oss with text; hiding #yourTurn; filling text into #messageBoard via typeWriter() and #opponentBoardDisable and #youtBoardDisable via disableAndEnableBoards()
    function shipsSunk(gp_id, callback) {
        $.get(path="/api/shipSunk",
            {game_id: pageQuery,
            gp_id: gp_id})
        .done(function(data, jqXHR) {
            console.log("success")
            //setting how many ships are sunk with ajax data
            yourShipsSunk = data[0]
            theirShipsSunk = data[1]
            //updating the Game Stats
            $('#date').text(`Date: ${date}`);
            $('#round').text(`Round: ${roundNo}`);
            $('#yss').text(`Your ships sunk: ${yourShipsSunk}`);
            $('#oss').text(`${player2}'s ships sunk: ${theirShipsSunk}`);
            //if the game is over
            if(yourShipsSunk==4 || theirShipsSunk==4) {
                $('#yourTurn').hide()
                //shut off all salvo listeners
                let rows = $("#opponentBoard").find("tbody tr")
                let cols = $("#opponentBoard").find("tbody tr").eq(0).find("td")
                for (var i=0; i<rows.length; i++) {
                    for (var j=0; j <cols.length; j++) {
                         $("#opponentBoard").find("tbody tr").eq(i+0).children().eq(j+1).off();
                    }
                }
                let winner;
                console.log('GAME OVER')
                //opponent won
                if(yourShipsSunk==4) {
                    winner = "them"
                    typeWriter(`${player2} sunk all your ships and won! You put up a good fight soldier, but unfortunately, we lost. Click 'Return Home' at the top of the page to start a new game, join a new game, or review your position on the Leader Board.`)
                    disableAndEnableBoards(1,0, "Your Board Disabled: GAME OVER")
                    disableAndEnableBoards(2,0, "Opponent Board Disabled: GAME OVER")
                //you won
                } else {
                    winner= "you"
                    typeWriter(`You sunk all of ${player2}'s ships and won! Congratulations on defending our Navy soldier! Click 'Return Home' at the top of the page to start a new game, join a new game, or review your position on the Leader Board.`)
                    disableAndEnableBoards(1,0, "Your Board Disabled: GAME OVER")
                    disableAndEnableBoards(2,0, "Opponent Board Disabled: GAME OVER")
                }
                //posting score data to Score Repo
                gameIsOver(pageQuery, gp_id, winner)
                callback(true);
            } else {
                callback(false);
            }
        })
        .fail(function() {
            callback(false)
            console.log("failure")
        })
    }

    //DOES: Ajax Post; sends data to create new Score entity in Score repo
    //PARAMS: game_id - string, from pageQuery; gp_id - string, global variable; winner - string, "you" or "them";
    //DEPENDENCIES: uses global variables pageQuery(in params), gp_id; called by shipsSunk();
    //DOM MANIPULATION:
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

//***come back here!!!
    //DOES: Ajax Get; this is the main call to get game information specific to the user logged in.
    //      On success, this ajax call handles most of the game logic to determine what phase of gameplay you are in, as well as state management;
    //PARAMS: pageContext - the hostname and port part of the URL; pageQuery - the id number used in the get to find specific game entity by id;
    //DEPENDENCIES: This function is called upon page load and calls, either directly or indirectly every other function else in the game
    //DOM MANIPULATION:
    function loadGameInfo(pageContext, pageQuery) {
        $.ajax({
            type: 'GET',
            url: `http://${pageContext}/api/game_view/${pageQuery}`,
            success: function(data) {
                console.log(data)
                //add data relevant to this game
                date = data.date
                player1 = data.username1;
                let shipsPlayer1 = data.ships1;
                let salvoesPlayer1 = data.salvoes1;
                if (data.username2 == null) {
                    player2 = "[Waiting for another player to join...]"
                } else {
                    player2 = data.username2;
                }
                //retrieve gamePlayer_id as well as checking shipsSunk
                //checking shipSunk will automatically jump you to Game Over phase if necessary. If the game is not over, move on to determining what
                //      phase of the game you are in.
                getGamePlayer(function(gameOver) {
                    if(gameOver == false) {
                        //**if there are no ships for player1 - condition met to enter build phase**
                        if (shipsPlayer1 == "") {
                            console.log("Enter Build Phase")
                            //ability to see ships to place
                            $('#boxShipsToBuildContainer').show()
                            typeWriter("Let's prepare for battle! Position your ships on your board by dragging and dropping them onto your board. If you are not happy with your ship placement you can remove the ship by clicking the 'remove' button and place it again. Chose if your ships are positioned vertically or horizontally by clicking the radio buttons below. Once all your ships placed, click the 'Save' button below. BEWARE- once you click 'Save' you cannot go back.")
                            //fill ships to place box with available ships
                            //this function triggers adding drag listeners and drop listeners(data attributes)
                            fillShipsToBuildBox();
                            //add actual drop listeners
                            dropEventHandler();
                            //change colors of the board to guide user towards the right board
                            disableAndEnableBoards(1,1, "")
                            disableAndEnableBoards(2,0, "Opponent Board Disabled: you may only place ships on your board")

                        //**if you do have ships, we move along to other phases
                        } else {
                            setUpGrid(shipsPlayer1, "ship", 1); //player1 ships
                            //** if there is not a second player - condition met to enter ships build wait phase. This phase is over when second player joins AND places ships**
                            if (data.username2 == null) {
                                disableAndEnableBoards(1,0, "Your Board Disabled: waiting for Player 2");
                                disableAndEnableBoards(2,0, "Opponent Board Disabled: waiting for Player 2");
                                typeWriter("We are currently waiting for another player to join your game and place their ships. Feel free to start another game or join someone else's game while you wait by clicking 'Return Home' button at the top of the screen and scrolling down to the 'Games' section.")
                            //if there is a second player...
                            } else {
                                //**... and if second player has placed his ships - condition met to enter turns phase**//
                                if (data.shipsExist) {
                                    console.log("Enter Turns Phase")
                                    //set up your ships you have already placed as well as any salvoes you has placed on opponent board in previous rounds
                                    setUpGrid(shipsPlayer1, "ship", 1); //player1 ships
                                    setUpGrid(salvoesPlayer1, "salvo", 2) //player1 salvoes (on p2 ships)
                                    //add salvoes opponent has already placed on your board in previous rounds
                                    let salvoesPlayer2 = data.salvoes2;
                                    setUpGrid(salvoesPlayer2, "salvo", 1); //opponents salvoes on your board
                                    //set appropriate roundNo
                                    roundNo = Math.min(salvoesPlayer1.length, salvoesPlayer2.length)+1

                                    //Within Turns Phase, if it is your turn
                                    if(whosTurnIsIt(salvoesPlayer1, salvoesPlayer2) == 1) {
                                        $("#yourTurn").show()
                                        disableAndEnableBoards(1,1, "");
                                        disableAndEnableBoards(2,1, "");
                                        typeWriter(`Your turn for Round ${roundNo}! Take your shot by clicking a square on your opponents board below. When you are happy with your selection click the 'Fire' button below.`)
                                        addSalvoListeners();
                                        $("#sendSalvoBtn").click(function() {postASalvo(salvoRowSelected+"-"+salvoColSelected, gp_id, roundNo)})
                                        showDivs(2) //setting board
                                    //**Within Turns Phase, if it is not your turn, enter turns wait phase **//
                                    } else {
                                        $('#yourTurn').hide()
                                        disableAndEnableBoards(1,0, "Your Board Disabled: waiting for Player 2");
                                        disableAndEnableBoards(2,0, "Opponent Board Disabled: waiting for Player 2");
                                        typeWriter(`It's ${player2}'s turn to take their shot for this round.`)
                                        //refreshing to check if they have taken their shot
                                        setTimeout(function() {location=""}, 60000)
                                        console.log(`Waiting for ${player2} to take his shot for this round. Refresh page to see if they have`)
                                        showDivs(1) //setting board
                                    }

                                //**.. and second player has not placed his ships, remain in ships build wait phase **//
                                } else {
                                    disableAndEnableBoards(1,0, "Your Board Disabled: waiting for Player 2");
                                    disableAndEnableBoards(2,0, "Opponent Board Disabled: waiting for Player 2");
                                    typeWriter(`${player2} has joined your game! Waiting for ${player2} to place his or her ships.`)
                                    //refreshing to check if they have placed their ships
                                    setTimeout(function() {location=""}, 60000)
                                }
                            }
                        }
                        //despite whatever phase of the game you are in..
                        $('#date').text(`Date: ${date}`);
                        $('#round').text(`Round: ${roundNo}`);
                        $('#yss').text(`Your ships sunk: ${yourShipsSunk}`);
                        $('#oss').text(`${player2}'s ships sunk: ${theirShipsSunk}`);
                        $('#playersDescription').text(`${player1.toUpperCase()} (YOU) v.s. ${player2.toUpperCase()} (PLAYER 2)`)
                        //theres another id for a p tag for anything you want under this header, if needed
                    }
                });
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
        //end of ajax
        });
    }

    //*****************FUNCTION CALLS *******************//

    //listeners to buttons that don't need to be added dynamically
    $('#horizontalRad').click(function() {horzVertz="H"; fillShipsToBuildBox()})
    $('#verticalRad').click(function() {horzVertz="V"; fillShipsToBuildBox()})
    $('#saveShipsBtn').click(function() {postAShip(shipsDummy)})
    $("#returnHome").click(function() {location.href =location.protocol +"//"+location.hostname+":"+location.port+ "/web/games.html"})
    $("#boardSlidesLeft").click(function() {plusDivs(-1)}); //listeners
    $("#boardSlidesRight").click(function() {plusDivs(+1)});

    //start these both off hidden and add them back dynamically as needed
    $('#boxShipsToBuildContainer').hide()
    $('#yourTurn').hide()

    showDivs(slideIndex);//starting slide
    //display your boards on the page
    createBlankBoards();

    //initially getting data for the game. Within this ajax call there is logic to understand what mode of the
    //game you are in, i.e. building ships, waiting for the other player to move, your turn, etc.
    pageContext = window.location.hostname +":"+ window.location.port
    pageQuery = new URLSearchParams(window.location.search).get("gp")
    loadGameInfo(pageContext, pageQuery);

//end of main
});