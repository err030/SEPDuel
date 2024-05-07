//package de.unidue.beckend_gruppe_q.model;
//
//import jakarta.persistence.*;
//import lombok.NoArgsConstructor;
//
//
//import java.util.List;
//
//
//@Entity
//@NoArgsConstructor
//public class Player {
//    @Id
//
//    private Long id;
//    private String username;
//
//    //whenever I save Player,it'll also save the decks as well
//    @OneToMany
//    private List<Deck> decks;
//
//    @OneToMany
//    public List<Card> cards;
//
//    public Player(Long id,List<Deck> decks, List<Card> cards, String username) {
//        this.id = id;
//        this.decks = decks;
//        this.cards = cards;
//        this.username = username;
//    }
//
//    public String getUsername() {
//        return username;
//    }
//
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public List<Deck> getDecks() {
//        return decks;
//    }
//
//    public void setDecks(List<Deck> decks) {
//        this.decks = decks;
//    }
//
//    public List<Card> getCards() {
//        return cards;
//    }
//
//    public void setCards(List<Card> cards) {
//        this.cards = cards;
//    }
//
//    public Long getId() {
//        return id;
//    }
//}
//
//
