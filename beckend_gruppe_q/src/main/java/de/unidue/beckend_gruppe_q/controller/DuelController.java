package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@CrossOrigin
public class DuelController {

    private UserRepository userRepository;
    private DeckRepository deckRepository;
    private CardRepository cardRepository;
    private DuelRequestRepository duelRequestRepository;

    private DuelHistoryRepository duelHistoryRepository;

    private final TournamentController tournamentController;

    private Player player1;
    private Player player2;
    public Map<Long, Duel> duels = new ConcurrentHashMap<>();
    private final Map<Long, Long> duelTimers = new ConcurrentHashMap<>();

    public void startTimer(long duelId) {
        duelTimers.put(duelId, System.currentTimeMillis());
    }


    @GetMapping("/api/duel/{id}")
    public Duel getDuel(@PathVariable long id) {
        return duels.get(id);
    }

    @Scheduled(fixedRate = 1000) // Run every second
    public void checkDuelTimers() throws InterruptedException {
        long currentTime = System.currentTimeMillis();
        for (Map.Entry<Long, Long> entry : duelTimers.entrySet()) {
            long duelId = entry.getKey();
            long startTime = entry.getValue();
            long elapsedTime = currentTime - startTime;
            Duel duel = duels.get(duelId);
            if (duel == null) {
                duelTimers.remove(duelId);
                continue;
            }
            duel.setRemainingTime(120000 - elapsedTime);
            if (elapsedTime >= 120000) { // 120 seconds
                Duel d = this.duels.get(duelId);
                d.getCurrentPlayer().setHp(-1);
                d.setGameFinished(true);
                d.setWinnerId(d.getOpponent().getId());
                duelTimers.clear();
                Thread.sleep(5000);
                endGame(duelId);
            }
        }
    }

    @GetMapping("/api/duel/create/{duelId}/{Deck1Id}/{Deck2Id}")
    public Duel createDuel(@PathVariable long duelId, @PathVariable long Deck1Id, @PathVariable long Deck2Id) {
        System.out.println(duelId);
        System.out.println(duelRequestRepository.findById(duelId).get().toString());

        long user1Id = duelRequestRepository.findById(duelId).get().getSendUserId();
        long user2Id = duelRequestRepository.findById(duelId).get().getReceivedUserId();


        Optional<User> ouser1 = userRepository.findById(user1Id);
        Optional<User> ouser2 = userRepository.findById(user2Id);

        if (ouser1.isEmpty() || ouser2.isEmpty()) {
            throw new IllegalStateException("User not found");
        }
        User user1 = ouser1.get();
        User user2 = ouser2.get();

        Player player1 = new Player(user1, deckRepository.findById(Deck1Id).get());
        Player player2 = new Player(user2, deckRepository.findById(Deck2Id).get());

        Duel duel = new Duel(player1, player2);
        duel.setId(duelId);
        duels.put(duel.getId(), duel);
        System.out.println("Duel created: " + duel);
        duel.start();
        this.startTimer(duelId);
        return duel;
    }

    @GetMapping("/api/duel/{id}/start")
    public Duel startDuel(@PathVariable long id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.start();

        return duel;
    }

    @GetMapping("/api/duel/{id}/next")
    public Duel nextRound(@PathVariable long id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.nextRound();
        this.startTimer(id);
        return duel;
    }

