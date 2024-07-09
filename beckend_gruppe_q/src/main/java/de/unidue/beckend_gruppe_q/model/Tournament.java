package de.unidue.beckend_gruppe_q.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Tournament {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @ManyToOne
    private Clan clan;
    private String status; // waiting, in_progress, completed
    private int currentRound;
    @ManyToMany(fetch = FetchType.EAGER)
    private List<User> participants;
    @OneToMany
    public List<DuelRequest> duelRequests = new ArrayList<>();
    private Long winnerId;
}
