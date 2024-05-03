package de.unidue.beckend_gruppe_q;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.PlayerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class BeckendGruppeQApplication {

    public static void main(String[] args) {
        SpringApplication.run(BeckendGruppeQApplication.class, args);
    }

//    @Bean
//    public CommandLineRunner demo(DeckRepository deckRepository, CardRepository cardRepository, PlayerRepository playerRepository) {
//        return args -> {
//            // add some decks, cards, players, and assign cards to players
//            Deck deck1 = new Deck("Java", "Java programming");
//            Card attackCard = new Card("Attack", Rarity.COMMON, 1, 1, "a", "");
//            Card defenseCard = new Card("Defense", Rarity.COMMON, 1, 1, "d", "");
//            Card healCard = new Card("Heal", Rarity.COMMON, 1, 1, "h", "");
//            Card specialCard = new Card("O Deus Klaus", Rarity.RARE, 1, 1, "o", "");
//            cardRepository.save(attackCard);
//            cardRepository.save(defenseCard);
//            cardRepository.save(healCard);
//            cardRepository.save(specialCard);
//            deck1.cards.add(attackCard);
//            deck1.cards.add(defenseCard);
//            deck1.cards.add(healCard);
//            deck1.cards.add(specialCard);
//            deckRepository.save(deck1);
//            Player player1 = new Player(new ArrayList<Deck>(), new ArrayList<Card>(), "John");
//
//            player1.cards.add(attackCard);
//            player1.cards.add(defenseCard);
//            player1.cards.add(healCard);
//            player1.cards.add(specialCard);
//
//            Player player2 = new Player(new ArrayList<Deck>(), new ArrayList<Card>(), "Mary");
//            player2.cards.add(attackCard);
//            player2.cards.add(defenseCard);
//            player2.cards.add(healCard);
//            player2.cards.add(specialCard);
//
//            Player player3 = new Player(new ArrayList<Deck>(), new ArrayList<Card>(), "Tom");
//            player3.cards.add(attackCard);
//            player3.cards.add(defenseCard);
//            player3.cards.add(healCard);
//            player3.cards.add(specialCard);
//
//            Player player4 = new Player(new ArrayList<Deck>(), new ArrayList<Card>(), "Jane");
//            player4.cards.add(attackCard);
//            player4.cards.add(defenseCard);
//            player4.cards.add(healCard);
//
//
//            playerRepository.save(player1);
//            playerRepository.save(player2);
//            playerRepository.save(player3);
//
//            playerRepository.save(player4);
//
//        };
//    }
}
