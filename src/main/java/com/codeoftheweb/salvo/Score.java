package com.codeoftheweb.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name="native", strategy = "native")
    private long score_id;
    private double score;

    //relations
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name="player_id")
//    private Player player;
//
//    @ManyToOne(fetch = FetchType.EAGER)
//    @JoinColumn(name="game_id")
//    private Game game;

    @OneToOne(cascade = CascadeType.MERGE)
    @JoinColumn(name = "gamePlayer_id", referencedColumnName = "gamePlayer_id")
    private GamePlayer gamePlayer;

//    @OneToOne(mappedBy = "score")
//    private GamePlayer gamePlayer;

    //constructor
    public Score() {}

    public Score(Double score, GamePlayer gamePlayer) {
        this.score = score;
        this.gamePlayer = gamePlayer;
    }

    //Getters

    public long getScore_id() {
        return score_id;
    }

    public double getScore() {
        return score;
    }

    @JsonIgnore
    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    //Setters
    public void setScore_id(long score_id) {
        this.score_id = score_id;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    @Override
    public String toString() {
        return "Score{" +
                "score_id=" + score_id +
                ", score=" + score +
                ", gamePlayer=" + gamePlayer +
                '}';
    }
}
