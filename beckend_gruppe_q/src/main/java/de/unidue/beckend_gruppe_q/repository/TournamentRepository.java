package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
}
