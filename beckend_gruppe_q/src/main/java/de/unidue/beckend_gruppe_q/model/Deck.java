package de.unidue.beckend_gruppe_q.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Entity
public class Deck {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String deckName;

    //EAGER(fetch immediately with other fields)?LAZY(on-demand with getter)


    //Using a List<Card> to represent cards in a deck would imply that each card in the list is a distinct card object
    // with its own set of attributes(static)
    // List<CardInstanceInDeck> represent each occurrence of a card in a player's deck
    // as a separate object with its own unique attributes(dynamic)
    @OneToMany(cascade = CascadeType.ALL)
    private List<Card> cards;

    public Deck(String deckName, List<Card> cards) {
        this.deckName = deckName;
        this.cards = cards;
    }

    public Deck() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDeckName() {
        return deckName;
    }

    public void setDeckName(String deckName) {
        this.deckName = deckName;
    }



    public List<Card> getCards() {
        return cards;
    }

    public void setCards(List<Card> cards) {
        this.cards = cards;
    }
}
