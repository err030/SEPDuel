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
import org.springframework.web.bind.annotation.*;


import java.util.Optional;

@CrossOrigin
@RestController
public class RobotController {
    final RobotService robotService;
    final UserRepository userRepository;
    final DeckRepository deckRepository;
    final DuelService duelService;
    final CardRepository cardRepository;
    final DuelRequestRepository duelRequestRepository ;


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











}