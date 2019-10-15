package com.codeoftheweb.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.Set;

@Entity
public class GamePlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long gameplayer_id;
    private String date;

    //relations
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id")
    private Player player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game_id")
    private Game game;

    @OneToMany(mappedBy = "gamePlayer", fetch = FetchType.EAGER)
    Set<Ship> ships;

    //constructor
    public GamePlayer() {}

    public GamePlayer(String date, Game game, Player player) {
        this.date = date;
        this.game = game;
        this.player= player;
    }

    //Getters
    public long getGameplayer_id() {
        return gameplayer_id;
    }

    public String getDate() {
        return date;
    }

    @JsonIgnore
    public Game getGame() {
        return game;
    }

    public Player getPlayer() {
        return player;
    }

    public Set<Ship> getShips() {
        return ships;
    }

    //Setters
    public void setDate(String date) {
        this.date = date;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public void setShips(Set<Ship> ships) {
        this.ships = ships;
    }

    @Override
    public String toString() {
        return "GamePlayer{" +
                "gameplayer_id=" + gameplayer_id +
                ", date='" + date + '\'' +
                ", player=" + player +
                ", game=" + game +
                ", ships=" + ships +
                '}';
    }
}