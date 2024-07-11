package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.DuelRequestRepository;
import de.unidue.beckend_gruppe_q.repository.TournamentRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin
@RestController
public class LeaderboardController {
    private final UserRepository userRepository;
    private final DuelRequestRepository duelRequestRepository;
    private final DeckRepository deckRepository;
    private final TournamentRepository tournamentRepository;

    public LeaderboardController(UserRepository userRepository, DuelRequestRepository duelRequestRepository, DeckRepository deckRepository, TournamentRepository tournamentRepository) {
        this.userRepository = userRepository;
        this.duelRequestRepository = duelRequestRepository;
        this.deckRepository = deckRepository;
        this.tournamentRepository = tournamentRepository;
    }



    @PostMapping("/duelRequest/sendDuelRequest/{currentUserid}/{targetUserid}/{sendDeckId}")
    public ResponseEntity<?> sendDuelRequest(@PathVariable(value = "currentUserid") Long currentUserId,
                                             @PathVariable(value = "targetUserid") Long targetUserId,
                                             @PathVariable(value = "sendDeckId") Long sendDeckId) {
        System.out.println("sendDuelRequest");
        System.out.println("currentUserid: " + currentUserId);
        System.out.println("targetUserId: " + targetUserId);
        System.out.println("sendDeckId: " + sendDeckId);
        Optional<User> currentUser = userRepository.findById(currentUserId);
        Optional<User> targetUser = userRepository.findById(targetUserId);
        if (currentUser.isPresent() && targetUser.isPresent()) {
            if (currentUser.get().getStatus() == 0 && targetUser.get().getStatus() == 0) {
                DuelRequest newDuelRequest = new DuelRequest(currentUserId, targetUserId, 1);
                newDuelRequest.setSendDeckId(sendDeckId);
                currentUser.get().setStatus(1);
                targetUser.get().setStatus(1);
                userRepository.save(currentUser.get());
                userRepository.save(targetUser.get());
                duelRequestRepository.save(newDuelRequest);
                return ResponseEntity.status(HttpStatus.OK).body(newDuelRequest);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User can not play the game right now.");
            }
        } else {
            System.out.println("User not found." + currentUserId + " " + targetUserId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/duelRequest/getDuelRequests/{currentUserid}")
    public ResponseEntity<List<DuelRequest>> getDuelRequests(@PathVariable(value = "currentUserid") Long currentUserId) {
        List<DuelRequest> duelRequests = duelRequestRepository.findByReceivedUserIdOrderByDuellanfragStatus(currentUserId);
        duelRequests.forEach(request -> {
            Optional<User> senderOptional = userRepository.findById(request.getSendUserId());
            Optional<User> receiverOptional = userRepository.findById(request.getReceivedUserId());
            senderOptional.ifPresent(request::setSendUser);
            receiverOptional.ifPresent(request::setReceivedUser);

        });
        return ResponseEntity.ok().body(duelRequests);
    }

    @GetMapping("/duelRequest/getAllDuelRequests")
    public ResponseEntity<List<DuelRequest>> getAllDuelRequests() {
        List<DuelRequest> duelRequests = duelRequestRepository.findAll();
        return ResponseEntity.ok().body(duelRequests);
    }

    @GetMapping("/duelRequest/getDuelRequest/{duelRequestId}")
    public ResponseEntity<DuelRequest> getDuelRequest(@PathVariable(value = "duelRequestId") Long duelRequestId) {
        Optional<DuelRequest> duelRequestOptional = duelRequestRepository.findById(duelRequestId);
        if (duelRequestOptional.isPresent()) {
            return ResponseEntity.ok().body(duelRequestOptional.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);

    }


    @PutMapping("/duelRequest/updateDuelRequest")
    public ResponseEntity<?> acceptOrDenyDuelRequest(@RequestBody DuelRequest duelRequest) {
        System.out.println("Request received: " + duelRequest.toString());
        duelRequestRepository.save(duelRequest);
        // 更新状态为接受(3)或拒绝(0)
        if (duelRequest.getDuellanfragStatus() == 3 || duelRequest.getDuellanfragStatus() == 0) {
            duelRequest.setDuellanfragStatus(duelRequest.getDuellanfragStatus());
            // 更新 sendUser 和 receivedUser 的状态
            if (duelRequest.getSendUser() != null && duelRequest.getReceivedUser() != null) {
                User sender = userRepository.findById(duelRequest.getSendUser().getId()).orElse(null);
                User receiver = userRepository.findById(duelRequest.getReceivedUser().getId()).orElse(null);
                if (duelRequest.getDuellanfragStatus() == 3) {
                    sender.setStatus(3);
                    receiver.setStatus(3);
                } else {
                    sender.setStatus(0);
                    receiver.setStatus(0);
                    duelRequestRepository.delete(duelRequest);
                    return ResponseEntity.status(HttpStatus.OK).body(null);
                }
                userRepository.save(sender);
                userRepository.save(receiver);
            } else {
                // 如果 sendUser 或 receivedUser 为空,返回 400 Bad Request
                System.out.println("sendUser or receivedUser cannot be null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("sendUser or receivedUser cannot be null");
            }
            // 保存更新的 DuelRequest 和 User 实体
            duelRequestRepository.save(duelRequest);

            // 返回更新后的状态给前端
            return ResponseEntity.status(HttpStatus.OK).body(duelRequest.getDuellanfragStatus());
        } else {
            // 如果状态不是3或4，返回400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid duellanfrag status");
        }


    }
}


