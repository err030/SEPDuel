package de.unidue.beckend_gruppe_q;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Deck;
import de.unidue.beckend_gruppe_q.model.Rarity;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;

@SpringBootApplication
public class BackendGruppeQApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendGruppeQApplication.class, args);
    }
//    @Bean
//    public CommandLineRunner demo(DeckRepository deckRepository, CardRepository cardRepository, UserRepository userRepository) {
//        return args -> {
//            // create a deck
//            Deck deck = new Deck();
//            deck.setName("Deck");
//            deckRepository.save(deck);
//            Card card = new Card("kill", Rarity.COMMON, 1, 1, "A card that kills", "");
//            cardRepository.save(card);
//            Card card2 = new Card("heal", Rarity.COMMON, 1, 1, "A card that heals", "");
//            cardRepository.save(card2);
//
//            User user = new User();
//            user.setUsername("admin");
//            user.cards.add(card);
//            user.cards.add(card2);
//
//            userRepository.save(user);
//
//            for (User u : userRepository.findAll()) {
//                u.cards.add(new Card("test", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                userRepository.save(u);
//            }
//
//        };
//    }

}


