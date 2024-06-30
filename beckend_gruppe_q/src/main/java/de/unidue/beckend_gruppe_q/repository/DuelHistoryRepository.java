package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.DuelHistory;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DuelHistoryRepository extends CrudRepository<DuelHistory, Long> {
    public List<DuelHistory> findByPlayerAUsernameOrPlayerBUsername(String name);
}
