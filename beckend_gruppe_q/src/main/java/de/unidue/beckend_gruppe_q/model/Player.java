package de.unidue.beckend_gruppe_q.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Player {
    private long id;
    private String name;
    private int hp = 30;
    private boolean hasSummoned = false;
    Deck deck;
    List<Card> hand = new ArrayList<>();
    List<Card> table = new ArrayList<>();

    public boolean isDead() {
        return this.hp <= 0;
    }

    public Player(User u, Deck d){
        this.id = u.getId();
        this.name = u.getUsername();
        this.deck = d;
    }

    public boolean hasSummoned() {
        return this.hasSummoned;
    }
}

