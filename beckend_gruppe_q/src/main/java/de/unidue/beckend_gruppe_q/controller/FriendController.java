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
import de.unidue.beckend_gruppe_q.service.EmailService;
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


    @GetMapping("/friend/getAllFriends/{currentUserId}")
    public ResponseEntity<List<User>> getAllFriends(@PathVariable Long currentUserId) {
        List<User> userList = new ArrayList<>();
        FriendList friendList = friendListRepository.findByUserId(currentUserId);
        if (friendList != null) {
            List<FriendListDetail> details = friendListDetailRepository.findByFreundListId(friendList.getId());
            details.forEach(detail -> {
                Optional<User> userOptional = userRepository.findById(detail.getFreundUserId());
                userOptional.ifPresent(userList::add);
            });
        }
        return ResponseEntity.status(HttpStatus.OK).body(userList);
    }


    @GetMapping("/friend/getListStatus/{currentUserId}")
    public ResponseEntity<Boolean> getListStatus(@PathVariable(value = "currentUserId") Long currentUserId) {
        FriendList friendList = friendListRepository.findByUserId(currentUserId);
        if (friendList != null) {
            return ResponseEntity.status(HttpStatus.OK).body(friendList.getPublic());
        } else {
            return ResponseEntity.status(HttpStatus.OK).body(null);
        }
    }

    @PutMapping("/friend/updateListStatus/{currentUserId}/{newStatus}")
    public ResponseEntity<?> updateListStatus(@PathVariable(value = "currentUserId") Long currentUserId,
                                              @PathVariable(value = "newStatus") Boolean newStatus) {
        FriendList friendList = friendListRepository.findByUserId(currentUserId);
        if (friendList != null) {
            friendList.setPublic(newStatus);
            friendListRepository.save(friendList);
            return ResponseEntity.status(HttpStatus.OK).body(null);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/friend/{currentUserId}/{friendId}")
    public ResponseEntity<?> deleteFriend(@PathVariable(value = "currentUserId") Long currentUserId,
                                          @PathVariable(value = "friendId") Long friendId) {
        FriendList currentUserList = friendListRepository.findByUserId(currentUserId);
        FriendList friendList = friendListRepository.findByUserId(friendId);
        if (currentUserList != null) deleteUserFromList(friendId, currentUserList);
        if (friendList != null) deleteUserFromList(currentUserId, friendList);
        FriendRequest friendRequest = friendRequestRepository.findBySchickenUserIdAndZielUserId(currentUserId, friendId);
        if (friendRequest != null) friendRequestRepository.delete(friendRequest);
        friendRequest = friendRequestRepository.findBySchickenUserIdAndZielUserId(friendId, currentUserId);
        if (friendRequest != null) friendRequestRepository.delete(friendRequest);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    private void deleteUserFromList(Long userId, FriendList list) {
        FriendListDetail detail = friendListDetailRepository.findByFreundListIdAndFreundUserId(list.getId(), userId);
        if (detail != null) {
            friendListDetailRepository.delete(detail);
        }
    }
    @GetMapping("/friend/searchFriendByUsername/{userid}/{Username}")
    public ResponseEntity<Friend> searchUserByUsername(@PathVariable(value = "userid") Long currentUserId,
                                                       @PathVariable(value = "Username") String targetUsername) {
        List<User> targetUserList = userRepository.findUserByGroupIdAndUsername(1, targetUsername);

        if (!targetUserList.isEmpty()) {
            Friend friend = new Friend();
            User targetUser = targetUserList.get(0);
            friend.setUser(targetUser);

            FriendList currentUserFriendList = friendListRepository.findByUserId(currentUserId);
            if (currentUserFriendList != null) {
                FriendListDetail friendListDetail = friendListDetailRepository.findByFreundListIdAndFreundUserId(currentUserFriendList.getId(), targetUser.getId());
                if (friendListDetail != null) {
                    friend.setIstSchonFreunde(true);
                }
            }

            FriendRequest friendRequest = friendRequestRepository.findBySchickenUserIdAndZielUserId(currentUserId, targetUser.getId());
            if (friendRequest != null) {
                friend.setStatusVonFreundschaftanfrag(friendRequest.getFreundschaftanfragStatus());
            }
            return ResponseEntity.status(HttpStatus.OK).body(friend);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/friend/sendFriendRequest/{currentUserid}/ {targetUserid}")
    public ResponseEntity<?> sendFriendRequest(@PathVariable(value = "currentUserid") Long currentUserId,
                                               @PathVariable(value = "targetUserid") Long targetUserId) {
        FriendRequest friendRequest = friendRequestRepository.findBySchickenUserIdAndZielUserId(currentUserId, targetUserId);
        if(friendRequest != null && friendRequest.getFreundschaftanfragStatus() == 2){

            friendRequest.setFreundschaftanfragStatus(0);
            friendRequestRepository.save(friendRequest);
        }else if(friendRequest == null){
            FriendRequest newFriendRequest = new FriendRequest(currentUserId, targetUserId, 0);
            friendRequestRepository.save(newFriendRequest);
        }else{
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        FriendRequestEmail(currentUserId, targetUserId);

        return ResponseEntity.status(HttpStatus.OK).body(null);

    }

    private void FriendRequestEmail(Long currentUserId, Long targetUserId) {
        Optional<User> senderOptional = userRepository.findById(currentUserId);
        if(senderOptional.isPresent()){
            User sender = senderOptional.get();
            Optional<User> receiverOptional = userRepository.findById(targetUserId);
            if(receiverOptional.isPresent()){
                User receiver = receiverOptional.get();

                String EmailSubject = "FriendRequest";
                String EmailContent = String.format(
                        "Dear user, you have received a friend request from %s %s (%s)." +
                                "Please log in to our system to process the request.",
                        sender.getFirstname(), sender.getLastname(), sender.getEmail()
                );

                eMailService.sendEMail(receiver.getEmail(), EmailSubject, EmailContent);
            }
        }
    }

    @GetMapping("/friend/getFriendRequests/{currentUserid}")
    public ResponseEntity<List<FriendRequest>> getFriendRequests(@PathVariable(value = "currentUserid") Long currentUserId) {
        List<FriendRequest> friendRequests = friendRequestRepository.findByZielUserIdOrderByFreundschaftanfragStatus(currentUserId);
        friendRequests.forEach(request ->{
                    Optional<User> senderOptional = userRepository.findById(request.getSchickenUserId());
                    senderOptional.ifPresent(sender -> request.setSchickenUser(sender));
                }
        );
        return ResponseEntity.ok().body(friendRequests);

    }

    @PutMapping("/friend/friendRequest")
    public ResponseEntity<?> acceptOrRejectFriendRequest(@RequestBody FriendRequest friendRequest) {
        friendRequestRepository.save(friendRequest);

        if(friendRequest.getFreundschaftanfragStatus() == 1){
            updateFriendLists(friendRequest.getZielUserId(), friendRequest.getSchickenUserId());

            sendFriendRequestEmail(friendRequest, "accepted");
        }else if(friendRequest.getFreundschaftanfragStatus() == 2){
            sendFriendRequestEmail(friendRequest, "rejected");
        }

        return ResponseEntity.ok().build();
    }

    private void updateFriendLists(Long userID1, Long userID2) {
        FriendList currentUserList = updateFriendList(userID1);
        FriendList senderUserList = updateFriendList(userID2);

        friendListDetailRepository.save(new FriendListDetail(currentUserList.getId(), userID2));
        friendListDetailRepository.save(new FriendListDetail(senderUserList.getId(), userID1));
    }

    private FriendList updateFriendList(Long userID) {
        FriendList friendList = friendListRepository.findByUserId(userID);
        if(friendList == null){
            friendList = friendListRepository.save(new FriendList(userID, true));
        }
        return friendList;
    }

    private void sendFriendRequestEmail(FriendRequest friendRequest, String status) {
        User sender = userRepository.findById(friendRequest.getSchickenUserId()).orElse(null);
        User receiver = userRepository.findById(friendRequest.getZielUserId()).orElse(null);

        if(sender != null && receiver != null){
            String EmailSubject = "FriendRequest " + status;
            String EmailContent = "Dear user, you have received a friend request from"
                    + sender.getFirstname() + " " + sender.getLastname() + " (" + sender.getEmail() + "). Please log in to our system to process the request.";

            eMailService.sendEMail(receiver.getEmail(), EmailSubject, EmailContent);
        }

    }


    @GetMapping("/friend/getNewFriendRequestNumber/{currentUserId}")

    public ResponseEntity<Integer> getNewFriendRequestNumber(@PathVariable(value = "currentUserId") Long currentUserId) {

        int newFriendRequestNumber = 0;
        List<FriendRequest> friendRequests = friendRequestRepository.findByZielUserId(currentUserId);
        for (FriendRequest request : friendRequests){
            if(request.getFreundschaftanfragStatus() == 0){
                newFriendRequestNumber++;
            }
        }
        return ResponseEntity.ok(newFriendRequestNumber);
    }



}

