package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

//it represents card entity in the app and will be mapped to a table in the database

@Entity
@Data
@NoArgsConstructor
public class Card implements Cloneable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @Enumerated(EnumType.STRING)
    private Rarity rarity;

    private int attack;
    private int defense;
    private String description;
    private String image;
    private boolean canAttack;


    public Card(String name, Rarity rarity, int attack, int defense, String description, String image) {
        this.name = name;
        this.rarity = rarity;
        this.attack = attack;
        this.defense = defense;
        this.description = description;
        this.image = image;
        this.canAttack = false;
    }

    @Override
    public Card clone() {
        try {
            Card clone = (Card) super.clone();
            // TODO: copy mutable state here, so the clone can't change the internals of the original
            return clone;
        } catch (CloneNotSupportedException e) {
            throw new AssertionError();
        }
    }
}

