package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class FriendList {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private Long userId;
    private Boolean istOeffentlich = false;

    public FriendList() {
    }

    public FriendList(Long userId, Boolean isPublic) {
        this.userId = userId;
        this.istOeffentlich = istOeffentlich;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Boolean getPublic() {
        return istOeffentlich;
    }

    public void setPublic(Boolean aPublic) {
        istOeffentlich = aPublic;
    }
}