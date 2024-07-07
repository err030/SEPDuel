package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.TournamentInvitation;
import de.unidue.beckend_gruppe_q.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TournamentInvitationRepository extends JpaRepository<TournamentInvitation, Long> {
    List<TournamentInvitation> findByUserAndAcceptedIsFalse(User user);

    List<TournamentInvitation> findByTournamentId(Long tournamentId);
}
