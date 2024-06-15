package de.unidue.beckend_gruppe_q.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Deck implements Cloneable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    public List<Card> cards;

    public Deck(String name, String description, List<Card> cards) {
        this.name = name;
        this.description = description;
        this.cards = cards;
    }

    public void shuffle() {
        java.util.Collections.shuffle(cards);
    }

    @Override
    public Deck clone() {
        try {
            Deck clone = (Deck) super.clone();
            // TODO: 复制此处的可变状态，这样此克隆就不能更改初始克隆的内部项
            return clone;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError();
        }
    }
}
