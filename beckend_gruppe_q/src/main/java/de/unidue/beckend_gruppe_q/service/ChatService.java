package de.unidue.beckend_gruppe_q.service;

import de.unidue.beckend_gruppe_q.model.Chat;
import de.unidue.beckend_gruppe_q.repository.ChatRepository;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
    private final ChatRepository chatRepository;

    public ChatService(ChatRepository chatRepository) {
        this.chatRepository = chatRepository;
    }

    public Chat create(Chat chat) {
        return chatRepository.save(chat);
    }
}
