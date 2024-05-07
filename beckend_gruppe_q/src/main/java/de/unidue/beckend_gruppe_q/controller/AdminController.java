package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import de.unidue.beckend_gruppe_q.service.CardCsvParser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class AdminController {


    private final CardCsvParser cardCsvParser;

    private final CardRepository cardRepository;

    private final UserRepository userRepository;

    public AdminController(CardCsvParser cardCsvParser, CardRepository cardRepository, UserRepository userRepository) {
        this.cardCsvParser = cardCsvParser;
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("admin/cards/upload")
    public ResponseEntity<?> uploadCard(@RequestBody MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>("Please select a file to upload",HttpStatus.BAD_REQUEST);
        }
        try {
            cardCsvParser.parse(file.getInputStream());
            return new ResponseEntity<>("Successfully uploaded card",HttpStatus.OK);
        } catch (IOException e){
            return  new ResponseEntity<>("Failed to upload file: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
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

