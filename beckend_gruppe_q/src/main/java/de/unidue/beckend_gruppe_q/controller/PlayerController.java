//PlayerController.java
package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class PlayerController {



    private final DeckRepository deckRepository;

    private final UserRepository userRepository;

    public PlayerController(UserRepository userRepository, DeckRepository deckRepository) {
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
    }

    // to add a new deck
    @PostMapping("/api/user/{id}/createDeck")
    public ResponseEntity<Deck> createDeck(@PathVariable Long id,@RequestBody Deck deck) {
        Optional<User> user = userRepository.findById(id);
        if (user.get().getDecks().size() > 3 || deck.getCards().size() > 30){
            System.out.println("Deck limit reached");
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Deck savedDeck = deckRepository.save(deck);
        user.get().decks.add(savedDeck);
        userRepository.save(user.get());
        System.out.println("Deck saved" + savedDeck.toString());
        return new ResponseEntity<>(savedDeck, HttpStatus.CREATED);
    }

    @GetMapping("/api/user/{id}/createDeck")
    public ResponseEntity<Deck> createDeck( @PathVariable Long id) {
        Deck deck = new Deck();
        deck.setName("Something");
        deck.setCards(new ArrayList<Card>());
        User user = userRepository.findById(id).get();
        if (user.getDecks().size() > 3){
            System.out.println("Deck limit reached");
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        Deck savedDeck = deckRepository.save(deck);
        user.decks.add(savedDeck);
        userRepository.save(user);
        System.out.println("Deck saved" + savedDeck.toString());
        return new ResponseEntity<>(savedDeck, HttpStatus.CREATED);
    }

    //update a deck, include update the name and the cards
    @PostMapping("/api/user/{userid}/deck/{id}/updateDeck")
    public ResponseEntity<Deck> updateDeck(@PathVariable Long userid, @PathVariable Long id, @RequestBody Deck updateDeck) {
        System.out.println("Frontend Called");
        Optional<Deck> existingDeck = deckRepository.findById(id);
        if (existingDeck.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Deck d = existingDeck.get();
        System.out.println(d.toString());
        d.setName(updateDeck.getName()); //update deckName
        d.setCards(updateDeck.getCards());       //update Cards
        User u = userRepository.findById(userid).get();
        u.decks.remove(d);
        u.decks.add(d);
        Deck savedDeck = deckRepository.save(d);
        userRepository.save(u);
        System.out.println("Deck updated" + savedDeck.toString());
        return new ResponseEntity<>(savedDeck, HttpStatus.OK);
    }

    //delete a deck
    @DeleteMapping("/api/user/{userid}/deck/{deckid}")
    public ResponseEntity<Deck> deleteDeck(@PathVariable Long userid, @PathVariable Long deckid) {
        if (!deckRepository.existsById(deckid)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        User u = userRepository.findById(userid).get();
        Deck d = deckRepository.findById(deckid).get();
        u.decks.remove(d);
        deckRepository.deleteById(deckid);

        userRepository.save(u);
        return ResponseEntity.ok().build();
    }

    //get all cards from player
    @GetMapping(path="/api/user/{id}/card",produces = "application/json")
    public ResponseEntity<List<Card>> getAllCards(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            System.out.println("User not found");
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(userRepository.findById(id).get().getCards(), HttpStatus.OK);
    }

    //test use

    @GetMapping("/api/user/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            System.out.println("User not found");
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        }
        return new ResponseEntity<>(userRepository.findById(id).get(), HttpStatus.OK);
    }

    //get all decks from player
    @GetMapping("/api/user/{id}/deck")
    public ResponseEntity<List<Deck>> getAllDecks(@PathVariable Long id) {
        if (userRepository.findById(id).isEmpty()) {
            System.out.println("User not found");
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(userRepository.findById(id).get().getDecks(), HttpStatus.OK);
    }

    //get a deck using deckId from a player using id
    @GetMapping("/api/user/{id}/deck/{deckId}/card")
    public ResponseEntity<List<Card>> getCardsFromDeck(@PathVariable Long id, @PathVariable Long deckId) {
        if (!userRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        if (!deckRepository.existsById(deckId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(userRepository.findById(id).get()
                                   .getDecks()
                                   .stream()
                                   .filter(deck -> deck.getId().equals(deckId))
                                   .findFirst().get().getCards(), HttpStatus.OK);
    }

    //get a card using cardId from a deck using deckId from a player using playerId
    @GetMapping("/api/user/{id}/deck/{deckId}/card/{cardId}")
    public ResponseEntity<Card> getCardFromDeck(@PathVariable Long id, @PathVariable Long deckId, @PathVariable Long cardId) {
        if (!userRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        if (!deckRepository.existsById(deckId)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(userRepository.findById(id).get()
                .getDecks()
                .stream()
                .filter(deck -> deck.getId().equals(deckId))
                .findFirst().get()
                .getCards()
                .stream()
                .filter(card -> card.getId().equals(cardId))
                .findFirst().get(), HttpStatus.OK);
    }
}


