package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Deck;
import de.unidue.beckend_gruppe_q.model.Duel;
import de.unidue.beckend_gruppe_q.model.Player;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@CrossOrigin
public class DuelController {

    private UserRepository userRepository;
    private DeckRepository deckRepository;

    private Player player1;
    private Player player2;
    private Map<Long, Duel> duels = new ConcurrentHashMap<>();


    @GetMapping("/api/duel/{id}")
    public Duel getDuel(@PathVariable long id) {
        return duels.get(id);
    }

    @GetMapping("/api/duel/create/{player1Id}/{player2Id}/{deck1Id}/{deck2Id}/")
    public Duel createDuel(@PathVariable long player1Id, @PathVariable long player2Id, @PathVariable long deck1Id, @PathVariable long deck2Id) {
        Optional<User> optionalUser1 = userRepository.findById(player1Id);
        Optional<User> optionalUser2 = userRepository.findById(player2Id);
        Optional<Deck> optionalDeck1 = deckRepository.findById(deck1Id);
        Optional<Deck> optionalDeck2 = deckRepository.findById(deck2Id);

        if (!optionalUser1.isPresent() || !optionalUser2.isPresent() ||
                !optionalDeck1.isPresent() || !optionalDeck2.isPresent()) {
            throw new IllegalStateException("404 User or Deck Not Found");
        }

        User user1 = optionalUser1.get();
        User user2 = optionalUser2.get();
        Deck deck1 = optionalDeck1.get();
        Deck deck2 = optionalDeck2.get();

        player1 = new Player(user1, deck1);
        player2 = new Player(user2, deck2);
        Duel duel = new Duel(player1, player2);

        duels.put(duel.getId(), duel);

        return duel;
    }

    @GetMapping("/api/duel/{id}/start/")
    public Duel startDuel(@PathVariable long id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.start();
        return duel;
    }

    @GetMapping("/api/duel/{id}/next/")
    public Duel nextRound(@PathVariable long id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.nextRound();
        return duel;
    }

    @GetMapping("/api/duel/{id}/sacrifice/")
    public Duel sacrificeCard(@PathVariable long id, @RequestParam long card1Id, @RequestParam long card2Id, @RequestParam long card3Id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.sacrificeCard(card1Id, card2Id, card3Id);
        return duel;
    }



    }



}
