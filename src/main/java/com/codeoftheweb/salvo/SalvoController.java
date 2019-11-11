package com.codeoftheweb.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.json.GsonBuilderUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class SalvoController {

    //handling who (if anyone) is logged in
    private Optional getUserLogged(Authentication auth){
        Optional <Player> userLogged;
        if(auth==null){
            userLogged = Optional.empty();
        }else{
            userLogged = prepo.findByUsername(auth.getName());
        }
        return userLogged;
    }

    //***for retrieving information from the database ... ***

    //GAME
    @Autowired
    public GameRespository grepo;

    @RequestMapping("/api/games")
    @ResponseBody
    public List<Map<String, Object>> getGames(Authentication authentication) {
        Optional<Player> currentPlayer = getUserLogged(authentication);
        if (currentPlayer.isPresent()) {
            return grepo.findAll().stream().map(game -> makeGameDTO(game, currentPlayer.get())).collect(Collectors.toList());
        } else {
            //TO DO: can you do this without creating a new instance every time?
            Player playa = new Player("null", null);
            return grepo.findAll().stream().map(game -> makeGameDTO(game, playa)).collect(Collectors.toList());
        }

    }

    private Map<String, Object> makeGameDTO(Game game, Player currPlayer) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("currentPlayer", currPlayer);
        dto.put("id", game.getGame_id());
        dto.put("date", game.getDate());
        dto.put("gamePlayer", game.getGamePlayers());
        return dto;
    }

    //PLAYER
    @Autowired
    public PlayerRepository prepo;

    @RequestMapping("/api/players")
    public List<Map<String, Object>> getPlayers() {
        return prepo.findAll().stream().map(player -> makePlayerDTO(player)).collect(Collectors.toList());
    }

    private Map<String, Object> makePlayerDTO(Player player) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", player.getPlayer_id());
        dto.put("username", player.getUsername());
        dto.put("gamePlayer", player.getGamePlayers());
        return dto;
    }

    //GAMEPLAYER
    @Autowired
    public GamePlayerRepository gprepo;

    @RequestMapping("/api/gameplayers")
    public List<Map<String, Object>> getGamePlayers() {
        return gprepo.findAll().stream().map(this::makeGamePlayersDTO).collect(Collectors.toList());
    }

    private Map<String, Object> makeGamePlayersDTO(GamePlayer gamePlayer) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", gamePlayer.getGameplayer_id());
        dto.put("date", gamePlayer.getDate());
        dto.put("game_id", gamePlayer.getGame().getGame_id());
        dto.put("player_id", gamePlayer.getPlayer().getUsername());
        dto.put("ships", gamePlayer.getShips());
        dto.put("salvoes", gamePlayer.getSalvoes());
        dto.put("score", gamePlayer.getScore());
        return dto;
    }

    //SHIP
    @Autowired
    public ShipRepository shrepo;

    @RequestMapping("/api/ships")
    public List<Map<String, Object>> getShips() {
        return shrepo.findAll().stream().map(ship -> makeShipsDTO(ship)).collect(Collectors.toList());
    }

    private Map<String, Object> makeShipsDTO(Ship ship) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", ship.getShip_id());
        dto.put("shipType", ship.getShipType());
        dto.put("gamePlayer", ship.getGamePlayer().getGameplayer_id());
        dto.put("locations", ship.getLocations());
        return dto;
    }

    //SALVO
    @Autowired
    public SalvoRespository sarepo;

    @RequestMapping("/api/salvoes")
    public List<Map<String, Object>> getSalvoes() {
        return sarepo.findAll().stream().map(salvo -> makeSalvoesDTO(salvo)).collect(Collectors.toList());
    }

    private Map<String, Object> makeSalvoesDTO(Salvo salvo) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", salvo.getSalvo_id());
        dto.put("turnNumber", salvo.getTurn_number());
        dto.put("gamePlayer", salvo.getGamePlayer().getGameplayer_id());
        dto.put("locations", salvo.getLocation());
        dto.put("hitMiss", salvo.getHitMiss());
        return dto;
    }

    //GAME VIEW - gives all the info needed for playing an actual game
    @RequestMapping("api/game_view/{nn}")
    public ResponseEntity<Object> showGame(Authentication authentication, @PathVariable Long nn) {
            Optional<Game> game_view = grepo.findById(nn);
            Game game_view1 = game_view.orElse(new Game());

            //Gameplayer set -> Array so that it can be indexed
            List<GamePlayer> mainList = new ArrayList<GamePlayer>();
            mainList.addAll(game_view1.getGamePlayers());

            //making an array of just the usernames
            ArrayList<String> users = new ArrayList<>();
            for (int i=0; i<game_view1.getGamePlayers().size(); i++)  {
                users.add(mainList.get(i).getPlayer().getUsername());
            }

            //checking that someone is logged in
            if (getUserLogged(authentication).isPresent()) {
                Player loggedInPlayer = (Player) getUserLogged(authentication).get();
                String loggedInPlayer1 = loggedInPlayer.getUsername();

                //checking that the person who is logged is at least a part of this game
                if (users.contains(loggedInPlayer1)) {
                    //if current user is in the gameplayer[0] space. Will always happen if there is one player. Will also happen if there are 2 and current user is player[0]
                    if (mainList.get(0).getPlayer().getUsername() == loggedInPlayer1) {
                        return new ResponseEntity<>(makeP0GameView(game_view1, mainList), HttpStatus.ACCEPTED);
                    //will only happen if there is a gp[1] and current user is gp[1]
                    } else {
                        return new ResponseEntity<>(makeP1GameView(game_view1, mainList), HttpStatus.ACCEPTED);
                    }

                //logged in but not a part of this game
                } else {
                    return new ResponseEntity<>("We're sorry, but you are not authorized to access this page. Please visit home and log in to see your games.", HttpStatus.FORBIDDEN);
                }

            //if no one is logged in
            } else {
                return new ResponseEntity<>("We're sorry, but you are not authorized to access this page. Please visit home and log in to see your games.", HttpStatus.FORBIDDEN);
            }
    }

    //Information to return in body if Current user is gp[0]
    private Map<String, Object> makeP0GameView(Game game, List<GamePlayer> gamePlayer) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", game.getGame_id());
        dto.put("date", game.getDate());
        dto.put("username1",gamePlayer.get(0).getPlayer().getUsername());
        dto.put("ships1", gamePlayer.get(0).getShips());
        dto.put("salvoes1", gamePlayer.get(0).getSalvoes());
        //checking if there is a second player or not
        if(gamePlayer.size()>1) {
            dto.put("username2", gamePlayer.get(1).getPlayer().getUsername());
            dto.put("salvoes2", gamePlayer.get(1).getSalvoes());
        } else {
            dto.put("username2", null);
            dto.put("salvoes2", null);
        }
        return dto;
    }

    //Information to return in body if Current user is gp[1]
    private Map<String, Object> makeP1GameView(Game game, List<GamePlayer> gamePlayer) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", game.getGame_id());
        dto.put("date", game.getDate());
        dto.put("username1",gamePlayer.get(1).getPlayer().getUsername());
        dto.put("ships1", gamePlayer.get(1).getShips());
        dto.put("salvoes1", gamePlayer.get(1).getSalvoes());
        dto.put("username2", gamePlayer.get(0).getPlayer().getUsername());
        dto.put("salvoes2", gamePlayer.get(0).getSalvoes());
        return dto;
    }


    //Creating a new user in the db from the user interface
    @Autowired
    private PasswordEncoder passwordEncoder;

    @RequestMapping(path = "/app/players", method = RequestMethod.POST)
    public ResponseEntity<Object> register(
            @RequestParam String username, @RequestParam String password) {

        if (username.isEmpty() || password.isEmpty()) {
            System.out.println("Didn't enter both parameters");
            return new ResponseEntity<>("Missing data", HttpStatus.FORBIDDEN);
        }

        if (prepo.findByUsername(username).isPresent()) {
            System.out.println(prepo.findByUsername(username) + " already exists");
            return new ResponseEntity<>("Name already in use", HttpStatus.FORBIDDEN);
        }

        prepo.save(new Player(username, passwordEncoder.encode(password)));
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    //Creating a new Game in the db from the user interface
    @RequestMapping(path = "/api/games", method = RequestMethod.POST)
    public ResponseEntity<Object> createGame(
            @RequestParam String creator) {
        if (creator == null) {
            return new ResponseEntity<>("Missing data", HttpStatus.FORBIDDEN);
        } else {
            Player player = prepo.findByUsername(creator).orElse(new Player());
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("MM-dd-yyy HH:mm:ss");
            String newDate = formatter.format(date);

            Game game = new Game(newDate);
            GamePlayer gamePlayer = new GamePlayer(newDate, game, player);


            grepo.save(game);
            gprepo.save(gamePlayer);

            return new ResponseEntity<>(game.getGame_id(), HttpStatus.CREATED);
        }
    }

    //adding a player2 who wants to join to a newly created game (a.k.a adding a gameplayer to the db via ui)
    @RequestMapping(path = "/api/gameplayers", method = RequestMethod.POST)
    public ResponseEntity<Object> joinGame(
            @RequestParam String game_id, @RequestParam String username) {
        if (game_id == null) {
            return new ResponseEntity<>("Missing data", HttpStatus.FORBIDDEN);
        } else if (username == null) {
            return new ResponseEntity<>("Missing data", HttpStatus.FORBIDDEN);
        } else {
            //getting the game
            Long game_id1 = Long.parseLong(game_id);
            Game game = grepo.findById(game_id1).orElse(new Game());

            //getting the player currently logged in
            Player player = prepo.findByUsername(username).orElse(new Player());

            //getting current date
            Date date = new Date();
            SimpleDateFormat formatter = new SimpleDateFormat("MM-dd-yyy HH:mm:ss");
            String newDate = formatter.format(date);

            //creating new Gameplayer
            GamePlayer gamePlayer = new GamePlayer(newDate, game, player);
            gprepo.save(gamePlayer);
            return new ResponseEntity<>(gamePlayer.getGameplayer_id(), HttpStatus.CREATED);
        }
    }

    @RequestMapping(path = "/api/ships", method = RequestMethod.POST)
    public ResponseEntity<Object> placeShips(
            //string username maybe change? linked to GP not P
            @RequestParam String gamePlayer_id, @RequestParam String ship, @RequestParam(value="locs[]") List<String> locs) {
        if (gamePlayer_id.isEmpty() || ship.isEmpty() || locs.isEmpty()) {
            System.out.println("Missing information in ship creation");
            return new ResponseEntity<>("Missing data", HttpStatus.FORBIDDEN);
        }

        Optional<GamePlayer> thegp = gprepo.findById(Long.parseLong(gamePlayer_id));
        Ship ship2 = new Ship(ship,thegp.orElse(new GamePlayer()),locs);
        shrepo.save(ship2);
        return new ResponseEntity<>(ship2, HttpStatus.CREATED);
    }

    @RequestMapping(path = "/api/salvoes", method=RequestMethod.POST)
    public ResponseEntity<Object> addSalvo(Authentication authentication,
            @RequestParam String gamePlayer_id, @RequestParam String turnNo,
            @RequestParam String loc, @RequestParam String gameId) {
        if (getUserLogged(authentication).isPresent()) {
            //find the proper gameplayer matching the id given
            Optional<GamePlayer> thegp = gprepo.findById(Long.parseLong(gamePlayer_id));

            //**TO DO - this is where I would add an UPDATE to a ship to add 'hits' and determine if its sunk or not
            //** problem is, how do we know if a shot is a hit or miss? this logic must be added in java//
            Game theGame = grepo.findById(Long.parseLong(gameId)).orElse(new Game());

            String hitMiss = "";

            //Gameplayer set -> Array so that it can be indexed
            List<GamePlayer> mainList = new ArrayList<GamePlayer>();
            mainList.addAll(theGame.getGamePlayers());
            if(mainList.get(0).getGameplayer_id() == Long.parseLong(gamePlayer_id)) {

                //getting opponents ships
                List<Ship> oppShips = new ArrayList<>();
                oppShips.addAll(mainList.get(1).getShips());
                for (int i=0; i<oppShips.size(); i++) {
                   Long shipId = oppShips.get(i).getShip_id();
                   for(int j=0; j<oppShips.get(i).getLocations().size(); j++) {
                       if (loc == oppShips.get(i).getLocations().get(j)) {
                           hitMiss= "H";
                           //** TO DO: add here to update the ship using shipId that you got above to add hit
                       }
                   }
                }
                if (hitMiss == "") {
                    hitMiss = "M";
                }

            } else if (mainList.get(1).getGameplayer_id() == Long.parseLong(gamePlayer_id)) {
                //**TO DO: add the shit here, same as the if above this. Also test w some souts if this even works
                mainList.get(0).getShips(); //THIS GET changed to UPDATE. perhaps get ship id here and update elsewhere?
            }


            //create the salvo
            Salvo salvo2 = new Salvo(Integer.parseInt(turnNo), thegp.orElse(new GamePlayer()), loc, hitMiss);
            sarepo.save(salvo2);

            return new ResponseEntity<>(salvo2, HttpStatus.CREATED);
            //alter ship
        } else {
            return new ResponseEntity<>("We're sorry, but you are not authorized to access this page. Please visit home and log in to see your games.", HttpStatus.FORBIDDEN);
        }
    }

}
