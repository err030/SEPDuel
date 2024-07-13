package de.unidue.beckend_gruppe_q.model;

public class Friend {
    private User user;
    private Integer statusVonFreundschaftanfrag;
    private Boolean istSchonFreunde = false;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getStatusVonFreundschaftanfrag() {
        return statusVonFreundschaftanfrag;
    }

    public void setStatusVonFreundschaftanfrag(Integer statusVonFreundschaftanfrag) {
        this.statusVonFreundschaftanfrag = statusVonFreundschaftanfrag;
    }

    public Boolean getIstSchonFreunde() {
        return istSchonFreunde;
    }

    public void setIstSchonFreunde(Boolean istSchonFreunde) {
        this.istSchonFreunde = istSchonFreunde;
    }
}