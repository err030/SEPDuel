package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Chat;
import de.unidue.beckend_gruppe_q.model.Message;
import de.unidue.beckend_gruppe_q.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatOrderByTimestampAsc(Chat chat);

    List<Message> findBySender(User user);

    List<Message> findByMsgContent(String content);

    Message findMessageByMsgId(Long id);

    boolean deleteByMsgId(Long id);

    boolean deleteByChat(Chat chat);

}
