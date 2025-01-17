package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Rarity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByName(String oDeusKlaus);

    boolean existsByName(String oDeusKlaus);

    void deleteByName(String name);

    List<Card> findByRarity(Rarity rarity);
}
