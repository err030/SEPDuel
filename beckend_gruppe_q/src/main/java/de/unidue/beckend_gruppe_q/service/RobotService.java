package de.unidue.beckend_gruppe_q.service;


import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class RobotService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private DeckRepository deckRepository;

    private Random random = new Random();
    private boolean attackPlayer = true;
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

    public void summonCard(Duel duel) {
        Player robot = duel.getCurrentPlayer();

        // Logic for summoning a card
        Optional<Card> cardToSummon = robot.getHand().stream()
                .filter(card -> card.getRarity().equals(Rarity.COMMON))
                .findFirst();

        if (cardToSummon.isPresent()) {
            Card card = cardToSummon.get();
            duel.summon(card);
            System.out.println("Robot summoned card: " + card.getName());
        } else {
            // Check if there are RARE or LEGENDARY cards that can be summoned
            cardToSummon = robot.getHand().stream()
                    .filter(card -> (card.getRarity().equals(Rarity.RARE) && robot.getTable().size() >= 2) ||
                            (card.getRarity().equals(Rarity.LEGENDARY) && robot.getTable().size() >= 3))
                    .findFirst();

            if (cardToSummon.isPresent()) {
                Card card = cardToSummon.get();
                if (card.getRarity().equals(Rarity.RARE) && robot.getTable().size() >= 2) {
                    // Sacrifice 2 cards to summon a RARE card
                    List<Card> cardsToSacrifice = robot.getTable().stream().limit(2).toList();
                    if (duel.sacrificeCard(cardsToSacrifice.get(0).getId(), cardsToSacrifice.get(1).getId()) != null) {
                        System.out.println("Robot sacrificed 2 cards to summon RARE card: " + card.getName());
                    }
                } else if (card.getRarity().equals(Rarity.LEGENDARY) && robot.getTable().size() >= 3) {
                    // Sacrifice 3 cards to summon a LEGENDARY card
                    List<Card> cardsToSacrifice = robot.getTable().stream().limit(3).toList();
                    if (duel.sacrificeCard(cardsToSacrifice.get(0).getId(), cardsToSacrifice.get(1).getId(), cardsToSacrifice.get(2).getId()) != null) {
                        System.out.println("Robot sacrificed 3 cards to summon LEGENDARY card: " + card.getName());
                    }
                }
            }
        }
    }

    // Attack method


    public void robotAttack(Duel duel) {
        Player robot = duel.getCurrentPlayer();
        List<Card> attackers = robot.getTable().stream()
                .filter(Card::isCanAttack)
                .toList();

        if (attackers.isEmpty()) {
            System.out.println("No cards available to attack.");
            return;
        }

        Card attacker = attackers.get(random.nextInt(attackers.size()));


        if (attackPlayer) {
            // 攻击玩家
            duel.attack(attacker, null);
            System.out.println("Robot attacked player with card: " + attacker.getName());
        } else {
            // 攻击对手的卡牌
            Optional<Card> defenderOpt = duel.getOpponent().getTable().stream().findFirst();
            System.out.println("对手table卡 " + duel.getOpponent().getTable().toString());
            if (defenderOpt.isPresent()) {
                Card defender = defenderOpt.get();
                duel.attack(attacker, defender);
                System.out.println("Robot attacked opponent's card with card: " + attacker.getName());
            } else {
                System.out.println("There is no defender in the deck.");
            }
        }
        attackPlayer=!attackPlayer;
    }

}


