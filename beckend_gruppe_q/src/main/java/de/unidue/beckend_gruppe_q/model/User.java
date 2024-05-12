package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class User {
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
    private Long leaderBoardPunkt;


    @OneToMany
    public List<Deck> decks = new ArrayList<>();

    @OneToMany
    public List<Card> cards = new ArrayList<>();



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
}
