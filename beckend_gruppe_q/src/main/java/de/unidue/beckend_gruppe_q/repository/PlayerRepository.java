package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
}
