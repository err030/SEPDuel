package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Friend;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.model.FriendListDetail;
import de.unidue.beckend_gruppe_q.model.FriendRequest;
import de.unidue.beckend_gruppe_q.model.FriendList;
import de.unidue.beckend_gruppe_q.repository.FriendRequestRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import de.unidue.beckend_gruppe_q.repository.FriendListRepository;
import de.unidue.beckend_gruppe_q.repository.FriendListDetailRepository;
import de.unidue.beckend_gruppe_q.Service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@CrossOrigin
@RestController
public class FriendController{
    final UserRepository userRepository;
    final FriendListRepository friendListRepository;
    final FriendListDetailRepository friendListDetailRepository;
    final FriendRequestRepository friendRequestRepository;
    final EmailService eMailService;

    public FriendController(UserRepository userRepository, FriendListRepository friendListRepository,
                            FriendListDetailRepository friendListDetailRepository, FriendRequestRepository friendRequestRepository, EmailService eMailService) {
        this.userRepository = userRepository;
        this.friendListRepository = friendListRepository;
        this.friendListDetailRepository = friendListDetailRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.eMailService = eMailService;
    }


    @PostMapping("/friend/sendFriendRequest/{aktuelleUserid}/{zielUserid}")
    public ResponseEntity<?> sendFriendRequest(@PathVariable(value = "aktuelleUserid") Long aktuelleUserId,
                                               @PathVariable(value = "zielUserid") Long zielUserId) {
        FriendRequest friendRequest = friendRequestRepository.findBySchickenUserIdAndZielUserId(aktuelleUserId, zielUserId);
        if (friendRequest != null) {
            if (friendRequest.getFreundschaftanfragStatus() == 2) {
                friendRequest.setFreundschaftanfragStatus(0);
                friendRequestRepository.save(friendRequest);
                freundschaftsanfrageEmail(aktuelleUserId,zielUserId);
                return ResponseEntity.status(HttpStatus.OK).body(null);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
        } else {
            FriendRequest newFriendRequest = new FriendRequest(aktuelleUserId, zielUserId, 0);
            friendRequestRepository.save(newFriendRequest);
            freundschaftsanfrageEmail(aktuelleUserId,zielUserId);
            return ResponseEntity.status(HttpStatus.OK).body(null);
        }
    }

    @GetMapping("/friend/getAllFriends/{aktuelleUserId}")
    public ResponseEntity<List<User>> getAllFriends(@PathVariable(value = "aktuelleUserId") Long aktuelleUserId) {
        List<User> userList = new ArrayList<>();
        FriendList friendList = friendListRepository.findByUserId(aktuelleUserId);
        if (friendList != null) {
            List<FriendListDetail> details = friendListDetailRepository.findByFreundListId(friendList.getId());
            details.forEach(detail -> {
                Optional<User> userOptional = userRepository.findById(detail.getFreundUserId());
                userOptional.ifPresent(userList::add);
            });
        }
        return ResponseEntity.status(HttpStatus.OK).body(userList);
    }

    private void freundschaftsanfrageEmail(Long aktuelleUserId, Long zielUserId) {
        Optional<User> senderOptional = userRepository.findById(aktuelleUserId);
        if (senderOptional.isPresent()) {
            User sender = senderOptional.get();
            Optional<User> receiverOptional = userRepository.findById(zielUserId);
            if (receiverOptional.isPresent()) {
                User receiver = receiverOptional.get();
                String emailSubject = "Freundschaftsanfrage";
                String emailText = "Lieber Benutzer, Sie haben eine Freundschaftsanfrage von " + sender.getVorname() + " " + sender.getNachname()
                        + " " + sender.getEmail() + " erhalten. "
                        + "Bitte loggen Sie sich auf unserem System ein, um die Details zu sehen und sie zu bearbeiten.";

                eMailService.sendEMail(receiver.getEmail(), emailSubject, emailText);

            }
        }
    }


    @DeleteMapping("/friend/{aktuelleUserId}/{friendId}")
    public ResponseEntity<?> deleteFriend(@PathVariable(value = "aktuelleUserId") Long aktuelleUserId,
                                          @PathVariable(value = "friendId") Long friendId) {
        FriendList currentUserList = friendListRepository.findByUserId(aktuelleUserId);
        FriendList friendList = friendListRepository.findByUserId(friendId);
        if (currentUserList != null) deleteUserFromList(friendId, currentUserList);
        if (friendList != null) deleteUserFromList(aktuelleUserId, friendList);
        FriendRequest friendRequest = friendRequestRepository.findBySchickenUserIdAndZielUserId(aktuelleUserId, friendId);
        if (friendRequest != null) friendRequestRepository.delete(friendRequest);
        friendRequest = friendRequestRepository.findBySchickenUserIdAndZielUserId(friendId, aktuelleUserId);
        if (friendRequest != null) friendRequestRepository.delete(friendRequest);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    private void deleteUserFromList(Long userId, FriendList list) {
        FriendListDetail detail = friendListDetailRepository.findByFreundListIdAndFreundUserId(list.getId(), userId);
        if (detail != null) {
            friendListDetailRepository.delete(detail);
        }
    }

}

