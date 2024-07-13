package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.*;
import de.unidue.beckend_gruppe_q.service.RobotService;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    final RobotService robotService;
    private final TournamentController tournamentController;
    private final Map<Long, Long> duelTimers = new ConcurrentHashMap<>();
    public Map<Long, Duel> duels = new ConcurrentHashMap<>();
    private UserRepository userRepository;
    private DeckRepository deckRepository;
    private CardRepository cardRepository;
    private DuelRequestRepository duelRequestRepository;
    private DuelHistoryRepository duelHistoryRepository;
    private Player player1;
    private Player player2;

    public DuelController(UserRepository userRepository, DeckRepository deckRepository, CardRepository cardRepository, DuelRequestRepository duelRequestRepository, DuelHistoryRepository duelHistoryRepository, @Lazy TournamentController tournamentController, RobotService robotService) {
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
        this.cardRepository = cardRepository;
        this.duelRequestRepository = duelRequestRepository;
        this.duelHistoryRepository = duelHistoryRepository;
        this.tournamentController = tournamentController;
        this.robotService = robotService;
    }

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
        duel.setRobotDuel(false);
        duels.put(duel.getId(), duel);
        System.out.println("Duel created: " + duel);
        duel.start();
        this.startTimer(duelId);
        return duel;
    }

    @PostMapping("/api/duel/createRobotDuel/{duelId}/{userId}/{deck1Id}")
    public ResponseEntity<?> createRobotDuel(@PathVariable long duelId, @PathVariable Long userId, @PathVariable long deck1Id) {
        // 获取当前用户
        System.out.println("Received request to create robot duel: duelId=" + duelId + ", userId=" + userId + ", deck1Id=" + deck1Id);
        User user = userRepository.findById(userId).orElse(null);
        User robot = userRepository.findByEmail("robot@robot.com").orElse(null);
        if (user != null && robot != null) {
            List<Card> robotCards = robotService.generateRandomDeck();
            Deck robotDeck = new Deck("Robot Deck", "A deck for the robot opponent", robotCards);

            Player player1 = new Player(user, deckRepository.findById(deck1Id).get());
            Player player2 = new Player(robot, robotDeck);

            Duel duel = new Duel(player1, player2);
            duel.setId(duelId);
            duel.setRobotDuel(true);
            duels.put(duel.getId(), duel);
            System.out.println("Duel created: " + duel);
            duel.start();
            this.startTimer(duelId);
            return ResponseEntity.status(HttpStatus.OK).body(duel);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
        }
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
        if (duel.getCurrentPlayer().isRobot()) {
            robotPlay(duel);
        }
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

    private void robotPlay(Duel duel) {
        while (duel.getCurrentPlayer().isRobot() && !duel.isGameFinished()) {
            Player robot = duel.getCurrentPlayer();

            // Call summon method from RobotService
            robotService.summonCard(duel);

            // Call attack method from RobotService
            robotService.robotAttack(duel);

            // Alternate attack between player and defender


            // Move to next round
            duel.nextRound();
        }
    }


    //reserved
    @GetMapping("/api/duel/{id}/exit")
    public Duel endGame(@PathVariable long id) {
        Duel duel = duels.get(id);
        if (duel == null) {
            return null;
        }

        DuelRequest request = duelRequestRepository.findById(id).orElse(null);
        if (request == null) {
            return null;
        }

        User a = userRepository.findById(request.getSendUserId()).orElse(null);
        User b = userRepository.findById(request.getReceivedUserId()).orElse(null);
        if (a == null || b == null) {
            return null;
        } else {
            a.setStatus(0);
            b.setStatus(0);
        }

        DuelHistory duelHistory = new DuelHistory(duel);
        String winnerUsername = "";
        if (!duel.isRobotDuel()) {
            if (duel.getWinnerId() == a.getId()) {
                a.setSepCoins(a.getSepCoins() + 100);
                long bonusPoints = Math.max(50, (b.getLeaderBoardPunkt() - a.getLeaderBoardPunkt()));
                long penaltyPoints = Math.max(50, (b.getLeaderBoardPunkt() - a.getLeaderBoardPunkt()) / 2);
                a.setLeaderBoardPunkt(a.getLeaderBoardPunkt() + bonusPoints);
                b.setLeaderBoardPunkt(b.getLeaderBoardPunkt() - penaltyPoints);
                duelHistory.setPlayerABonusPoints(bonusPoints);
                duelHistory.setPlayerBBonusPoints(-penaltyPoints);
                winnerUsername = a.getUsername();
            } else {
                b.setSepCoins(b.getSepCoins() + 100);
                long bonusPoints = Math.max(50, (a.getLeaderBoardPunkt() - b.getLeaderBoardPunkt()));
                long penaltyPoints = Math.max(50, (a.getLeaderBoardPunkt() - b.getLeaderBoardPunkt()) / 2);
                b.setLeaderBoardPunkt(b.getLeaderBoardPunkt() + bonusPoints);
                a.setLeaderBoardPunkt(a.getLeaderBoardPunkt() - penaltyPoints);
                duelHistory.setPlayerBBonusPoints(bonusPoints);
                duelHistory.setPlayerABonusPoints(-penaltyPoints);
                winnerUsername = b.getUsername();
            }
        } else {
            if (duel.getWinnerId() == a.getId()) {
                a.setSepCoins(a.getSepCoins() + 50);
            }
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

    @GetMapping("/api/duel/{id}/isRobotDuel")
    public ResponseEntity<Boolean> isRobotDuel(@PathVariable long id) {
        Duel duel = duels.get(id);
        return ResponseEntity.ok(duel.isRobotDuel());
    }


}
