package de.unidue.backend.table;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.util.Date;

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String vorname;
    private String nachname;
    private String email;
    private String passwort;
    private Date geburtstag;
    private String avatarUrl;
    private Integer groupId;
    private Long leaderboradPunkte;
    private Long sepCoins;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVorname() {
        return vorname;
    }

    public void setVorname(String vorname) {
        this.vorname = vorname;
    }

    public String getNachname() {
        return nachname;
    }

    public void setNachname(String nachname) {
        this.nachname = nachname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswort() {
        return passwort;
    }

    public void setPasswort(String passwort) {
        this.passwort = passwort;
    }

    public Date getGeburtstag() {
        return geburtstag;
    }

    public void setGeburtstag(Date geburtstag) {
        this.geburtstag = geburtstag;
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

    public Long getLeaderboradPunkte() {
        return leaderboradPunkte;
    }

    public void setLeaderboradPunkte(Long leaderboradPunkte) {
        this.leaderboradPunkte = leaderboradPunkte;
    }

    public Long getSepCoins() {
        return sepCoins;
    }

    public void setSepCoins(Long sepCoins) {
        this.sepCoins = sepCoins;
    }
}
