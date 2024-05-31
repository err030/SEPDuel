package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
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
    private CardRepository cardRepository;

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
    public Duel sacrificeCard(@PathVariable long id, @RequestParam long... cardIds) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.sacrificeCard(cardIds);
        return duel;
    }

    @GetMapping("/api/duel/{id}/attack/{attackerId}/{defenderId}/")
    public Duel attack(@PathVariable long id, @PathVariable long attackerId, @PathVariable(required = false) long defenderId) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        Card atk = cardRepository.findById(attackerId).get();
        Card def = null;
        if (defenderId > 0) {
            def = cardRepository.findById(defenderId).get();
        }
        duel.attack(atk, def);
        return duel;
    }

    @GetMapping("/api/duel/{id}/summon/{cardId}/")
    public Duel summon(@PathVariable long id, @PathVariable long cardId) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        Card card = cardRepository.findById(cardId).get();
        if (duel.existsInHand(card)) {
            duel.summon(card);
        } else {
            throw new IllegalStateException("Card does not exist");
        }

        return duel;
    }


    //reserved
    @GetMapping("/api/duel/{id}/endround/")
    public Duel endRound(@PathVariable long id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.nextRound();
        return duel;
    }


}
