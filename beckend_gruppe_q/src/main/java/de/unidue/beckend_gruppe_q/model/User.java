package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;

import java.util.Date;

@Entity
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
    @OneToOne(mappedBy = "user")
    private LeaderBoardPunkt leaderBoardPunkt;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Date getBirthday() {
        return birthday;
    }

    public void setBirthday(Date birthday) {
        this.birthday = birthday;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Integer getGroupId() {
        return groupId;
    }

    public void setGroupId(Integer groupId) {
        this.groupId = groupId;
    }


    public Long getSepCoins() {
        return sepCoins;
    }

    public void setSepCoins(Long sepCoins) {
        this.sepCoins = sepCoins;
    }

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
                '}';
    }
}
