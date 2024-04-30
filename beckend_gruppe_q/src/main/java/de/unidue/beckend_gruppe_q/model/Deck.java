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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Card> getCards() {
        return cards;
    }

    public void setCards(List<Card> cards) {
        this.cards = cards;
    }
}
