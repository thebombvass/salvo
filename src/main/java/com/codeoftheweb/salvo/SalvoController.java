package com.codeoftheweb.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
public class SalvoController {

    //GAME
    @Autowired
    public GameRespository grepo;

    @RequestMapping("/api/games")
    public List<Map<String, Object>> getGames() {
        return grepo.findAll().stream().map(game -> makeGameDTO(game)).collect(Collectors.toList());
    }

    private Map<String, Object> makeGameDTO(Game game) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", game.getGame_id());
        dto.put("date", game.getDate());
        dto.put("gamePlayer", game.getGamePlayers());
        return dto;
    }

    //PLAYER
    @Autowired
    public PlayerRepository prepo;

    @RequestMapping("/api/players")
    public List<Player> getPlayers() {
        return prepo.findAll();
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
    public List <Map<String, Object>> getSalvoes() {
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
    @ResponseBody
    public Game findGP(@PathVariable Long nn) {

        Optional<Game> game_view = grepo.findById(nn);
        Game game_view1 = game_view.orElse(new Game());
        return game_view1;
    }
}