    @GetMapping("/api/duel/{id}/sacrifice")
    public Card sacrificeCard(@PathVariable long id, @RequestParam long... cardIds) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        Card bonusCard = duel.sacrificeCard(cardIds);
        return bonusCard;
    }

    public DuelController(UserRepository userRepository, DeckRepository deckRepository, CardRepository cardRepository, DuelRequestRepository duelRequestRepository, DuelHistoryRepository duelHistoryRepository, @Lazy TournamentController tournamentController) {
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
        this.cardRepository = cardRepository;
        this.duelRequestRepository = duelRequestRepository;
        this.duelHistoryRepository = duelHistoryRepository;
        this.tournamentController = tournamentController;
    }

    @GetMapping("/api/duel/{id}/attack")
    public Duel attack(@PathVariable Long id,
                       @RequestParam Long attackerId,
                       @RequestParam(required = false) Long defenderId) {
        System.out.println("attackerId: " + attackerId);
        System.out.println("defenderId: " + defenderId);

        Duel duel = duels.get(id);
        System.out.println("Currentplayer Table:" + duel.getCurrentPlayer().getTable().toString());

        System.out.println("Opponent Table:" + duel.getOpponent().getTable().toString());
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        Card atk = duel.getCurrentPlayer().getTable().stream().filter(c -> Objects.equals(c.getId(), attackerId)).findFirst().get();
        Card def = null;
        if (defenderId != null) {
            def = duel.getOpponent().getTable().stream().filter(c -> Objects.equals(c.getId(), defenderId)).findFirst().get();
        }
        duel.attack(atk, def);
        if (duel.isGameFinished()) duelTimers.remove(duel.getId());

        return duel;
    }

    @GetMapping("/api/duel/{id}/summon/{cardId}")
    public Duel summon(@PathVariable long id, @PathVariable long cardId) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        Card card = cardRepository.findById(cardId).get();
        if (duel.existsInHand(card)) {
            duel.summon(card);
        } else {
            throw new IllegalStateException("Card does not exist");
        }

        return duel;
    }


    //reserved
    @GetMapping("/api/duel/{id}/exit")
    public Duel endGame(@PathVariable long id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            return null;
        }

        DuelRequest request = duelRequestRepository.findById(id).get();
        User a = userRepository.findById(request.getSendUserId()).get();
        User b = userRepository.findById(request.getReceivedUserId()).get();
        a.setStatus(0);
        b.setStatus(0);
        DuelHistory duelHistory = new DuelHistory(duel);
        String winnerUsername;
        if (duel.getWinnerId() == a.getId()) {
            a.setSepCoins(a.getSepCoins() + 100);
            long bonusPoints = Math.max(50, (b.getLeaderBoardPunkt() - a.getLeaderBoardPunkt()));
            a.setLeaderBoardPunkt(a.getLeaderBoardPunkt() + bonusPoints);
            b.setLeaderBoardPunkt(b.getLeaderBoardPunkt() - bonusPoints);
            duelHistory.setPlayerABonusPoints(bonusPoints);
            duelHistory.setPlayerBBonusPoints(-bonusPoints);
            winnerUsername = a.getUsername();
        } else {
            b.setSepCoins(b.getSepCoins() + 100);
            long bonusPoints = Math.max(50, (a.getLeaderBoardPunkt() - b.getLeaderBoardPunkt()));
            b.setLeaderBoardPunkt(b.getLeaderBoardPunkt() + bonusPoints);
            a.setLeaderBoardPunkt(a.getLeaderBoardPunkt() - bonusPoints);
            duelHistory.setPlayerBBonusPoints(bonusPoints);
            duelHistory.setPlayerABonusPoints(-bonusPoints);
            winnerUsername = b.getUsername();
        }
        userRepository.save(a);
        userRepository.save(b);
        duelHistoryRepository.save(duelHistory);
        duelRequestRepository.deleteById(id);
        duels.remove(id);
        tournamentController.checkIfTournamentEnded(winnerUsername);
        return null;
    }

    @GetMapping("/api/duel/{id}/visibility/{visible}")
    public Duel setVisibility(@PathVariable long id, @PathVariable boolean visible) {
        Duel duel = duels.get(id);
        if (duel == null) {
            throw new IllegalStateException("Duel not found");
        }
        duel.setVisibility(visible);
        return duel;
    }

    @GetMapping("/api/duel/visible_list")
    public List<Duel> getVisibleDuelList() {
        return this.duels.values().stream().filter(d -> d.isVisibility()).toList();
    }


}
