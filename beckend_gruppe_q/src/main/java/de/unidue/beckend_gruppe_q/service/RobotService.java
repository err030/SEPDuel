package de.unidue.beckend_gruppe_q.service;


import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Deck;
import de.unidue.beckend_gruppe_q.model.Player;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RobotService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private DeckRepository deckRepository;

    // 生成随机卡组的方法
    public List<Card> generateRandomDeck() {
        List<Card> allCards = cardRepository.findAll(); // 获取所有卡牌
        List<Card> robotDeck = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            robotDeck.add(getRandomCardFromList(allCards)); // 使用现有的抽卡功能
        }
        return robotDeck;
    }

    private Card getRandomCardFromList(List<Card> cards) {
        if (cards.isEmpty()) {
            throw new IllegalStateException("No cards found");
        }
        Card randomCard = cards.get((int) (Math.random() * cards.size()));
        Card newIdCard = new Card(randomCard.getName(),
                randomCard.getRarity(),
                randomCard.getAttack(),
                randomCard.getDefense(),
                randomCard.getDescription(),
                randomCard.getImage());
        cardRepository.save(newIdCard);
        return newIdCard;
    }

}
