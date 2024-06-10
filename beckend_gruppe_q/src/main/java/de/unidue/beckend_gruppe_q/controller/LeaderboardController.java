package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.DuelRequestRepository;
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

    public LeaderboardController(UserRepository userRepository, DuelRequestRepository duelRequestRepository) {
        this.userRepository = userRepository;
        this.duelRequestRepository = duelRequestRepository;
    }



    @PostMapping("/duelRequest/sendDuelRequest/{currentUserid}/{targetUserid}")
    public ResponseEntity<?> sendDuelRequest(@PathVariable(value = "currentUserid") Long currentUserId,
                                             @PathVariable(value = "targetUserid") Long targetUserId) {
        Optional<User> currentUser = userRepository.findById(currentUserId);
        Optional<User> targetUser = userRepository.findById(targetUserId);
        if (currentUser.isPresent() && targetUser.isPresent()) {
            if (currentUser.get().getStatus() == 0 && targetUser.get().getStatus() == 0) {
                DuelRequest newDuelRequest = new DuelRequest(currentUserId, targetUserId, 1);
                currentUser.get().setStatus(1);
                targetUser.get().setStatus(1);
                userRepository.save(currentUser.get());
                userRepository.save(targetUser.get());
                duelRequestRepository.save(newDuelRequest);
                return ResponseEntity.status(HttpStatus.OK).body(null);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User can not play the game right now.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/duelRequest/getDuelRequests/{currentUserid}")
    public ResponseEntity<List<DuelRequest>> getDuelRequests(@PathVariable(value = "currentUserid") Long currentUserId) {
        List<DuelRequest> duelRequests = duelRequestRepository.findByReceivedUserIdOrderByDuellanfragStatus(currentUserId);
        duelRequests.forEach(request -> {
            Optional<User> senderOptional = userRepository.findById(request.getSendUserId());
            senderOptional.ifPresent(request::setSendUser);

        });
        return ResponseEntity.ok().body(duelRequests);
    }


    @PutMapping("/duelRequest/updateDuelRequest")
    public ResponseEntity<?> acceptOrDenyDuelRequest(@RequestBody DuelRequest duelRequest) {
        duelRequestRepository.save(duelRequest);
        // 更新状态为接受(3)或拒绝(4)
        if (duelRequest.getDuellanfragStatus() == 3 || duelRequest.getDuellanfragStatus() == 0) {
            duelRequest.setDuellanfragStatus(duelRequest.getDuellanfragStatus());
            // 更新 sendUser 和 receivedUser 的状态
            if (duelRequest.getSendUser() != null && duelRequest.getReceivedUser() != null) {
                if (duelRequest.getDuellanfragStatus() == 3) {
                    duelRequest.getSendUser().setStatus(3);
                    duelRequest.getReceivedUser().setStatus(3);
                    
                } else {
                    duelRequest.getSendUser().setStatus(0);
                    duelRequest.getReceivedUser().setStatus(0);
                }
            } else {
                // 如果 sendUser 或 receivedUser 为空,返回 400 Bad Request
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("sendUser or receivedUser cannot be null");
            }
            // 保存更新的 DuelRequest 和 User 实体
            duelRequestRepository.save(duelRequest);
            userRepository.save(duelRequest.getSendUser());
            userRepository.save(duelRequest.getReceivedUser());

            // 返回更新后的状态给前端
            return ResponseEntity.status(HttpStatus.OK).body(duelRequest.getDuellanfragStatus());
        } else {
            // 如果状态不是3或4，返回400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid duellanfrag status");
        }


    }
}


