package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nickname;
    private int wins;
    private int losses;
    private int score;
    @OneToMany
    private List<Deck> decks;
    @OneToMany(fetch = FetchType.EAGER)
    private List<Card> cards;

    public Player(String nickname) {
        this.nickname = nickname;
        this.wins = 0;
        this.losses = 0;
        this.score = 0;
        this.decks = new ArrayList<>();
        this.cards = new ArrayList<>();
    }

    public void addDeck(Deck deck) {
        if (this.deckIsFull()) {
            throw new IllegalStateException("Max number of decks reached");
        } else {
            this.decks.add(deck);
        }
    }

    private boolean deckIsFull() {
        return this.decks.size() >= 3;
    }

    public void removeDeck(Deck deck) {
        this.decks.remove(deck);
    }

    public void addWin() {
        this.wins++;
    }

    public void addLoss() {
        this.losses++;
    }

    public void addScore(int score) {
        this.score += score;
    }

    public void removeCard(Card card) {
        this.cards.remove(card);
    }

    public void addCard(Card card) {
        this.cards.add(card);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        this.wins = wins;
    }

    public int getLosses() {
        return losses;
    }

    public void setLosses(int losses) {
        this.losses = losses;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public List<Deck> getDecks() {
        return decks;
    }

    public void setDecks(List<Deck> decks) {
        this.decks = decks;
    }

    public List<Card> getCards() {
        return cards;
    }

    public void setCards(List<Card> cards) {
        this.cards = cards;
    }
}
