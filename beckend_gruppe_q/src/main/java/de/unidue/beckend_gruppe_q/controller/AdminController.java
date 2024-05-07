package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import de.unidue.beckend_gruppe_q.service.CardCsvParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class AdminController {

    @Autowired
    private final CardCsvParser cardCsvParser;
    @Autowired
    private final CardRepository cardRepository;
    @Autowired
    private final UserRepository userRepository;

    public AdminController(CardCsvParser cardCsvParser, CardRepository cardRepository, UserRepository userRepository) {
        this.cardCsvParser = cardCsvParser;
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("admin/cards/upload")
    public ResponseEntity<?> uploadCard(@RequestBody MultipartFile file) {
        try {
            cardCsvParser.parse(file.getInputStream());
            return ResponseEntity.ok().build();
        } catch (IOException e){
            e.printStackTrace();
            return  ResponseEntity.badRequest().body("Error while uploading file");
        }
    }

    @PostMapping("admin/addCard")
    public ResponseEntity<Card> addCard(@RequestBody Card card) {
        Card addCard = cardRepository.save(card);
        return new ResponseEntity<>(addCard,HttpStatus.CREATED);
    }

    @DeleteMapping("admin/deleteCard")
    public ResponseEntity<Card> deleteCard(@RequestBody Card card) {
        Optional<Card> deleteCard = cardRepository.findById(card.getId());
        if (deleteCard.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        cardRepository.delete(card);
        userRepository.deleteById(card.getId());
        return ResponseEntity.ok().build();
    }
}

