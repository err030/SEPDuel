package de.unidue.beckend_gruppe_q.service;


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
        if (cardRepository.findByName("O Deus Klaus")==null) {
            Card specialCardType = new Card();

            specialCardType.setName("O Deus Klaus");
            specialCardType.setCardRarity(Rarity.LEGENDARY);
            specialCardType.setAttackPoints(Integer.MAX_VALUE);
            specialCardType.setDefensePoints(0);
            specialCardType.setDescription("Legend has it that O DEUS KLAUS, the eternal deity, wields infinite power, " +
                    "casting awe and fear upon all who dare to challenge its divine might.");
            specialCardType.setImage("/Users/jc/Documents/UNI/gruppe-q/beckend_gruppe_q/src/main/resources/images/cards/O_DEUS_KLAUS.PNG");

            this.cardRepository.save(specialCardType);
        }
    }
}
