//PlayerController.java
package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/user/decks")
public class PlayerController {

    @Autowired
    private final PlayerRepository playerRepository;
    @Autowired
    private final DeckRepository deckRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CardRepository cardRepository;

    public PlayerController(PlayerRepository playerRepository, DeckRepository deckRepository) {
        this.playerRepository = playerRepository;
        this.deckRepository = deckRepository;
    }

    // to add a new deck
    @PostMapping("api/player/{deck}/createDeck")
    public ResponseEntity<Deck> createDeck(@RequestBody Deck deck) {
        Player newPlayer = new Player();
        if (newPlayer.getDecks().size() > 3 || newPlayer.getCards().size() > 30){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Deck savedDeck = deckRepository.save(deck);
        return new ResponseEntity<>(savedDeck, HttpStatus.CREATED);
    }
    //deckRepository.findById(id) would return an `Optional' and loads the entity's data from the database when invoked
    //deckRepository.getOne(id) gets only a reference of the database and it is deprecated
    //update a deck, include update the name and the cards
    @PutMapping("/api/player/{id}/updateDeck")
    public ResponseEntity<Deck> updateDeck(@PathVariable Long id, @RequestBody Deck updateDeck) {

        Optional<Deck> existingDeck = deckRepository.findById(id);
        if (existingDeck.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        existingDeck.get().setName(updateDeck.getName()); //update deckName
        existingDeck.get().setCards(updateDeck.getCards());       //update Cards
        Deck savedDeck = deckRepository.save(existingDeck.get());
        return new ResponseEntity<>(savedDeck, HttpStatus.OK);
    }

    //delete a deck
    @DeleteMapping("/api/player/{id}/deleteDeck")
    public ResponseEntity<Deck> deleteDeck(@PathVariable Long id) {
        if (!deckRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        deckRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    //get all cards from player
    @GetMapping(path="/api/player/{id}/cards",produces = "application/json")
    public ResponseEntity<List<Card>> getAllCards(@PathVariable Long id) {
        if (!playerRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(playerRepository.findById(id).get().getCards(), HttpStatus.OK);
    }

    //get all decks from player
    @GetMapping("api/player/{id}/decks")
    public ResponseEntity<List<Deck>> getAllDecks(@PathVariable Long id) {
        if (playerRepository.findById(id).isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(playerRepository.findById(id).get().getDecks(), HttpStatus.OK);
    }

    //get a deck using deckId from a player using id
    @GetMapping("api/player/{id}/deck/{deckId}/cards")
    public ResponseEntity<List<Card>> getCardsFromDeck(@PathVariable Long id, @PathVariable Long deckId) {
        if (!playerRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        if (!deckRepository.existsById(deckId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(playerRepository.findById(id).get()
                                   .getDecks()
                                   .stream()
                                   .filter(deck -> deck.getId().equals(deckId))
                                   .findFirst().get().getCards(), HttpStatus.OK);
    }

    //get a card using cardId from a deck using deckId from a player using playerId
    @GetMapping("api/player{id}/deck{deckId}/card{cardId}/card")
    public ResponseEntity<Card> getCardFromDeck(@PathVariable Long id, @PathVariable Long deckId, @PathVariable Long cardId) {
        if (!playerRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        if (!deckRepository.existsById(deckId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(playerRepository.findById(id).get()
                .getDecks()
                .stream()
                .filter(deck -> deck.getId().equals(deckId))
                .findFirst().get()
                .getCards()
                .stream()
                .filter(card -> card.getId().equals(cardId))
                .findFirst().get(), HttpStatus.OK);
    }

    //add cards to the deck
    @PostMapping("api/player{id}/deck{deckId}/card{cardId}/addCardtoDeck")
    public ResponseEntity<Deck> addCardsToDeck(@PathVariable Long id, @PathVariable Long deckId, @PathVariable Long cardId) {
        if (!playerRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        if (!deckRepository.existsById(deckId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        if (!cardRepository.existsById(cardId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Card newCard = cardRepository.findById(cardId).get();
        Deck existingDeck = deckRepository.findById(deckId).get();
        existingDeck.getCards().add(newCard);
        deckRepository.save(existingDeck);
        return new ResponseEntity<>(existingDeck, HttpStatus.OK);
    }
}


