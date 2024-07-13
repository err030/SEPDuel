package de.unidue.beckend_gruppe_q.model;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class TournamentBet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER)
    private Tournament tournament;
    @ManyToOne(fetch = FetchType.EAGER)
    private User user;
    private Long betOnUserId;


}
