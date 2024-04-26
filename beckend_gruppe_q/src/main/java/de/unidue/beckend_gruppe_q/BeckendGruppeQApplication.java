package de.unidue.beckend_gruppe_q;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.CardType;
import de.unidue.beckend_gruppe_q.model.Deck;
import de.unidue.beckend_gruppe_q.model.Player;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.CardTypeRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.PlayerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BeckendGruppeQApplication {

    public static void main(String[] args) {
        SpringApplication.run(BeckendGruppeQApplication.class, args);
    }
    @Bean
    public CommandLineRunner demo(CardTypeRepository cardTypeRepository, DeckRepository deckRepository, CardRepository cardRepository, PlayerRepository playerRepository) {
        return args -> {
            deckRepository.deleteAll();
            playerRepository.deleteAll();
            cardTypeRepository.deleteAll();
            cardRepository.deleteAll();
            deckRepository.save(new Deck("Java", "Java programming"));
            deckRepository.save(new Deck("Python", "Python programming"));
            deckRepository.save(new Deck("C++", "C++ programming"));
            deckRepository.save(new Deck("C#", "C# programming"));
            deckRepository.save(new Deck("JavaScript", "JavaScript programming"));
            // add some cards
            CardType attackCard = new CardType("Attack", "An attack card", 0, 1, 1, 1, "");
            cardTypeRepository.save(attackCard);
            CardType defenseCard = new CardType("Defense", "A defense card", 1, 1, 1, 1, "");
            cardTypeRepository.save(defenseCard);
            CardType healCard = new CardType("Heal", "A heal card", 2, 1, 1, 1, "");
            cardTypeRepository.save(healCard);
            CardType specialCard = new CardType("O Deus Klaus", "A special card", 2, 1, Integer.MAX_VALUE, 0, "");
            cardTypeRepository.save(specialCard);
            Card card1 = new Card(attackCard);
            Card card2 = new Card(defenseCard);
            Card card3 = new Card(healCard);
            Card card4 = new Card(attackCard);
            Card card5 = new Card(defenseCard);
            Card card6 = new Card(healCard);
            cardRepository.save(card1);
            cardRepository.save(card2);
            cardRepository.save(card3);
            cardRepository.save(card4);
            cardRepository.save(card5);
            cardRepository.save(card6);

            // add some players
            playerRepository.save(new Player("John"));
            playerRepository.save(new Player("Mary"));
            playerRepository.save(new Player("Tom"));
            playerRepository.save(new Player("Jane"));
            //give every player 6 cards
            playerRepository.findAll().forEach(player -> {
                player.addCard(card1);
                player.addCard(card2);
                player.addCard(card3);
                player.addCard(card4);
                player.addCard(card5);
                player.addCard(card6);
            });


        };
    }
}
