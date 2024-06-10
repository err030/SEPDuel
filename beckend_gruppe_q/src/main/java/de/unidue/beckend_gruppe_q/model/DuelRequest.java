package de.unidue.beckend_gruppe_q.model;

import de.unidue.beckend_gruppe_q.repository.UserRepository;
import jakarta.persistence.*;
import org.springframework.stereotype.Repository;

@Entity
public class DuelRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Long sendUserId;
    private Long receivedUserId;
    private Integer duellanfragStatus = 0; // 0: online, 1: busy, 2:offline,3:accept,( 0:reject
    @Transient
    private User sendUser;
    @Transient
    private User receivedUser;


    public DuelRequest() {
    }

    public DuelRequest(Long sendUserId, Long receivedUserId, Integer duellanfragStatus) {
        this.sendUserId = sendUserId;
        this.receivedUserId = receivedUserId;
        this.duellanfragStatus = duellanfragStatus;

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSendUserId() {
        return sendUserId;
    }

    public void setSendUserId(Long sendUserId) {
        this.sendUserId = sendUserId;
    }

    public Long getReceivedUserId() {
        return receivedUserId;
    }

    public void setReceivedUserId(Long receivedUserId) {
        this.receivedUserId = receivedUserId;
    }

    public Integer getDuellanfragStatus() {
        return duellanfragStatus;
    }

    public void setDuellanfragStatus(Integer duellanfragStatus) {
        this.duellanfragStatus = duellanfragStatus;
    }

    public User getSendUser() {
        return sendUser;
    }

    public void setSendUser(User sendUser) {
        this.sendUser = sendUser;
    }

    public User getReceivedUser() {
        return receivedUser;
    }

    public void setReceivedUser(User receivedUser) {
        this.receivedUser = receivedUser;
    }
}
