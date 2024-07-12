package de.unidue.beckend_gruppe_q.service;

import de.unidue.beckend_gruppe_q.model.Chat;
import de.unidue.beckend_gruppe_q.model.Message;
import de.unidue.beckend_gruppe_q.repository.MessageRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Component
public class MessageService {
    private final MessageRepository messageRepository;

    //private final SimpMessagingTemplate messagingTemplate;
    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
        //SimpMessagingTemplate messagingTemplate
        //this.messagingTemplate = messagingTemplate;
    }

    public Message create(Message message) {
        message.setTimestamp(LocalDateTime.now());
        //message.setIsRead(false);
        Message savedMessage = messageRepository.save(message);
        // broadcast message to all participants in chat
        //messagingTemplate.convertAndSend("/user/chat/" + message.getChat().getId(), savedMessage);
        return savedMessage;
    }

    public List<Message> getMessagesForChat(Chat chat) {
        return messageRepository.findByChatOrderByTimestampAsc(chat);
    }

    public Message getMessageById(Long id) {
        return messageRepository.findMessageByMsgId(id);
    }

    public boolean deleteMessage(Long id) {
        return messageRepository.deleteByMsgId(id);
    }

    public boolean deleteAllMessages(Chat chat) {
        return messageRepository.deleteByChat(chat);
    }

    public void markAsRead(Long messageId) {
        Optional<Message> optionalMessage = messageRepository.findById(messageId);
        if (optionalMessage.isPresent()) {
            Message message = optionalMessage.get();
            message.setIsRead(true);
            messageRepository.save(message);
        }
    }
}
