package de.unidue.beckend_gruppe_q.service;


import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Duel;
import de.unidue.beckend_gruppe_q.model.Player;
import de.unidue.beckend_gruppe_q.model.Rarity;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class RobotService {

    @Autowired
    private CardRepository cardRepository;


    private final Random random = new Random();
    private boolean attackPlayer ;

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
        Card cardToSummon = robot.getHand().stream()
                .filter(card -> card.getRarity().equals(Rarity.COMMON))
                .findFirst().orElse(null);

        if (cardToSummon!=null) {
            duel.summon(cardToSummon);
            System.out.println("Robot summoned card: " + cardToSummon.getName());
        } else {
            // Check if there are RARE or LEGENDARY cards that can be summoned
            cardToSummon = robot.getHand().stream()
                    .filter(card -> (card.getRarity().equals(Rarity.RARE) && robot.getTable().size() >= 2) ||
                            (card.getRarity().equals(Rarity.LEGENDARY) && robot.getTable().size() >= 3))
                    .findFirst().orElse(null);

            if (cardToSummon!=null) {
                if (cardToSummon.getRarity().equals(Rarity.RARE)) {
                    // Sacrifice 2 cards to summon a RARE card
                    List<Card> cardsToSacrifice = robot.getTable().stream().limit(2).toList();
                    duel.sacrificeCard(cardsToSacrifice.get(0).getId(), cardsToSacrifice.get(1).getId());
                } else  {
                    // Sacrifice 3 cards to summon a LEGENDARY card
                    List<Card> cardsToSacrifice = robot.getTable().stream().limit(3).toList();
                    duel.sacrificeCard(cardsToSacrifice.get(0).getId(), cardsToSacrifice.get(1).getId(), cardsToSacrifice.get(2).getId());
                }
            }else{
                System.out.println("No cards available to summon.");
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
            Card defender = duel.getOpponent().getTable().stream().findFirst().orElse(null);
            if (defender!=null) {
                duel.attack(attacker, defender);
                System.out.println("Robot attacked opponent's card with card: " + attacker.getName());
            } else {
                System.out.println("There is no defender in the deck.");
            }
        }
        attackPlayer = !attackPlayer;
    }

}


