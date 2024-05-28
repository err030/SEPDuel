package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "messages")
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long msgId;

    private String uuid;
    private String msgContent;

    private String sender;  //Sender

    private String recipient; //Empfanger

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    @ManyToOne
    private Chat chat;
    //Absenderkategorie (ich, Freund)
    private String senderType;

    private String msgType;// new_user Neuer Benutzer online|| server server Nachricht|| group_chat Gruppenchat Nachricht|| offline Benutzer offline

    private String fromUuid;

    private String chatGroupId;
}
