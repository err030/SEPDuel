package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;

@Entity
public class FriendRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Long schickenUserId;
    private Long zielUserId;
    private Integer freundschaftanfragStatus = 0; // 0: new, 1: accepted, 2: denied
    @Transient
    private User schickenUser;

    public FriendRequest() {
    }

    public FriendRequest(Long schickenUserId, Long zielUserId, Integer freundschaftanfragStatus) {
        this.schickenUserId = schickenUserId;
        this.zielUserId = zielUserId;
        this.freundschaftanfragStatus = freundschaftanfragStatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getZielUserId() {
        return zielUserId;
    }

    public void setZielUserId(Long zielUserId) {
        this.zielUserId = zielUserId;
    }

    public Long getSchickenUserId() {
        return schickenUserId;
    }

    public void setSchickenUserId(Long schickenUserId) {
        this.schickenUserId = schickenUserId;
    }

    public Integer getFreundschaftanfragStatus() {
        return freundschaftanfragStatus;
    }

    public void setFreundschaftanfragStatus(Integer freundschaftanfragStatus) {
        this.freundschaftanfragStatus = freundschaftanfragStatus;
    }

    public User getSchickenUser() {
        return schickenUser;
    }

    public void setSchickenUser(User schickenUser) {
        this.schickenUser = schickenUser;
    }
}