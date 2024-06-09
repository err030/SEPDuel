package de.unidue.beckend_gruppe_q.model;

import de.unidue.beckend_gruppe_q.repository.UserRepository;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.stereotype.Repository;

@Data
@Entity
public class DuelRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Long sendUserId;
    private Long receivedUserId;
    private Long sendDeckId;
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

    @Override
    public String toString() {
        return "DuelRequest{" +
                "id=" + id +
                ", sendUserId=" + sendUserId +
                ", receivedUserId=" + receivedUserId +
                ", sendDeckId=" + sendDeckId +
                ", duellanfragStatus=" + duellanfragStatus +
                ", sendUser=" + sendUser +
                ", receivedUser=" + receivedUser +
                '}';
    }
}
