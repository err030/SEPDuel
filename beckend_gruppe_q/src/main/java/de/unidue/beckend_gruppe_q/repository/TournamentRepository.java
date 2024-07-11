package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByClanId(Long clanId);
}
