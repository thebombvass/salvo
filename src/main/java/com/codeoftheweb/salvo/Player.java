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
    private String password;

    @OneToMany(mappedBy = "player", fetch= FetchType.EAGER)
    Set<GamePlayer> gamePlayers;

    @JsonIgnore
    public List<Game> getGames() {
        return gamePlayers.stream().map(sub -> sub.getGame()).collect(Collectors.toList());
    }

    public void addGamePlayer(GamePlayer gamePlayer) {
        gamePlayer.setPlayer(this);
        gamePlayers.add(gamePlayer);
    }

    public Player() {}

    public Player(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public Player(long player_id, String username, String password) {
        this.player_id = player_id;
        this.username = username;
        this.password = password;
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

    @JsonIgnore
    public String getPassword() {
        return password;
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

    public void setPassword(String password) {
        this.password = password;
    }

    //toString

    @Override
    public String toString() {
        return "Player{" +
                "player_id=" + player_id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}

