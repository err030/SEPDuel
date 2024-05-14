package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Rarity;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
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

@CrossOrigin(origins = "http://localhost:4200")
@RestController
public class AdminController {



    private final CardRepository cardRepository;

    private final UserRepository userRepository;

    public AdminController(CardRepository cardRepository, UserRepository userRepository) {
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/admin/cards/upload")
    public ResponseEntity<List<Card>> uploadCard(@RequestParam("file") MultipartFile multipartFile) {
//        if (multipartFile.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please select a file to upload");
//        }
//
//        // 检查文件类型
//        if (!multipartFile.getOriginalFilename().endsWith(".csv") || !multipartFile.getContentType().equals("text/csv")) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please upload a CSV file");
//        }
        if (!multipartFile.isEmpty()) {
           try {
               BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(multipartFile.getInputStream()));
               CSVFormat csvFormat = CSVFormat.DEFAULT.builder().build();
               Iterable<CSVRecord> csvRecords = csvFormat.parse(bufferedReader);
               CSVRecord header = csvRecords.iterator().next();
               String[] headValues = header.values();
               csvRecords.forEach(record -> {
                   for (int i = 0; i < headValues.length; i++) {
                       Card card = new Card();
                       card.setName(headValues[i]);
                       card.setCardRarity(Rarity.valueOf(headValues[i]));
                       card.setAttackPoints(Integer.parseInt(headValues[i]));
                       card.setDefensePoints(Integer.parseInt(headValues[i]));
                       card.setDescription(headValues[i]);
                       card.setImage(headValues[i]);
                       cardRepository.save(card);
                   }
               });
               Iterable<Card> cardIterable = cardRepository.findAll();
               List<Card> cardList = new ArrayList<>();
               cardIterable.forEach(cardList::add);
               return ResponseEntity.status(HttpStatus.CREATED).body(null);
           } catch (Exception e) {
               return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(null);
           }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/admin/addCard")
    public ResponseEntity<Card> addCard(@RequestBody Card card) {
        List<Card> cardList = cardRepository.findByName(card.getName());
        if (!cardList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
        cardRepository.save(card);
        return ResponseEntity.status(HttpStatus.CREATED).body(null);
    }

    @DeleteMapping("/admin/deleteCard")
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

