package de.unidue.beckend_gruppe_q.Service;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Rarity;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

        //implement a service to parse CSV files containing card data and save it to the database
@Service
public class CardCsvParser {

    private final CardRepository cardRepository;

    public CardCsvParser(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    public void parse(InputStream csvFile) throws IOException {

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(csvFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] fields = line.split(",");
                String name = fields[0];
                String cardRarity = fields[1];
                int attackPoints = Integer.parseInt(fields[2]);
                int defensePoints = Integer.parseInt(fields[3]);
                String description = fields[4];
                String image = fields[5];
                Card card = new Card(name, Rarity.valueOf(cardRarity),attackPoints,defensePoints,description,image);
                cardRepository.save(card);
            }
        }
    }

}

// in java strings, we need to escape the backslash itself with another backslash to represent
// a single backslash \r-->indicates the end of a line \n-->new line
// This parse method splits CSV file into lines and then splits lines into fields then each field will be
// saved as the card attributes then the new card will be saved in the database

//    String[] lines = csvFile.split("\\r?\\n");for (String line : lines) {
//      String[] fields = line.split(",");
//      String cardName = fields[0];
//      String cardRarity = fields[1];
//      int attackPoints = Integer.parseInt(fields[2]);
//      int defensePoints = Integer.parseInt(fields[3]);
//      String description = fields[4];
//      String image = fields[5];
//      Card card = new Card(cardName,cardRarity,attackPoints,defensePoints,description,image);
//      cardRepository.save(card);
//    }
//我这里可以用上面的方法，但是当我在AdminController中调用这个方法的时候我只能找到toString
// 或者使用getInputStream提示错误
//the difference between InputStream and String type is that, InputStream allows the
//method accept any source that produces a stream of bytes. such as a file,network connection...
// it provides flexibility