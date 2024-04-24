package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class CardType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private int rarity;
    private int cost;
    private int attack;
    private int defense;
    private String image;

    public CardType(String name, String description, int rarity, int cost, int attack, int defense, String image) {
        this.name = name;
        this.description = description;
        this.rarity = rarity;
        this.cost = cost;
        this.attack = attack;
        this.defense = defense;
        this.image = image;
    }
}
