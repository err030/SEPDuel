package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.*;
import de.unidue.beckend_gruppe_q.service.RobotService;
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

    private UserRepository userRepository;
    private DeckRepository deckRepository;
    private CardRepository cardRepository;
    private DuelRequestRepository duelRequestRepository;
    final RobotService robotService;

    private DuelHistoryRepository duelHistoryRepository;

    private Player player1;
    private Player player2;
    private Map<Long, Duel> duels = new ConcurrentHashMap<>();
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
    @PostMapping("/api/duel/createRobotDuel/{duelId}/{userId}/{deck1Id}")
    public ResponseEntity<?> createRobotDuel(@PathVariable long duelId, @PathVariable Long userId, @PathVariable long deck1Id) {
        // 获取当前用户
        System.out.println("Received request to create robot duel: duelId=" + duelId + ", userId=" + userId + ", deck1Id=" + deck1Id);
        User user = userRepository.findById(userId).orElse(null);
        User robot = userRepository.findByEmail("robot@robot.com").orElse(null);
        if (user != null && robot!=null) {
            List<Card> robotCards = robotService.generateRandomDeck();
            Deck robotDeck = new Deck("Robot Deck", "A deck for the robot opponent", robotCards);

            Player player1 = new Player(user, deckRepository.findById(deck1Id).get());
            Player player2 = new Player(robot, robotDeck);

            Duel duel = new Duel(player1, player2);
            duel.setId(duelId);
            duels.put(duel.getId(), duel);
            System.out.println("Duel created: " + duel);
            duel.start();
            this.startTimer(duelId);
            return ResponseEntity.status(HttpStatus.OK).body(duel);
        }
        else{
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

    public DuelController(UserRepository userRepository, DeckRepository deckRepository, CardRepository cardRepository, DuelRequestRepository duelRequestRepository, DuelHistoryRepository duelHistoryRepository,RobotService robotService) {
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
        this.cardRepository = cardRepository;
        this.duelRequestRepository = duelRequestRepository;
        this.duelHistoryRepository = duelHistoryRepository;
        this.robotService = robotService;
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

    private void robotPlay(Duel duel) {
        boolean attackPlayer = true;
        while (duel.getCurrentPlayer().isRobot() && !duel.isGameFinished()) {
            Player robot = duel.getCurrentPlayer();

            // Logic for summoning a card
            Optional<Card> cardToSummon = robot.getHand().stream()
                    .filter(card -> card.getRarity().equals(Rarity.COMMON) )
                    .findFirst();

            if (cardToSummon.isPresent()) {
                Card card = cardToSummon.get();
                duel.summon(card);
                System.out.println("Robot summoned card: " + card.getName());
            } else {
                // Check if there are RARE or LEGENDARY cards that can be summoned
                cardToSummon = robot.getHand().stream()
                        .filter(card -> (card.getRarity().equals(Rarity.RARE) && robot.getTable().size() >= 2) ||
                                (card.getRarity().equals(Rarity.LEGENDARY) && robot.getTable().size() >= 3))
                        .findFirst();

                if (cardToSummon.isPresent()) {
                    Card card = cardToSummon.get();
                    if (card.getRarity().equals(Rarity.RARE) && robot.getTable().size() >= 2) {
                        // Sacrifice 2 cards to summon a RARE card
                        List<Card> cardsToSacrifice = robot.getTable().stream().limit(2).toList();
                        if (duel.sacrificeCard(cardsToSacrifice.get(0).getId(), cardsToSacrifice.get(1).getId()) != null) {
                            System.out.println("Robot sacrificed 2 cards to summon RARE card: " + card.getName());
                        }
                    } else if (card.getRarity().equals(Rarity.LEGENDARY) && robot.getTable().size() >= 3) {
                        // Sacrifice 3 cards to summon a LEGENDARY card
                        List<Card> cardsToSacrifice = robot.getTable().stream().limit(3).toList();
                        if (duel.sacrificeCard(cardsToSacrifice.get(0).getId(), cardsToSacrifice.get(1).getId(), cardsToSacrifice.get(2).getId()) != null) {
                            System.out.println("Robot sacrificed 3 cards to summon LEGENDARY card: " + card.getName());
                        }
                    }
                }
            }

            Optional<Card> attacker = robot.getTable().stream().filter(Card::isCanAttack).findFirst();
            if (attackPlayer) {
                // 攻击玩家
                attacker.ifPresent(atk -> {
                    duel.attack(atk, null);
                    System.out.println("Robot attacked player with card: " + atk.getName());
                });
            } else {
                // 攻击防御方
                Optional<Card> defender = duel.getOpponent().getTable().stream().findFirst();
                attacker.ifPresent(atk -> {
                    duel.attack(atk, defender.orElse(null));
                    System.out.println("Robot attacked opponent's card with card: " + atk.getName());
                });
            }

            // 交替攻击玩家和防御方
            attackPlayer = !attackPlayer;

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
        }else{
            a.setStatus(0);
            b.setStatus(0);
        }

        DuelHistory duelHistory = new DuelHistory(duel);
        if (duel.getWinnerId() == a.getId()) {
            a.setSepCoins(a.getSepCoins() + 100);
            long bonusPoints = Math.max(50, (b.getLeaderBoardPunkt() - a.getLeaderBoardPunkt()));
            a.setLeaderBoardPunkt(a.getLeaderBoardPunkt() + bonusPoints);
            b.setLeaderBoardPunkt(b.getLeaderBoardPunkt() - bonusPoints);
            duelHistory.setPlayerABonusPoints(bonusPoints);
            duelHistory.setPlayerBBonusPoints(-bonusPoints);
        } else {
            b.setSepCoins(b.getSepCoins() + 100);
            long bonusPoints = Math.max(50, (a.getLeaderBoardPunkt() - b.getLeaderBoardPunkt()));
            b.setLeaderBoardPunkt(b.getLeaderBoardPunkt() + bonusPoints);
            a.setLeaderBoardPunkt(a.getLeaderBoardPunkt() - bonusPoints);
            duelHistory.setPlayerBBonusPoints(bonusPoints);
            duelHistory.setPlayerABonusPoints(-bonusPoints);
        }



        userRepository.save(a);
        userRepository.save(b);
        duelHistoryRepository.save(duelHistory);
        duelRequestRepository.deleteById(id);
        duels.remove(id);
        return null;
    }


}
