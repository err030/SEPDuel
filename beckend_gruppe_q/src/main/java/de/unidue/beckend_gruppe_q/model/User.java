package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class User {
    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    public List<Deck> decks = new ArrayList<>();
    @ManyToMany(fetch = FetchType.EAGER)
    public List<Card> cards = new ArrayList<>();
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String username;
    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private Date birthday;
    private String avatarUrl;
    private Integer groupId;
    private Long sepCoins;
    private Integer status; //0:online, 1:
    private Long clanId;
    private String clanName;
    private boolean isRobot = false;
    @Setter
    @Getter
    @Column(name = "leader_board_punkt")
    private Long leaderBoardPunkt;
    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<Lootbox> lootboxes = new ArrayList<>();

//    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
//    public List<User> friends = new ArrayList<>();

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", vorname='" + firstname + '\'' +
                ", lastname='" + lastname + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", birthday=" + birthday +
                ", avatarUrl='" + avatarUrl + '\'' +
                ", groupId=" + groupId +
                ", sepCoins=" + sepCoins +
                ", leaderBoardPunkt=" + leaderBoardPunkt +
                ", decks=" + decks.toString() +
                ", cards=" + cards.toString() +
                '}';
    }

    public boolean isRobot() {
        return isRobot;
    }

    public void setRobot(boolean robot) {
        isRobot = robot;
    }
}
