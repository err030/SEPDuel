package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;


@Entity
@Data
@NoArgsConstructor
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String username;

    //whenever I save Player,it'll also save the decks as well
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Deck> decks;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Card> cards;

    public Player(List<Deck> decks, List<Card> cards, String username) {
        this.decks = decks;
        this.cards = cards;
        this.username = username;
    }
}


