package de.unidue.beckend_gruppe_q.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class Player {
    Deck deck;
    List<Card> hand = new ArrayList<>();
    List<Card> table = new ArrayList<>();
    String avatarUrl;
    List<Card> summonedCards = new ArrayList<>();
    List<Card> sacrificedCards = new ArrayList<>();
    long damageDealt = 0;
    private long id;
    private String name;
    private int hp = 50;
    private boolean hasSummoned = false;
    private boolean isRobot = false;


    public Player(User u, Deck d) {
        this.id = u.getId();
        this.name = u.getUsername();
        this.deck = d.clone();
        this.avatarUrl = u.getAvatarUrl();
        this.isRobot = u.isRobot();
    }

    public boolean isDead() {
        return this.hp <= 0;
    }

    public boolean hasSummoned() {
        return this.hasSummoned;
    }


}

