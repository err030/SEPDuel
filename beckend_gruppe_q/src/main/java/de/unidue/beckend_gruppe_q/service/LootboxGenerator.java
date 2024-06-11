package de.unidue.beckend_gruppe_q.service;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Lootbox;
import de.unidue.beckend_gruppe_q.model.LootboxType;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.LootboxRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import static de.unidue.beckend_gruppe_q.model.LootboxType.*;
import static de.unidue.beckend_gruppe_q.model.Rarity.*;

@Service
public class LootboxGenerator {

    private final Random random = new Random();

    private final CardRepository cardRepository;

    private final LootboxRepository lootboxRepository;


    public LootboxGenerator(CardRepository cardRepository, LootboxRepository lootboxRepository) {
        this.cardRepository = cardRepository;
        this.lootboxRepository = lootboxRepository;
    }

    /**
     * generate a lootbox and save it to the lootboxRepository
     * @param type
     * @return
     */
    public Lootbox generateLootbox(LootboxType type) {

        Lootbox lootbox = new Lootbox();
        lootbox.setLootboxType(type);
        System.out.println(lootbox.getLootboxType());
        if (lootbox.getLootboxType() == BRONZE) {
            lootbox.setPrice(50);
        }
        if (lootbox.getLootboxType() == SILVER) {
            lootbox.setPrice(150);
        }
        if (lootbox.getLootboxType() == GOLD) {
            lootbox.setPrice(250);
        }
        List<Card> cards = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            cards.add(randomCardByType(type,i));
        }
        lootbox.setCards(cards);
        lootboxRepository.save(lootbox);
        return lootbox;
    }

    /**
     * call each method for each case
     * @param type
     * @param cardIndex
     * @return
     */
    private Card randomCardByType(LootboxType type, int cardIndex) {

        List<Card> legendaryCards = cardRepository.findByRarity(LEGENDARY);
        List<Card> rareCards = cardRepository.findByRarity(RARE);
        List<Card> commonCards = cardRepository.findByRarity(COMMON);

        switch (type) {
            case BRONZE:
                return getBronzeCard(cardIndex, legendaryCards, rareCards, commonCards);
            case SILVER:
                return getSilverCard(cardIndex, legendaryCards, rareCards, commonCards);
            case GOLD:
                return getGoldCard(cardIndex, legendaryCards, rareCards, commonCards);
            default:
                throw new IllegalStateException("Unexpected value: " + type);
        }
    }

    /**
     * the first card 5% chance to be legendary,second card 15% chance to be rare,
     * rest are all common cards
     * @param cardIndex
     * @param legendaryCards
     * @param rareCards
     * @param normalCards
     * @return
     */
    private Card getBronzeCard(int cardIndex, List<Card> legendaryCards, List<Card> rareCards, List<Card> normalCards) {
        if (cardIndex == 0) {
            return getCardByRarity(legendaryCards, rareCards, normalCards, 5, 0);
        } else if (cardIndex == 1) {
            return getCardByRarity(legendaryCards, rareCards, normalCards, 0, 15);
        } else {
            return getRandomCardFromList(normalCards);
        }
    }

    private Card getSilverCard(int cardIndex, List<Card> legendaryCards, List<Card> rareCards, List<Card> normalCards) {
        if (cardIndex == 0) {
            return getCardByRarity(legendaryCards, rareCards, normalCards, 10, 0);
        } else if (cardIndex == 1) {
            return getCardByRarity(legendaryCards, rareCards, normalCards, 0, 25);
        } else {
            return getRandomCardFromList(normalCards);
        }
    }

    private Card getGoldCard(int cardIndex, List<Card> legendaryCards, List<Card> rareCards, List<Card> normalCards) {
        if (cardIndex == 0) {
            return getCardByRarity(legendaryCards, rareCards, normalCards, 15, 0);
        } else if (cardIndex == 1 || cardIndex == 2) {
            return getCardByRarity(legendaryCards, rareCards, normalCards, 0, 25);
        } else {
            return getRandomCardFromList(normalCards);
        }
    }

    /**
     * get random cards from each rarity
     * @param cards
     * @return
     */
    private Card getRandomCardFromList(List<Card> cards) {
        if (cards.isEmpty()) {
            throw new IllegalStateException("No cards found");
        }
        return cards.get(random.nextInt(cards.size()));
    }

    /**
     * here are how the chances are dealt
     * @param legendaryCards
     * @param rareCards
     * @param normalCards
     * @param legendaryChance
     * @param rareChance
     * @return
     */
    private Card getCardByRarity(List<Card> legendaryCards, List<Card> rareCards,
                                 List<Card> normalCards,
                                 int legendaryChance, int rareChance) {
        int roll = random.nextInt(100);
        if (roll < legendaryChance) {
            return getRandomCardFromList(legendaryCards);
        } else if (roll < legendaryChance + rareChance) {
            return getRandomCardFromList(rareCards);
        } else {
            return getRandomCardFromList(normalCards);
        }
    }




}
