package com.codeoftheweb.salvo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@SpringBootApplication
public class SalvoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	// ***** creating all the objects for test data *****//
	//creating dates in the right format
	Date date = new Date();
	Date date2 = Date.from(date.toInstant().plusSeconds(3600));
	Date date3 = Date.from(date2.toInstant().plusSeconds(3600));

	SimpleDateFormat formatter = new SimpleDateFormat("MM-dd-yyy HH:mm:ss");
	String newDate = formatter.format(date);
	String newDate2 = formatter.format(date2);
	String newDate3 = formatter.format(date3);

	//creating games
	Game game1 = new Game(newDate);
	Game game2 = new Game(newDate2);

	//creating players
	Player player1 = new Player("mevomvas@bu.edu");
	Player player2 = new Player("art.vomvas@gmail.com");
	Player player3 = new Player("paullywallnuts@gmail.com");

	//creating gamePlayers
	GamePlayer gamePlayer1 = new GamePlayer(newDate, game1, player1);
	GamePlayer gamePlayer2 = new GamePlayer(newDate, game1, player2);
	GamePlayer gamePlayer3 = new GamePlayer(newDate2, game2, player1);
	GamePlayer gamePlayer4 = new GamePlayer(newDate2, game2, player3);

	//creating locations (they're all gonna have the same board to start)
	List<String> cruiserlocs = Arrays.asList("H2", "H3", "H4");
	List<String> submarinelocs = Arrays.asList("B5", "C5", "D5");
	List<String> destroyerlocs = Arrays.asList("G9", "G10");
	List<String> aircraftcarrierlocs = Arrays.asList("D7", "E7", "F7", "G7", "H7");

	//creating ships for GP1
	Ship ship1 = new Ship("cruiser", gamePlayer1, cruiserlocs);
	Ship ship2 = new Ship("submarine", gamePlayer1, submarinelocs);
	Ship ship3 = new Ship("destroyer", gamePlayer1, destroyerlocs);
	Ship ship4 = new Ship("aircraftcarrier", gamePlayer1, aircraftcarrierlocs);

	//creating ships for GP2
	Ship ship5 = new Ship("cruiser", gamePlayer2, cruiserlocs);
	Ship ship6 = new Ship("submarine", gamePlayer2, submarinelocs);
	Ship ship7 = new Ship("destroyer", gamePlayer2, destroyerlocs);
	Ship ship8 = new Ship("aircraftcarrier", gamePlayer2, aircraftcarrierlocs);

	//creating ships for GP3
	Ship ship9 = new Ship("cruiser", gamePlayer3, cruiserlocs);
	Ship ship10 = new Ship("submarine", gamePlayer3, submarinelocs);
	Ship ship11 = new Ship("destroyer", gamePlayer3, destroyerlocs);
	Ship ship12 = new Ship("aircraftcarrier", gamePlayer3, aircraftcarrierlocs);

	//creating ships for GP1
	Ship ship13 = new Ship("cruiser", gamePlayer4, cruiserlocs);
	Ship ship14 = new Ship("submarine", gamePlayer4, submarinelocs);
	Ship ship15 = new Ship("destroyer", gamePlayer4, destroyerlocs);
	Ship ship16 = new Ship("aircraftcarrier", gamePlayer4, aircraftcarrierlocs);

	//creating salvo locations (they're all gonna have the same board to start)
	List<String> salvolocs = Arrays.asList("A1", "D4", "H4", "H8", "B9");

	//creating salvos for GP1-4
	Salvo salvo1 = new Salvo(1, gamePlayer1, salvolocs);
	Salvo salvo2 = new Salvo(1, gamePlayer2, salvolocs);
	Salvo salvo3 = new Salvo(1, gamePlayer3, salvolocs);
	Salvo salvo4 = new Salvo(1, gamePlayer4, salvolocs);

	// ***** adding test objects/data to the repos *****//
	@Bean
	public CommandLineRunner initData(GameRespository gameRepository, PlayerRepository playerRepository, GamePlayerRepository gamePlayerRepository, ShipRepository shipRepository, SalvoRespository salvoRespository) {
		return (args) -> {
			gameRepository.save(game1);
			gameRepository.save(game2);

			playerRepository.save(player1);
			playerRepository.save(player2);
			playerRepository.save(player3);

			gamePlayerRepository.save(gamePlayer1);
			gamePlayerRepository.save(gamePlayer2);
			gamePlayerRepository.save(gamePlayer3);
			gamePlayerRepository.save(gamePlayer4);

			shipRepository.save(ship1);
			shipRepository.save(ship2);
			shipRepository.save(ship3);
			shipRepository.save(ship4);
			shipRepository.save(ship5);
			shipRepository.save(ship6);
			shipRepository.save(ship7);
			shipRepository.save(ship8);
			shipRepository.save(ship9);
			shipRepository.save(ship10);
			shipRepository.save(ship11);
			shipRepository.save(ship12);
			shipRepository.save(ship13);
			shipRepository.save(ship14);
			shipRepository.save(ship15);
			shipRepository.save(ship16);

			salvoRespository.save(salvo1);
			salvoRespository.save(salvo2);
			salvoRespository.save(salvo3);
			salvoRespository.save(salvo4);
		};
	}



}
