//PlayerController.java
package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/user/decks")
public class PlayerController {

    @Autowired
    private final PlayerRepository playerRepository;
    @Autowired
    private final DeckRepository deckRepository;

    public PlayerController(PlayerRepository playerRepository, DeckRepository deckRepository) {
        this.playerRepository = playerRepository;
        this.deckRepository = deckRepository;
    }

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

    @DeleteMapping("/api/player/{id}/deleteDeck")
    public ResponseEntity<Deck> deleteDeck(@PathVariable Long id) {
        if (!deckRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        deckRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
//获取用户所有的卡组和卡牌get api/players/{id}/cards  api/players/{id}/decks。。。特定卡组内的卡牌get api/players/{id}/decks/{id}。。。
// 新增卡组get api/players/{id}/addDeck Long new Deck return deck.id
//    @GetMapping("/api/players/{id}/addDeck")
//    public Long addDeck(@PathVariable Long id) {
//        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Invalid player id"));
//        Deck deck = new Deck();
//        user.addDeck(deck);
//        return deck.getId();
//    }
//
//
//
//    @GetMapping("/api/players/{id}/decks")
//    public List<Deck> getAllDecks(@PathVariable Long id) {
//        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Invalid player id")).getDecks();
//
//    }
//
//    @GetMapping("/api/players/{id}/decks/{deckId}")
//    public Deck getDeck(@PathVariable Long id, @PathVariable Long deckId) {
//        List<Deck> decks = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Invalid player id")).getDecks();
//        for (Deck deck : decks) {
//            if (deck.getId() == deckId) {
//                return deck;
//            }
//        }
//        return null;
//    }
//
//    @GetMapping("/api/players/{id}/cards")
//    public List<Card> getAllCards(@PathVariable Long id) {
//        return userRepository.findById(id).get().getCards();
//    }
//
//
//    @GetMapping("/api/players/{id}/decks/{deckId}/cards")
//    public List<Card> getCards(@PathVariable Long id, @PathVariable Long deckId) {
//       return this.getDeck(id, deckId).getCards();
//    }
//
//
//    @GetMapping("/api/players/{id}/decks/{deckId}/cards/{cardId}")
//    public Card getCard(@PathVariable Long id, @PathVariable Long deckId, @PathVariable Long cardId) {
//        return this.getCards(id, deckId).stream().filter(c -> Objects.equals(c.getId(), cardId)).findFirst().orElseThrow(() -> new IllegalArgumentException("Invalid card id"));
//    }
//

}


