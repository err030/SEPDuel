package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
}
