$(function() {

     // display text in the output area
        function showOutput(text) {
            $("#output").html(text)
        }

        function showHelper(text) {
                    $("#helper").text(text)
                }

        function loadData() {

            $.get("/api/games")
            .done(function(data) {
            text = ""
            for (let i =0; i< data.length; i++) {
                text += "<li> " + JSON.stringify(data[i].id, null, 2) +"</li>"
                text += "<li>"+ data[i].date + "</li>"
                for(let a=0; a< data[i].gamePlayer.length; a++) {
                    text += "<li>" + JSON.stringify(data[i].gamePlayer[a].player.username, null, 2) + "</li>"
                }

//                for(let a=0; a< gamePlayer.length; a++) {
//                }
            }
            showOutput(text);
            showHelper(JSON.stringify(data, null, 2))
            })

            }

      loadData();

})
