package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class ChatHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Integer groupId;
    private Long msgFromUserId;
    private Long msgFromGroupId;
    private String msgText;
}
