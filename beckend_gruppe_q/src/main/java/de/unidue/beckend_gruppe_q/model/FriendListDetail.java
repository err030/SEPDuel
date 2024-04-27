package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
@Entity
public class FriendListDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Long freundListId;
    private Long freundUserId;

    public FriendListDetail(Long freundListId, Long freundUserId) {
        this.freundListId = freundListId;
        this.freundUserId = freundUserId;
    }

    public FriendListDetail() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFreundListId() {
        return freundListId;
    }

    public void setFreundListId(Long freundListId) {
        this.freundListId = freundListId;
    }

    public Long getFreundUserId() {
        return freundUserId;
    }

    public void setFreundUserId(Long freundUserId) {
        this.freundUserId = freundUserId;
    }
}