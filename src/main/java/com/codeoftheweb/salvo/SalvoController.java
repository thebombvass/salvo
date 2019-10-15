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

    @Autowired
    public PlayerRepository prepo;

    @RequestMapping("/api/players")
    public List<Player> getPlayers() {
        return prepo.findAll();
    }

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
        return dto;
    }


    @Autowired
    public ShipRepository srepo;

    @RequestMapping("/api/ships")
    public List<Map<String, Object>> getShips() {
        return srepo.findAll().stream().map(ship -> makeShipsDTO(ship)).collect(Collectors.toList());
    }

    private Map<String, Object> makeShipsDTO(Ship ship) {
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", ship.getShip_id());
        dto.put("shipType", ship.getShipType());
        dto.put("gamePlayer", ship.getGamePlayer().getGameplayer_id());
        dto.put("locations", ship.getLocations());
        return dto;
    }

    @RequestMapping("api/game_view/{nn}")
    public GamePlayer findGP(@PathVariable Long nn) {

        Optional<GamePlayer> gp = gprepo.findById(nn);
        GamePlayer gp1 = gp.orElse(new GamePlayer());
        return gp1;
    }

}