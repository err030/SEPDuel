package de.unidue.beckend_gruppe_q.controller;


import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.DuelRequestRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import de.unidue.beckend_gruppe_q.service.DuelService;
import de.unidue.beckend_gruppe_q.service.RobotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@CrossOrigin
@RestController
public class RobotController {
    final RobotService robotService;
    final UserRepository userRepository;
    final DeckRepository deckRepository;
    final DuelService duelService;
    final CardRepository cardRepository;
    final DuelRequestRepository duelRequestRepository ;

    private Player player1;
    private Player player2;
    private Map<Long, Duel> duels = new ConcurrentHashMap<>();
    private final Map<Long, Long> duelTimers = new ConcurrentHashMap<>();

    public void startTimer(long duelId) {
        duelTimers.put(duelId, System.currentTimeMillis());
    }

    public RobotController(RobotService robotService, UserRepository userRepository, DeckRepository deckRepository, DuelService duelService, CardRepository cardRepository, DuelRequestRepository duelRequestRepository) {
        this.robotService = robotService;
        this.userRepository = userRepository;
        this.deckRepository = deckRepository;
        this.duelService = duelService;
        this.cardRepository = cardRepository;
        this.duelRequestRepository = duelRequestRepository;
    }


    @PostMapping("/duelRequest/createRobotRequest/{currentUserid}/{sendDeckId}")
    public ResponseEntity<?> createRobotRequest(@PathVariable(value = "currentUserid") Long currentUserId,
                                             @PathVariable(value = "sendDeckId") Long sendDeckId) {
        Optional<User> currentUser = userRepository.findById(currentUserId);
        Optional<User> targetUser = userRepository.findByEmail("robot@robot.com");
        if (currentUser.isPresent() && targetUser.isPresent()) {
            DuelRequest newDuelRequest = new DuelRequest(currentUserId, targetUser.get().getId(), 3);
            newDuelRequest.setSendDeckId(sendDeckId);
            currentUser.get().setStatus(3);
            targetUser.get().setStatus(0);
            userRepository.save(currentUser.get());
            userRepository.save(targetUser.get());
            duelRequestRepository.save(newDuelRequest);
            return ResponseEntity.status(HttpStatus.OK).body(newDuelRequest);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
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








}