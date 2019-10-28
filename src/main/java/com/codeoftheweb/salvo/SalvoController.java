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

import java.util.*;
import java.util.stream.Collectors;

@RestController
public class SalvoController {

    private Optional getUserLogged(Authentication auth){
        System.out.println("here");
        System.out.println(auth);
        Optional <Player> userLogged;
        if(auth==null){
            userLogged = Optional.empty();
        }else{
            userLogged = prepo.findByUsername(auth.getName());
        }
        return userLogged;
    }

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
            //TO DO: can you do this without creating a new instance everytime?
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
        dto.put("player_id", gamePlayer.getPlayer().getPlayer_id());
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
        dto.put("locations", salvo.getLocations());
        return dto;
    }


    //GAME VIEW
    @RequestMapping("api/game_view/{nn}")
    public ResponseEntity<Object> showGame(Authentication authentication, @PathVariable Long nn) {
            Optional<Game> game_view = grepo.findById(nn);
            Game game_view1 = game_view.orElse(new Game());
            String user1 = game_view1.getPlayers().get(0).getUsername();
            String user2 = game_view1.getPlayers().get(1).getUsername();
            if (getUserLogged(authentication).isPresent()) {
                Player loggedInPlayer = (Player) getUserLogged(authentication).get();
                String loggedInPlayer1 = loggedInPlayer.getUsername();
                if (loggedInPlayer1 == user1 || loggedInPlayer1 == user2) {
                    return new ResponseEntity<>(game_view1, HttpStatus.ACCEPTED);
                } else {
                    return new ResponseEntity<>("We're sorry, but you are not authorized to access this page. Please visit home and log in to see your games.", HttpStatus.FORBIDDEN);
                }
            } else {
            return new ResponseEntity<>("We're sorry, but you are not authorized to access this page. Please visit home and log in to see your games.", HttpStatus.FORBIDDEN);
            }
    }


    //Create a new User
    @Autowired
    private PasswordEncoder passwordEncoder;

    @RequestMapping(path = "/app/players", method = RequestMethod.POST)
    public ResponseEntity<Object> register(
            @RequestParam String username, @RequestParam String password) {
        System.out.println(username + " , "+ password);

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

}
