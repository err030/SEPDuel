package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Chat;
import de.unidue.beckend_gruppe_q.model.Message;
import de.unidue.beckend_gruppe_q.service.MessageService;
import de.unidue.beckend_gruppe_q.utility.WebSocketMessageHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/message")
public class MessageController {
    private final MessageService messageService;
    @Autowired
    private WebSocketMessageHandler webSocketHandler;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PutMapping("/{id}")
    public void edit(@PathVariable Long id, @RequestBody Message message) {
        message.setMsgId(id);
        messageService.create(message);
    }

    @GetMapping
    public List<Message> getAllMessages(Chat chat) {
        return messageService.getMessagesForChat(chat);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Message> getMessageById(@PathVariable Long id) {
        Message message = messageService.getMessageById(id);
        if (message != null) {
            return ResponseEntity.ok(message);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Void> createMessage(@RequestBody Message message) {
        messageService.create(message);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        boolean deleted = messageService.deleteMessage(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllMessages(Chat chat) {
        messageService.deleteAllMessages(chat);
        return ResponseEntity.noContent().build();
    }

}
