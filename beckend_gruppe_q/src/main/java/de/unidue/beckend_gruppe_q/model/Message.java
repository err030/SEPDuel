package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")

public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long msgId;

    private String uuid;
    private String msgContent;

    private String sender;  //Sender

    private String recipient; //Empfanger
    @ManyToOne
    private Chat chat;
    //Absenderkategorie (ich, Freund)
    private String senderType;
    private String msgType;// new_user Neuer Benutzer online|| server server Nachricht|| group_chat Gruppenchat Nachricht|| offline Benutzer offline
    private String fromUuid;
    private String chatGroupId;
    private LocalDateTime timestamp;
    @Column(name = "is_read", columnDefinition = "bit(1) default b'0'")
    private boolean isRead;

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    //Getter, Setter and others methodes
    public String getChatGroupId() {
        return chatGroupId;
    }

    public void setChatGroupId(String chatGroupId) {
        this.chatGroupId = chatGroupId;
    }

    public String getFromUuid() {
        return fromUuid;
    }

    public void setFromUuid(String fromUuid) {
        this.fromUuid = fromUuid;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getMsgType() {
        return msgType;
    }

    public void setMsgType(String msgType) {
        this.msgType = msgType;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public Long getMsgId() {
        return msgId;
    }

    public void setMsgId(Long msgId) {
        this.msgId = msgId;
    }

    public String getMsgContent() {
        return msgContent;
    }

    public void setMsgContent(String msgContent) {
        this.msgContent = msgContent;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public Chat getChat() {
        return chat;
    }

    public void setChat(Chat chat) {
        this.chat = chat;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(boolean read) {
        isRead = read;
    }

    @Override
    public String toString() {
        return "Message{" +
                "msgId=" + msgId +
                "uuid=" + uuid +
                "fromUuid=" + fromUuid +
                ", msgContent='" + msgContent + '\'' +
                ", sender=" + sender +
                ", senderType=" + senderType +
                ", msgType=" + msgType +
                ", recipient=" + recipient +
                ", chat=" + chat +
                ", timestamp=" + timestamp +
                ", isRead=" + isRead +
                '}';
    }
}
