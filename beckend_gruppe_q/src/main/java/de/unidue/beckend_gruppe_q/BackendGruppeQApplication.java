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
public class BackendGruppeQApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendGruppeQApplication.class, args);
    }
//    @Bean
//    public CommandLineRunner demo(DeckRepository deckRepository, CardRepository cardRepository, PlayerRepository playerRepository) {
//        return args -> {
//            deckRepository.deleteAll();
//            playerRepository.deleteAll();
//            cardRepository.deleteAll();
//            // add some cards
//            Card attackCard = new Card("Attack", Rarity.COMMON, 20, 3, "Orc", "");
//            cardRepository.save(attackCard);
//            Card defenseCard = new Card("Defense", Rarity.RARE, 12, 11, "Human", "");
//            cardRepository.save(defenseCard);
//            Card healCard = new Card("Heal", Rarity.COMMON, 6, 15, "Priest",  "");
//            cardRepository.save(healCard);
//            Card specialCard = new Card("O Deus Klaus", Rarity.LEGENDARY, Double.POSITIVE_INFINITY, 0, "",  "");
//            cardRepository.save(specialCard);
//            Card moreAttackCard = new Card("moreAttack", Rarity.COMMON, 25, 5, "Orc", "");
//            cardRepository.save(moreAttackCard);
//            Card moreDefenseCard = new Card("moreDefense", Rarity.COMMON, 20, 10, "Orc", "");
//            cardRepository.save(moreDefenseCard);
//            Card moreHealCard = new Card("moreHeal", Rarity.COMMON, 10, 21, "Orc", "");
//            cardRepository.save(moreHealCard);
//            Card moremoreAttackCard = new Card("moremoreAttack", Rarity.COMMON, 40, 10, "Orc", "");
//            cardRepository.save(moremoreAttackCard);
//
//            List<Card> cards = new ArrayList<>();
//            cards.add(attackCard);
//            cards.add(healCard);
//            cards.add(defenseCard);
//            cards.add(specialCard);
//            cards.add(moreAttackCard);
//            cards.add(moreDefenseCard);
//            cards.add(moreHealCard);
//            cards.add(moremoreAttackCard);
//
//
//            Deck deck1 = new Deck("dragon1",cards);
//            Deck deck2 = new Deck("dragon2",cards);
//            Deck deck3 = new Deck("dragon3",cards);
//            deckRepository.save(deck1);
//            deckRepository.save(deck2);
//            deckRepository.save(deck3);
//
//            List<Deck> decks = new ArrayList<>();
//            decks.add(deck1);
//            decks.add(deck2);
//            decks.add(deck3);
//
//            Player player1 = new Player(decks, cards,"killer1");
//            Player player2 = new Player(decks, cards,"killer2");
//            Player player3 = new Player(decks, cards,"killer3");
//            playerRepository.save(player1);
//            playerRepository.save(player2);
//            playerRepository.save(player3);
//
//        };
//    }
}


