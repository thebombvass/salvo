package com.codeoftheweb.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import javax.servlet.http.HttpServletRequest;



import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.text.SimpleDateFormat;
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
	Game game3 = new Game(newDate);

	//creating players
	Player player1 = new Player("meg@bu.edu", PasswordEncoderFactories.createDelegatingPasswordEncoder().encode("123"));
	Player player2 = new Player("art@gmail.com",  PasswordEncoderFactories.createDelegatingPasswordEncoder().encode("123"));
	Player player3 = new Player("paul@gmail.com",  PasswordEncoderFactories.createDelegatingPasswordEncoder().encode("123"));

	//creating gamePlayers
	GamePlayer gamePlayer1 = new GamePlayer(newDate, game1, player1);
	GamePlayer gamePlayer2 = new GamePlayer(newDate, game1, player2);
	GamePlayer gamePlayer3 = new GamePlayer(newDate2, game2, player1);
	GamePlayer gamePlayer4 = new GamePlayer(newDate2, game2, player3);
	GamePlayer gamePlayer5 = new GamePlayer(newDate, game3, player1);

	//creating locations (they're gonna be mostly the same to start)
	List<String> cruiserlocs = Arrays.asList("7-4", "7-3", "7-2");
	List<String> battleshiplocs = Arrays.asList("1-5", "2-5", "3-5");
	List<String> destroyerlocs = Arrays.asList("6-9", "6-8");
	List<String> carrierlocs = Arrays.asList("2-7", "3-7", "4-7", "5-7", "6-7");

	List<String> cruiserlocs1 = Arrays.asList("2-4", "2-3", "2-2");
	List<String> battleshiplocs1 = Arrays.asList("0-5", "1-5", "2-5");
	List<String> destroyerlocs1 = Arrays.asList("7-9", "7-8");
	List<String> carrierlocs1 = Arrays.asList("5-7", "6-7", "7-7", "8-7", "9-7");

	//creating ships for GP1
	Ship ship1 = new Ship("cruiser", gamePlayer1, cruiserlocs, 3);
	Ship ship2 = new Ship("battleship", gamePlayer1, battleshiplocs, 0);
	Ship ship3 = new Ship("destroyer", gamePlayer1, destroyerlocs, 2);
	Ship ship4 = new Ship("carrier", gamePlayer1, carrierlocs, 5);

	//creating ships for GP2
	Ship ship5 = new Ship("cruiser", gamePlayer2, cruiserlocs1, 3);
	Ship ship6 = new Ship("battleship", gamePlayer2, battleshiplocs1, 3);
	Ship ship7 = new Ship("destroyer", gamePlayer2, destroyerlocs1, 0);
	Ship ship8 = new Ship("carrier", gamePlayer2, carrierlocs1, 0);

	//creating ships for GP3
	Ship ship9 = new Ship("cruiser", gamePlayer3, cruiserlocs, 0);
	Ship ship10 = new Ship("battleship", gamePlayer3, battleshiplocs, 0);
	Ship ship11 = new Ship("destroyer", gamePlayer3, destroyerlocs, 0);
	Ship ship12 = new Ship("carrier", gamePlayer3, carrierlocs, 0);

	//creating ships for GP4
	Ship ship13 = new Ship("cruiser", gamePlayer4, cruiserlocs1, 0);
	Ship ship14 = new Ship("battleship", gamePlayer4, battleshiplocs1, 0);
	Ship ship15 = new Ship("destroyer", gamePlayer4, destroyerlocs1, 0);
	Ship ship16 = new Ship("carrier", gamePlayer4, carrierlocs1, 4);

	//creating salvos for GP1-4
	Salvo salvo1 = new Salvo(1, gamePlayer1, "0-0", "M");
	Salvo salvo2 = new Salvo(2, gamePlayer1, "3-3", "M");
	Salvo salvo3 = new Salvo(3, gamePlayer2, "7-3","H" );
	Salvo salvo4 = new Salvo(4, gamePlayer2, "7-2", "H");
	Salvo salvo5 = new Salvo(1, gamePlayer2, "7-4", "H");
	Salvo salvo6 = new Salvo(2, gamePlayer2, "6-8", "H");
	Salvo salvo7 = new Salvo(3, gamePlayer2, "6-9","H" );
	Salvo salvo8 = new Salvo(4, gamePlayer2, "6-7", "H");
	Salvo salvo9 = new Salvo(2, gamePlayer2, "5-7", "H");
	Salvo salvo10 = new Salvo(3, gamePlayer2, "4-7","H" );
	Salvo salvo11 = new Salvo(4, gamePlayer2, "3-7", "H");
	Salvo salvo19 = new Salvo(4, gamePlayer2, "2-7", "H");
	Salvo salvo12 = new Salvo(1, gamePlayer1, "0-5", "H");
	Salvo salvo13 = new Salvo(2, gamePlayer1, "1-5", "H");
	Salvo salvo14 = new Salvo(3, gamePlayer1, "2-5","H" );
	Salvo salvo15 = new Salvo(4, gamePlayer1, "2-4", "H");
	Salvo salvo16 = new Salvo(2, gamePlayer1, "2-3", "H");
	Salvo salvo17 = new Salvo(3, gamePlayer1, "2-2","H" );
	Salvo salvo18 = new Salvo(4, gamePlayer1, "2-1", "M");

	//creating scores for games
	Score score3 = new Score(0.5, gamePlayer3);
	Score score4 = new Score(0.5, gamePlayer4);

	// ***** adding test objects/data to the repos *****//
	@Bean
	public CommandLineRunner initData(GameRespository gameRepository, PlayerRepository playerRepository, GamePlayerRepository gamePlayerRepository, ShipRepository shipRepository, SalvoRespository salvoRespository, ScoreRepository scoreRepository) {
		return (args) -> {
			gameRepository.save(game1);
			gameRepository.save(game2);
			gameRepository.save(game3);

			playerRepository.save(player1);
			playerRepository.save(player2);
			playerRepository.save(player3);

			gamePlayerRepository.save(gamePlayer1);
			gamePlayerRepository.save(gamePlayer2);
			gamePlayerRepository.save(gamePlayer3);
			gamePlayerRepository.save(gamePlayer4);
			gamePlayerRepository.save(gamePlayer5);

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
			salvoRespository.save(salvo5);
			salvoRespository.save(salvo6);
			salvoRespository.save(salvo7);
			salvoRespository.save(salvo8);
			salvoRespository.save(salvo9);
			salvoRespository.save(salvo10);
			salvoRespository.save(salvo11);
			salvoRespository.save(salvo12);
			salvoRespository.save(salvo13);
			salvoRespository.save(salvo14);
			salvoRespository.save(salvo15);
			salvoRespository.save(salvo16);
			salvoRespository.save(salvo17);
			salvoRespository.save(salvo18);
			salvoRespository.save(salvo19);

			scoreRepository.save(score3);
			scoreRepository.save(score4);
		};
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
	}

}

@EnableWebSecurity
@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

	@Autowired
	PlayerRepository playerRepository;

	@Override
	public void init(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(inputName-> {
			Optional <Player> player2 = playerRepository.findByUsername(inputName);
			Player player = player2.get();

			if (player != null) {
				return new User(player.getUsername(), player.getPassword(),
						AuthorityUtils.createAuthorityList("USER"));
			} else {
				throw new UsernameNotFoundException("Unknown user: " + inputName);
			}
		});
	}

}

@EnableWebSecurity
@Configuration
class WebSecurityConfig extends WebSecurityConfigurerAdapter {
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.authorizeRequests()
				.antMatchers("/**").permitAll();
		http.formLogin()
				.usernameParameter("username")
				.passwordParameter("password")
				.loginPage("/app/login");

		http.logout().logoutUrl("/app/logout");

		// turn off checking for CSRF tokens
		http.csrf().disable();
		// if user is not authenticated, just send an authentication failure response
		http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));
		// if login is successful, just clear the flags asking for authentication
		http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));
		// if login fails, just send an authentication failure response
		http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));
		// if logout is successful, just send a success response
		http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());


	}
	private void clearAuthenticationAttributes(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
		}
	}




}