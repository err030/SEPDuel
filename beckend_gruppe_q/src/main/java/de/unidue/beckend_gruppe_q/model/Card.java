package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;

//it represents card entity in the app and will be mapped to a table in the database

@Entity
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "card")
    private Long id;
    private String cardName;
    private Rarity cardRarity;
    private double attackPoints;
    private int defensePoints;
    private String description;
    private String image;

    public Card() {}

    public Card( String cardName, Rarity cardRarity, double attackPoints, int defensePoints, String description, String image) {
        this.cardName = cardName;
        this.cardRarity = cardRarity;
        this.attackPoints = attackPoints;
        this.defensePoints = defensePoints;
        this.description = description;
        this.image = image;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCardName() {
        return cardName;
    }

    public void setCardName(String cardName) {
        this.cardName = cardName;
    }

    public Rarity getCardRarity() {
        return cardRarity;
    }

    public void setCardRarity(Rarity cardRarity) {
        this.cardRarity = cardRarity;
    }

    public double getAttackPoints() {
        return attackPoints;
    }

    public void setAttackPoints(double attackPoints) {
        this.attackPoints = attackPoints;
    }

    public int getDefensePoints() {
        return defensePoints;
    }

    public void setDefensePoints(int defensePoints) {
        this.defensePoints = defensePoints;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CardType getCardType() {
        return cardType;
    }

    public void setCardType(CardType cardType) {
        this.cardType = cardType;
    }
}

