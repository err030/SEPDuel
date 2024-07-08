package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.DuelHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DuelHistoryRepository extends JpaRepository<DuelHistory, Long> {
    public List<DuelHistory> findByPlayerAUsernameOrPlayerBUsername(String name1, String name2);
}
