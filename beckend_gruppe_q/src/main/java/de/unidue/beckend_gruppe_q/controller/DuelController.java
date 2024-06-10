package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Duel;
import de.unidue.beckend_gruppe_q.model.Player;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.DuelRequestRepository;
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
    private DuelRequestRepository duelRequestRepository;

    private Player player1;
    private Player player2;
    private Map<Long, Duel> duels = new ConcurrentHashMap<>();


    @GetMapping("/api/duel/{id}")
    public Duel getDuel(@PathVariable long id) {
        return duels.get(id);
    }

    @GetMapping("/api/duel/create/{duelId}/{Deck1Id}/{Deck2Id}")
    public Duel createDuel(@PathVariable long duelId, @PathVariable long Deck1Id, @PathVariable long Deck2Id) {
        System.out.println(duelId);
        System.out.println(duelRequestRepository.findById(duelId).get().toString());

        long user1Id = duelRequestRepository.findById(duelId).get().getSendUserId();
        long user2Id = duelRequestRepository.findById(duelId).get().getReceivedUserId();


        Optional<User> ouser1 = userRepository.findById(user1Id);
        Optional<User> ouser2 = userRepository.findById(user2Id);

        if (ouser1.isEmpty() || ouser2.isEmpty()) {
            throw new IllegalStateException("User not found");
        }
        User user1 = ouser1.get();
        User user2 = ouser2.get();

        Player player1 = new Player(user1, deckRepository.findById(Deck1Id).get());
        Player player2 = new Player(user2, deckRepository.findById(Deck2Id).get());

        Duel duel = new Duel(player1, player2);
        duel.setId(duelId);
        duels.put(duel.getId(), duel);
        System.out.println("Duel created: " + duel);
        duel.start();

        return duel;
    }

    @GetMapping("/api/duel/{id}/start")
    public Duel startDuel(@PathVariable long id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.start();
        return duel;
    }

    @GetMapping("/api/duel/{id}/next")
    public Duel nextRound(@PathVariable long id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.nextRound();
        return duel;
    }

    @GetMapping("/api/duel/{id}/sacrifice")
    public Duel sacrificeCard(@PathVariable long id, @RequestParam long... cardIds) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.sacrificeCard(cardIds);
        return duel;
    }

    public DuelController(UserRepository userRepository, DeckRepository deckRepository, CardRepository cardRepository, DuelRequestRepository duelRequestRepository) {
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
        this.cardRepository = cardRepository;
        this.duelRequestRepository = duelRequestRepository;
    }

    @GetMapping("/api/duel/{id}/attack/{attackerId}/{defenderId}")
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

    @GetMapping("/api/duel/{id}/summon/{cardId}")
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
    @GetMapping("/api/duel/{id}/end")
    public Duel endRound(@PathVariable long id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.nextRound();
        return duel;
    }


}
