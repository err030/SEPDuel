package de.unidue.beckend_gruppe_q.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import de.unidue.beckend_gruppe_q.model.Deck;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeckRepository extends JpaRepository<Deck, Long> {
    List<Deck> findByCardsName(String name);
}
