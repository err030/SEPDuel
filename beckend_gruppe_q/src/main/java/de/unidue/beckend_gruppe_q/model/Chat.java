package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "chats")
@Data
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String type; //Chat-Typen: Privat, Gruppen-Chat
    @ManyToMany
    private List<User> participants;

    private String creatorId;

    private String chatUserIds;
}
