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

    @ElementCollection
    private List<String> locations;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayer")
    private GamePlayer gamePlayer;

    public Salvo() {}

    public Salvo(int turn_number, GamePlayer gamePlayer, List<String> locations) {
        this.turn_number = turn_number;
        this.gamePlayer = gamePlayer;
        this.locations = locations;
    }

    //Getters
    public long getSalvo_id() {
        return salvo_id;
    }

    public int getTurn_number() {
        return turn_number;
    }

    public List<String> getLocations() {
        return locations;
    }

    @JsonIgnore
    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    //Setters
    public void setSalvo_id(long salvo_id) {
        this.salvo_id = salvo_id;
    }

    public void setTurn_number(int turn_number) {
        this.turn_number = turn_number;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    //toString

    @Override
    public String toString() {
        return "Salvo{" +
                "salvo_id=" + salvo_id +
                ", turn_number=" + turn_number +
                ", locations=" + locations +
                ", gamePlayer=" + gamePlayer +
                '}';
    }
}