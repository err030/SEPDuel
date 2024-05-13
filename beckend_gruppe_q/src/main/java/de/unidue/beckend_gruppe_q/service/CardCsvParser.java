package de.unidue.beckend_gruppe_q.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Rarity;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

//implement a service to parse CSV files containing card data and save it to the database
@Service
public class CardCsvParser {

    private final CardRepository cardRepository;

    public CardCsvParser(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    public void parse(MultipartFile csvFile) throws IOException, CsvException {
        try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(csvFile.getInputStream()))) {
            List<Card> cards = new ArrayList<>();
            String line;
            boolean isFirstLine = true;
            while ((line = bufferedReader.readLine()) != null) {
            if (isFirstLine) {
                isFirstLine = false;
                continue;
            }
            String[] fields = line.split(",");
            Card card = new Card();
            card.setName(fields[0]);
            card.setCardRarity(Rarity.valueOf(fields[1]));
            card.setAttackPoints(Integer.parseInt(fields[2]));
            card.setDefensePoints(Integer.parseInt(fields[3]));
            card.setDescription(fields[4]);
            card.setImage(fields[5]);
            cards.add(card);
            }
            cardRepository.saveAll(cards);
        }
    }

}