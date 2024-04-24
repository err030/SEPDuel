//PlayerController.java
package de.unidue.beckend_gruppe_q.controller;

import com.decks.model.Card;
import com.decks.model.Deck;
import com.decks.model.Player;
import com.decks.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    public PlayerController(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

//    @Secured({"ROLE_USER", "ROLE_ADMIN"})
//
//    @GetMapping("/api/players/{id}/addDeck")
//
//    public List<Player> getPlayers() {
//        return playerRepository.findAll();
//    }

    @GetMapping("/api/players/{id}/addDeck")
    public Long addDeck(@PathVariable Long id) {
        Player player = playerRepository.findById(Math.toIntExact(id)).orElseThrow(() -> new IllegalArgumentException("Invalid player id"));
        Deck deck = new Deck();
        player.addDeck(deck);
        return deck.getId();
    }



    @GetMapping("/api/players/{id}/decks")
    public List<Deck> getAllDecks(@PathVariable Long id) {
        return playerRepository.findById(Math.toIntExact(id)).orElseThrow(() -> new IllegalArgumentException("Invalid player id")).getDecks();

    }

    @GetMapping("/api/players/{id}/decks/{deckId}")
    public Deck getDeck(@PathVariable Long id, @PathVariable Long deckId) {
        List<Deck> decks = playerRepository.findById(Math.toIntExact(id)).orElseThrow(() -> new IllegalArgumentException("Invalid player id")).getDecks();
        for (Deck deck : decks) {
            if (deck.getId() == deckId) {
                return deck;
            }
        }
        return null;
    }

    @GetMapping("/api/players/{id}/cards")
    public List<Card> getAllCards(@PathVariable Long id) {
        return playerRepository.findById(Math.toIntExact(id)).get().getCards();
    }


    @GetMapping("/api/players/{id}/decks/{deckId}/cards")
    public List<Card> getCards(@PathVariable Long id, @PathVariable Long deckId) {
       return this.getDeck(id, deckId).getCards();
    }


    @GetMapping("/api/players/{id}/decks/{deckId}/cards/{cardId}")
    public Card getCard(@PathVariable Long id, @PathVariable Long deckId, @PathVariable Long cardId) {
        return this.getCards(id, deckId).stream().filter(c -> Objects.equals(c.getId(), cardId)).findFirst().orElseThrow(() -> new IllegalArgumentException("Invalid card id"));
    }

    @DeleteMapping("/api/players/{id}/decks/{deckId}/cards/{cardId}")
    public void deleteCard(@PathVariable Long id, @PathVariable Long deckId, @PathVariable Long cardId) {
        this.getDeck(id, deckId).getCards().removeIf(c -> Objects.equals(c.getId(), cardId));
    }



    @PostMapping("/api/players/{id}/decks/{deckId}/cards")
    public boolean addCard(@PathVariable Long id, @PathVariable Long deckId, @RequestBody Card card) {
        return this.getDeck(id, deckId).addCard(card);
    }

}


