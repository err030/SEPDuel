package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.DuelRequestRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
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

    public DuelController(UserRepository userRepository, DeckRepository deckRepository, CardRepository cardRepository, DuelRequestRepository duelRequestRepository) {
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
        this.cardRepository = cardRepository;
        this.duelRequestRepository = duelRequestRepository;
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
            throw new IllegalStateException("Duel not found");
        }

        DuelRequest request = duelRequestRepository.findById(id).get();
        User a = userRepository.findById(request.getSendUserId()).get();
        User b = userRepository.findById(request.getReceivedUserId()).get();
        a.setStatus(0);
        b.setStatus(0);
        if (duel.getWinnerId() == a.getId()) {
            a.setSepCoins(a.getSepCoins() + 100);
            a.setLeaderBoardPunkt(a.getLeaderBoardPunkt() + Math.max(50, (b.getLeaderBoardPunkt() - a.getLeaderBoardPunkt())));
            b.setLeaderBoardPunkt(b.getLeaderBoardPunkt() - Math.max(50, (b.getLeaderBoardPunkt() - a.getLeaderBoardPunkt())));
        } else {
            b.setSepCoins(b.getSepCoins() + 100);
            b.setLeaderBoardPunkt(b.getLeaderBoardPunkt() + Math.max(50, (a.getLeaderBoardPunkt() - b.getLeaderBoardPunkt())));
            a.setLeaderBoardPunkt(a.getLeaderBoardPunkt() - Math.max(50, (a.getLeaderBoardPunkt() - b.getLeaderBoardPunkt())));
        }
        userRepository.save(a);
        userRepository.save(b);
        duelRequestRepository.deleteById(id);
        duels.remove(id);
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
