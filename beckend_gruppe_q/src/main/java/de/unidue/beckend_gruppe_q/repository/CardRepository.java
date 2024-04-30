package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByCardName(String oDeusKlaus);
}
