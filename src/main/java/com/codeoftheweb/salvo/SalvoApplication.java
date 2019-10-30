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
	List<String> cruiserlocs = Arrays.asList("H2", "H3", "H4");
	List<String> submarinelocs = Arrays.asList("B5", "C5", "D5");
	List<String> destroyerlocs = Arrays.asList("G9", "G10");
	List<String> aircraftcarrierlocs = Arrays.asList("D7", "E7", "F7", "G7", "H7");

	List<String> cruiserlocs1 = Arrays.asList("C2", "C3", "C4");
	List<String> submarinelocs1 = Arrays.asList("A5", "B5", "C5");
	List<String> destroyerlocs1 = Arrays.asList("H9", "H10");
	List<String> aircraftcarrierlocs1 = Arrays.asList("F7", "G7", "H7", "I7", "J7");

	//creating ships for GP1
	Ship ship1 = new Ship("cruiser", gamePlayer1, cruiserlocs);
	Ship ship2 = new Ship("submarine", gamePlayer1, submarinelocs);
	Ship ship3 = new Ship("destroyer", gamePlayer1, destroyerlocs);
	Ship ship4 = new Ship("aircraftcarrier", gamePlayer1, aircraftcarrierlocs);

	//creating ships for GP2
	Ship ship5 = new Ship("cruiser", gamePlayer2, cruiserlocs1);
	Ship ship6 = new Ship("submarine", gamePlayer2, submarinelocs1);
	Ship ship7 = new Ship("destroyer", gamePlayer2, destroyerlocs1);
	Ship ship8 = new Ship("aircraftcarrier", gamePlayer2, aircraftcarrierlocs1);

	//creating ships for GP3
	Ship ship9 = new Ship("cruiser", gamePlayer3, cruiserlocs);
	Ship ship10 = new Ship("submarine", gamePlayer3, submarinelocs);
	Ship ship11 = new Ship("destroyer", gamePlayer3, destroyerlocs);
	Ship ship12 = new Ship("aircraftcarrier", gamePlayer3, aircraftcarrierlocs);

	//creating ships for GP4
	Ship ship13 = new Ship("cruiser", gamePlayer4, cruiserlocs1);
	Ship ship14 = new Ship("submarine", gamePlayer4, submarinelocs1);
	Ship ship15 = new Ship("destroyer", gamePlayer4, destroyerlocs1);
	Ship ship16 = new Ship("aircraftcarrier", gamePlayer4, aircraftcarrierlocs1);

	//creating salvos for GP1-4
	Salvo salvo1 = new Salvo(1, gamePlayer1, "A1", "M");
	Salvo salvo2 = new Salvo(1, gamePlayer1, "D4", "M");
	Salvo salvo3 = new Salvo(1, gamePlayer2, "H4","H" );
	Salvo salvo4 = new Salvo(1, gamePlayer2, "H8", "M");


	//creating scores for games
	Score score1 = new Score(1.0, gamePlayer1);
	Score score2 = new Score(0.0, gamePlayer2);
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

			scoreRepository.save(score1);
			scoreRepository.save(score2);
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