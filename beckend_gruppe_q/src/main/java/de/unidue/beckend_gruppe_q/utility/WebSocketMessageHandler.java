package de.unidue.beckend_gruppe_q.utility;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.unidue.beckend_gruppe_q.model.Message;
import de.unidue.beckend_gruppe_q.service.MessageService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class WebSocketMessageHandler {

    private final MessageService messageService;
    public WebSocketMessageHandler(MessageService messageService) {
        this.messageService = messageService;
    }
    //@Override  Problem : Extract method ‘registerWebSocketHandlers’ to new interface
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new SocketHandler(), "/webSocketServer");
    }

    private class SocketHandler extends TextWebSocketHandler {
        @Override
        public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
            // Behandlung von Textnachrichten
            System.out.printf("Received message:"+message);
            String payload = message.getPayload();
            session.sendMessage(new TextMessage("Received message: " + payload));

            ObjectMapper objectMapper = new ObjectMapper();
            Message receivedMessage = objectMapper.readValue(message.getPayload(), Message.class);
            Message savedMessage = messageService.create(receivedMessage);
            TextMessage response = new TextMessage(objectMapper.writeValueAsString(savedMessage));
            session.sendMessage(response);
        }
    }
}
