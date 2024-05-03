package de.unidue.beckend_gruppe_q.Service;


import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Rarity;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class SpecialCardTypeService {

    private final CardRepository cardRepository;

    public SpecialCardTypeService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    @PostConstruct
    public void initSpecialCardType() {
        if (cardRepository.findByCardName("O Deus Klaus")==null) {
            Card specialCardType = new Card();

            specialCardType.setCardName("O Deus Klaus");
            specialCardType.setCardRarity(Rarity.LEGENDARY);
            specialCardType.setDefensePoints(0);
            specialCardType.setDescription("");
            specialCardType.setImage("");

            this.cardRepository.save(specialCardType);
        }
    }
}
