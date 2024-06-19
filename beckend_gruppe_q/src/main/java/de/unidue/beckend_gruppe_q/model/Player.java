package de.unidue.beckend_gruppe_q.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class Player {
    private long id;
    private String name;
    private int hp = 50;
    private boolean hasSummoned = false;
    Deck deck;
    List<Card> hand = new ArrayList<>();
    List<Card> table = new ArrayList<>();
    String avatarUrl;
    List<Card> summonedCards = new ArrayList<>();
    List<Card> sacrificedCards = new ArrayList<>();
    long damageDealt = 0;

    public boolean isDead() {
        return this.hp <= 0;
    }

    public Player(User u, Deck d){
        this.id = u.getId();
        this.name = u.getUsername();
        this.deck = d.clone();
        this.avatarUrl = u.getAvatarUrl();
    }

    public boolean hasSummoned() {
        return this.hasSummoned;
    }
}

