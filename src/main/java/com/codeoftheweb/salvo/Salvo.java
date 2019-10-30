package com.codeoftheweb.salvo;


import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.List;

@Entity
public class Salvo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long salvo_id;
    private int turn_number;
    private String hitMiss;
    private String location;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayer")
    private GamePlayer gamePlayer;

    public Salvo() {}

    public Salvo(int turn_number, GamePlayer gamePlayer, String location, String hitMiss) {
        this.turn_number = turn_number;
        this.gamePlayer = gamePlayer;
        this.location = location;
        this.hitMiss = hitMiss;
    }


    //Getters
    public long getSalvo_id() {
        return salvo_id;
    }

    public int getTurn_number() {
        return turn_number;
    }

    public String getLocation() {
        return location;
    }

    @JsonIgnore
    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    public String getHitMiss() {
        return hitMiss;
    }


    //Setters
    public void setSalvo_id(long salvo_id) {
        this.salvo_id = salvo_id;
    }

    public void setTurn_number(int turn_number) {
        this.turn_number = turn_number;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    public void setHitMiss(String hitMiss) {
        this.hitMiss = hitMiss;
    }

    //toString

    @Override
    public String toString() {
        return "Salvo{" +
                "salvo_id=" + salvo_id +
                ", turn_number=" + turn_number +
                ", hitMiss='" + hitMiss + '\'' +
                ", location=" + location +
                ", gamePlayer=" + gamePlayer +
                '}';
    }
}