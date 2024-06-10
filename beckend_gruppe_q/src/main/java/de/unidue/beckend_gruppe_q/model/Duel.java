package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Duel {

    private long id;
    private Player playerA;
    private Player playerB;
    private Player currentPlayer;
    private boolean gameFinished;
    private long winnerId;
    private int playerTurn;
    private Card lastPlayerCard;


    public Duel(Player playerA, Player playerB) {
        this.playerA = playerA;
        this.playerB = playerB;
        this.gameFinished = false;
        this.winnerId = -1;
        this.playerTurn = 0;
        this.currentPlayer = playerA;
        this.lastPlayerCard = null;
    }


    public void start() {
        this.playerTurn = 0;
        this.currentPlayer = playerA;
        this.lastPlayerCard = null;
        this.playerA.table.clear();
        this.playerB.table.clear();
        this.playerA.deck.shuffle();
        this.playerB.deck.shuffle();
    }

    public void nextRound() {
        if (checkIfGameFinished()) {
            return;
        }
        this.playerTurn++;
        this.currentPlayer = this.getOpponent();
        this.drawCard(this.currentPlayer);
        this.currentPlayer.setHasSummoned(false);
    }

    public void drawCard(Player player) {
        if (checkIfGameFinished()) {
            return;
        }
            this.lastPlayerCard = this.currentPlayer.deck.cards.remove(this.currentPlayer.deck.cards.size() - 1);
            this.currentPlayer.hand.add(this.lastPlayerCard);

        }

    public void attack(Card attacker, Card defender) {
        if (checkIfGameFinished()) {
            return;
        }
        if (defender == null) {
            this.getOpponent().setHp(this.getOpponent().getHp() - attacker.getAttack());
            checkIfGameFinished();
            return;
        }
        // 减少防守方的防御值
        defender.setDefense(defender.getDefense() - attacker.getAttack());
        if (defender.getDefense() <= 0) {
            this.currentPlayer.table.remove(defender);
        } else {
            // 反击：如果防守方存活，减少攻击方的防御值
            attacker.setDefense(attacker.getDefense() - defender.getAttack());
            if (attacker.getDefense() <= 0) {
                this.currentPlayer.table.remove(attacker);
            }
        }
    }


    public boolean checkIfGameFinished() {
        if (playerA.isDead() || playerB.isDead()) {
            this.gameFinished = true;
            this.winnerId = playerA.getHp() > playerB.getHp() ? playerA.getId() : playerB.getId();
            System.out.println("Game finished, winner is " + this.winnerId);
            return true;
        }
        return false;
    }

    public Player getOpponent() {
        return Objects.equals(this.currentPlayer, playerA) ? playerB : playerA;
    }

    public void sacrificeCard(long... cardIds) {
        if (checkIfGameFinished()) {
            return;
        }
        // 验证桌面上至少有两张卡
        if (this.currentPlayer.table.size() < 2) {
            return;
        }

        // 获取所有传入 ID 对应的卡，如果 ID 为 -1 则视为 null
        List<Card> selectedCards = Arrays.stream(cardIds)
                .mapToObj(id -> id == -1 ? null : this.currentPlayer.table.stream().filter(card -> card.getId() == id).findFirst().orElse(null))
                .toList();

        // 验证所有卡都在桌面上
        if (selectedCards.stream().allMatch(this::existsInTable)) {
            Card bonusCard = null;
            switch (cardIds.length) {
                case 2: // 如果传入两个 ID，则寻找稀有卡
                    bonusCard = this.currentPlayer.deck.cards.stream()
                            .filter(card -> card.getRarity().equals(Rarity.RARE))
                            .findFirst()
                            .orElse(null);
                    break;
                case 3: // 如果传入三个 ID，则寻找传奇卡
                    bonusCard = this.currentPlayer.deck.cards.stream()
                            .filter(card -> card.getRarity().equals(Rarity.LEGENDARY))
                            .findFirst()
                            .orElse(null);
                    break;
            }

            // 如果找到对应的奖励卡，则从牌组移除并加入到桌面
            if (bonusCard != null) {
                this.currentPlayer.deck.cards.remove(bonusCard);
                this.currentPlayer.table.add(bonusCard);
            }
        }
    }


//    public void sacrificeCard(long card1Id, long card2Id, long card3Id) {
//        if (this.currentPlayer.table.size() < 2) {
//            return;
//        }
//        Card card1 = card1Id == -1? null : this.currentPlayer.table.stream().filter(card -> card.getId() == card1Id).findFirst().get();
//        Card card2 = card2Id == -1? null : this.currentPlayer.table.stream().filter(card -> card.getId() == card2Id).findFirst().get();
//        Card card3 = card3Id == -1? null : this.currentPlayer.table.stream().filter(card -> card.getId() == card3Id).findFirst().get();
//
//
//        if (this.existsInTable(card1) && this.existsInTable(card2) && this.existsInTable(card3)) {
//            Card bonus = this.currentPlayer.deck.cards.stream().filter(card -> card.getRarity().equals(Rarity.LEGENDARY)).findFirst().get();
//            this.currentPlayer.deck.cards.remove(bonus);
//            this.currentPlayer.table.add(bonus);
//        }
//
//    }
//
//    public void sacrificeCard(long card1Id, long card2Id) {
//        if (this.currentPlayer.table.size() < 2) {
//            return;
//        }
//        Card card1 = card1Id == -1? null : this.currentPlayer.table.stream().filter(card -> card.getId() == card1Id).findFirst().get();
//        Card card2 = card2Id == -1? null : this.currentPlayer.table.stream().filter(card -> card.getId() == card2Id).findFirst().get();
//
//
//        if (this.existsInTable(card1) && this.existsInTable(card2)) {
//            Card bonus = this.currentPlayer.deck.cards.stream().filter(card -> card.getRarity().equals(Rarity.RARE)).findFirst().get();
//            this.currentPlayer.deck.cards.remove(bonus);
//            this.currentPlayer.table.add(bonus);
//        }
//
//    }

    public boolean existsInTable(Card card) {

        return this.currentPlayer.table.contains(card);
    }

    public boolean existsInHand(Card card) {
        return this.currentPlayer.hand.contains(card);
    }

    public void summon(Card card) {
        if (this.currentPlayer.table.size() >= 5 || this.currentPlayer.hasSummoned()) {
            throw new IllegalArgumentException("Cannot summon card, table is full or has already summoned");
        }
        this.currentPlayer.hand.remove(card);
        this.currentPlayer.table.add(card);
        this.currentPlayer.setHasSummoned(true);
    }

    public void endGame() {
        this.gameFinished = true;
    }
}

