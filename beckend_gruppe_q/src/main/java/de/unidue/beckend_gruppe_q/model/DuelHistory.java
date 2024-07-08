package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class DuelHistory {

    @Id
    @GeneratedValue
    private Long id;

    private String playerAUsername;

    private String playerBUsername;

    private String winnerUsername;

    private Long playerABonusPoints;

    private Long playerBBonusPoints;

    public DuelHistory(Duel duel) {
        this.playerAUsername = duel.getPlayerA().getName();

        this.playerBUsername = duel.getPlayerB().getName();

        this.winnerUsername = duel.getWinnerId() == duel.getPlayerA().getId() ? duel.getPlayerA().getName() : duel.getPlayerB().getName();
    }
}
