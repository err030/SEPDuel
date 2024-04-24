package de.unidue.beckend_gruppe_q.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Deck {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    @OneToMany
    private List<Card> cards;

    public Deck(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public boolean isFull() {
        return cards.size() >= 30;
    }

    public boolean addCard(Card card) {
        if (this.isFull()) {
            throw new IllegalStateException("Deck is full");
        } else {
            return cards.add(card);
        }
    }
}
