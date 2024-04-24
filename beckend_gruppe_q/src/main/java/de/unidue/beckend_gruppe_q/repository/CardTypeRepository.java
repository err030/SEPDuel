package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.CardType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardTypeRepository extends JpaRepository<CardType, Integer> {
}
