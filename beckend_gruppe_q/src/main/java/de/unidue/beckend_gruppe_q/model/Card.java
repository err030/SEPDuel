package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

//it represents card entity in the app and will be mapped to a table in the database

@Entity
@Data
@NoArgsConstructor
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "card")
    private Long id;
    private String name;
    private Rarity cardRarity;
    private int attackPoints;
    private int defensePoints;
    private String description;
    private String image;


    public Card( String name, Rarity cardRarity, int attackPoints, int defensePoints, String description, String image) {
        this.name = name;
        this.cardRarity = cardRarity;
        this.attackPoints = attackPoints;
        this.defensePoints = defensePoints;
        this.description = description;
        this.image = image;
    }
}

