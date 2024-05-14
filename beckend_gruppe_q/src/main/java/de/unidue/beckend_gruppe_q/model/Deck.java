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
    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<Card> cards;

    public Deck(String name, String description, List<Card> cards) {
        this.name = name;
        this.description = description;
        this.cards = cards;
    }
}
