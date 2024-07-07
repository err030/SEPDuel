package de.unidue.beckend_gruppe_q.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@NoArgsConstructor
public class TournamentInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER)
    private Tournament tournament;
    @ManyToOne(fetch = FetchType.EAGER)
    private User user;
    private boolean accepted;


    public TournamentInvitation(Tournament tournament, User user, boolean b) {
        this.tournament = tournament;
        this.user = user;
        this.accepted = b;
    }
}
