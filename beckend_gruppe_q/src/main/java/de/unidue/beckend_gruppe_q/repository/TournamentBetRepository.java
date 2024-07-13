package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Tournament;
import de.unidue.beckend_gruppe_q.model.TournamentBet;
import de.unidue.beckend_gruppe_q.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TournamentBetRepository extends JpaRepository<TournamentBet, Long> {
    TournamentBet findByTournament(Tournament tournament);

    List<TournamentBet> findByUserId(Long userId);

    TournamentBet findByTournamentAndUser(Tournament tournament, User user);
}
