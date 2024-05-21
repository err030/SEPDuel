package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Deck;
import de.unidue.beckend_gruppe_q.model.Rarity;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@CrossOrigin
@RestController
@Transactional
public class AdminController {



    private final CardRepository cardRepository;

    private final UserRepository userRepository;

    private final DeckRepository deckRepository;

    public AdminController(CardRepository cardRepository, UserRepository userRepository, DeckRepository deckRepository) {
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
    }

    @PostMapping("/admin/cards/upload")
    public ResponseEntity<List<Card>> uploadCard(@RequestParam("file") MultipartFile multipartFile) {

        if (!multipartFile.isEmpty()) {
            List<Card> cards = new ArrayList<>();
           try {
               //character-input bytes->character input efficient
               //FileReader extends InputStreamReader
               BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(multipartFile.getInputStream()));
               //DEFAULT = CSV value format and skip Header
               CSVFormat csvFormat = CSVFormat.DEFAULT.builder().build();
               Iterable<CSVRecord> csvRecords = csvFormat.parse(bufferedReader);
              for (CSVRecord csvRecord : csvRecords) {
                  String name = csvRecord.get(0);
                  if(cardRepository.existsByName(name)) {
                      continue;
                  }
                  Card card = new Card();
                  card.setName(name);
                  String rarity = csvRecord.get(1);
                  //csvRecord return s string, check and set the Rarity
                  card.setRarity(rarity.equals("Rarity.COMMON") ? Rarity.COMMON :
                                    rarity.equals("Rarity.RARE") ? Rarity.RARE :
                                            rarity.equals("Rarity.LEGENDARY") ? Rarity.LEGENDARY :
                                                    null);
                  card.setAttack(Integer.parseInt(csvRecord.get(2)));
                  card.setDefense(Integer.parseInt(csvRecord.get(3)));
                  card.setDescription(csvRecord.get(4));
                  card.setImage(csvRecord.get(5));
                  cards.add(card);
              }
                  cardRepository.saveAll(cards);
              // check if the legendary card is present
               if (!cardRepository.existsByName("O DEUS KLAUS")){
                    Card specialCard = new Card();
                    specialCard.setName("O DEUS KLAUS");
                    specialCard.setRarity(Rarity.LEGENDARY);
                    specialCard.setAttack(Integer.MAX_VALUE);
                    specialCard.setDefense(0);
                    specialCard.setDescription("Legend has it that O DEUS KLAUS, the eternal deity, wields infinite power, \" +\n" +
                            "                    \"casting awe and fear upon all who dare to challenge its divine might.");
                    specialCard.setImage("/O_DEUS_KLAUS.PNG");
                    cards.add(specialCard);
                    cardRepository.save(specialCard);
               }
               List<Card> allCards = cardRepository.findAll();
               return ResponseEntity.status(HttpStatus.CREATED).body(allCards);
           } catch (Exception e) {
               e.printStackTrace();
               System.out.println(e.getMessage());
               return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(null);
           }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/admin/deleteCard/{name}")
    public ResponseEntity<Card> deleteCard(@PathVariable String name) {
        System.out.println("Frontend Called" + name);
       try {
           List<User> users = userRepository.findByCardsName(name);
           List<Deck> decks = deckRepository.findByCardsName(name);
           users.forEach(user -> user.cards.removeIf(card -> card.getName().equals(name)));
           decks.forEach(deck -> deck.cards.removeIf(card -> card.getName().equals(name)));
           userRepository.saveAll(users);
           deckRepository.saveAll(decks);
           System.out.println("User and Deck updated");
           cardRepository.deleteByName(name);
           System.out.println("Repo deleted");
           return ResponseEntity.noContent().build();
       } catch (Exception e) {
           e.printStackTrace();
           return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
       }
    }

    @GetMapping("/admin/getAllCards")
    public ResponseEntity<List<Card>> getAllCards() {
        List<Card> allCards = cardRepository.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(allCards);
    }
}

