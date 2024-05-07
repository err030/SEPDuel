package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;

@Entity
public class LeaderBoardPunkt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
    private int points;

}
