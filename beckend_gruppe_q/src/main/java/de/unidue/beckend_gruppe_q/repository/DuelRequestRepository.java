package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.DuelRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DuelRequestRepository extends JpaRepository<DuelRequest, Long> {
    List<DuelRequest> findByReceivedUserIdOrderByDuellanfragStatus(Long receivedUserId);
}
