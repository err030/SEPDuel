package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

//it represents card entity in the app and will be mapped to a table in the database

@Getter
@Entity
@NoArgsConstructor
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String cardName;
    private Rarity cardRarity;
    private int attackPoints;
    private int defensePoints;
    private String description;
    private String image;

    public void setCardName(String cardName) {
        this.cardName = cardName;
    }

    public void setCardRarity(Rarity cardRarity) {
        this.cardRarity = cardRarity;
    }

    public void setAttackPoints(int attackPoints) {
        this.attackPoints = attackPoints;
    }

    public void setDefensePoints(int defensePoints) {
        this.defensePoints = defensePoints;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Card(String cardName, Rarity cardRarity, int attackPoints, int defensePoints, String description, String image) {
        this.cardName = cardName;
        this.cardRarity = cardRarity;
        this.attackPoints = attackPoints;
        this.defensePoints = defensePoints;
        this.description = description;
        this.image = image;
    }
}

