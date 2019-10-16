package com.codeoftheweb.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.List;

@Entity
public class Ship {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long ship_id;
    private String shipType;


    @ElementCollection
    private List<String> locations;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayer")
    private GamePlayer gamePlayer;

    public Ship() {}

    public Ship(String shipType, GamePlayer gamePlayer, List<String> locations) {
        this.shipType = shipType;
        this.gamePlayer = gamePlayer;
        this.locations = locations;
    }

    //Getters
    public long getShip_id() {
        return ship_id;
    }

    public String getShipType() {
        return shipType;
    }

    @JsonIgnore
    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    public List<String> getLocations() {
        return locations;
    }

    //Setters
    public void setShip_id(long ship_id) {
        this.ship_id = ship_id;
    }

    public void setShipType(String shipType) {
        this.shipType = shipType;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

    //toString

    @Override
    public String toString() {
        return "Ship{" +
                "ship_id=" + ship_id +
                ", shipType='" + shipType + '\'' +
                ", locations=" + locations +
                ", gamePlayer=" + gamePlayer +
                '}';
    }
}
