package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.ChatHistory;
import org.springframework.data.repository.CrudRepository;

public interface ChatHistoryRepository extends CrudRepository<ChatHistory, Long> {
}
