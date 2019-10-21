package com.codeoftheweb.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long player_id;
    private String username;

    @OneToMany(mappedBy = "player", fetch= FetchType.EAGER)
    Set<GamePlayer> gamePlayers;

//    @OneToMany(mappedBy = "player", fetch= FetchType.EAGER)
//    Set<Score> scores;

    @JsonIgnore
    public List<Game> getGames() {
        return gamePlayers.stream().map(sub -> sub.getGame()).collect(Collectors.toList());
    }

    public void addGamePlayer(GamePlayer gamePlayer) {
        gamePlayer.setPlayer(this);
        gamePlayers.add(gamePlayer);
    }

    public Player() {}

    public Player(String username) {
        this.username = username;
    }

    //Getters
    public long getPlayer_id() {
        return player_id;
    }

    public String getUsername() {
        return username;
    }

    @JsonIgnore
    public Set<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }

    //Setters
    public void setPlayer_id(long player_id) {
        this.player_id = player_id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setGamePlayers(Set<GamePlayer> gamePlayers) {
        this.gamePlayers = gamePlayers;
    }

    //toString
    @Override
    public String toString() {
        return "Player{" +
                "player_id=" + player_id +
                ", username='" + username + '\'' +
                ", gamePlayers=" + gamePlayers +
                '}';
    }
}

