package com.codeoftheweb.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long game_id;
    private String date;

    @OneToMany(mappedBy = "game", fetch = FetchType.EAGER)
    Set<GamePlayer> gamePlayers;


    public void addGamePlayer(GamePlayer gamePlayer) {
        gamePlayer.setGame(this);
        gamePlayers.add(gamePlayer);
    }

    @JsonIgnore
    public List<Player> getPlayers() {
        return gamePlayers.stream().map(sub -> sub.getPlayer()).collect(Collectors.toList());
    }

    //constructor
    public Game() {}

    public Game(String date) {
        this.date = date;
    }

    //getters
    public long getGame_id() {
        return game_id;
    }

    public String getDate() {
        return date;
    }

    public Set<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }


    //setters
    public void setDate(String date) {
        this.date = date;
    }

    public void setGamePlayers(Set<GamePlayer> gamePlayers) {
        this.gamePlayers = gamePlayers;
    }

    @Override
    public String toString() {
        return "Game{" +
                "game_id=" + game_id +
                ", date='" + date + '\'' +
                ", gamePlayers=" + gamePlayers +
                '}';
    }
}