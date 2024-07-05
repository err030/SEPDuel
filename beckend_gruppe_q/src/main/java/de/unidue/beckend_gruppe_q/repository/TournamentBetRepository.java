package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Tournament;
import de.unidue.beckend_gruppe_q.model.TournamentBet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TournamentBetRepository extends JpaRepository<TournamentBet, Long> {
    TournamentBet findByTournament(Tournament tournament);
}
