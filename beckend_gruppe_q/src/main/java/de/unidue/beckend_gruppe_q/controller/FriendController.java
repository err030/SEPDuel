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
    final EmailService emailService ;


    public FriendController(UserRepository userRepository, FriendListRepository friendListRepository,
                            FriendListDetailRepository friendListDetailRepository, FriendRequestRepository friendRequestRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.friendListRepository = friendListRepository;
        this.friendListDetailRepository = friendListDetailRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.emailService = emailService;
    }


    @GetMapping("/friend/searchFriendByUsername/{userid}/{username}")
    public ResponseEntity<Friend> searchUserByUsername(@PathVariable(value = "userid") Long currentUserId,
                                                       @PathVariable(value = "username") String targetUsername) {
        List<User> userList = userRepository.findUserByUsernameAndGroupId(targetUsername,1);
        if (!userList.isEmpty()) {
            Friend friend = new Friend();
            // 用户信息
            User user = userList.get(0);
            friend.setUser(user);
            // 是否已经添加为好友
            FriendList currentUserFriendList = friendListRepository.findByUserId(currentUserId);
            if (currentUserFriendList != null) {
                FriendListDetail friendListDetail = friendListDetailRepository.findByFreundListIdAndFreundUserId(currentUserFriendList.getId(), user.getId());
                if (friendListDetail != null) {
                    friend.setIstSchonFreunde(true);
                }
            }
            // 好友申请状态
            FriendRequest friendRequest = friendRequestRepository.findBySchickenUserIdAndZielUserId(currentUserId, user.getId());
            if (friendRequest != null) {
                friend.setStatusVonFreundschaftanfrag(friendRequest.getFreundschaftanfragStatus());
            }
            return ResponseEntity.status(HttpStatus.OK).body(friend);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
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


    @GetMapping("/friend/searchFriendByEmail/{userid}/{email}")//通过Mapping将URL传递的参数与Controller方法中自己定义的参数绑定起来
    public ResponseEntity<Friend> searchUserByEmail(@PathVariable(value = "userid") Long currentUserId,
                                                    @PathVariable(value = "email") String targetEmail) {
        List<User> targetUserList = userRepository.findUserByEmailAndGroupId(targetEmail, 1);
        if (!targetUserList.isEmpty()) {
            Friend friend = new Friend();
            // 用户信息
            User targetUser = targetUserList.get(0); //获取找到的目标用户列表的第一个用户
            friend.setUser(targetUser); //将目标用户信息添加到Friend对象中
            // 是否已经添加为好友
            FriendList currentUserFriendList = friendListRepository.findByUserId(currentUserId);
            if (currentUserFriendList != null) {
                //     //获取每一个好友关系的id 对这些id进行遍历，如果有与目标用户id相同的FriendUserId，则说明已经添加为好友
                FriendListDetail friendListDetail = friendListDetailRepository.findByFreundListIdAndFreundUserId(currentUserFriendList.getId(), targetUser.getId());
                if (friendListDetail != null) {
                    friend.setIstSchonFreunde(true);
                }
            }
            // 好友申请状态
            FriendRequest friendRequest = friendRequestRepository.findBySchickenUserIdAndZielUserId(currentUserId, targetUser.getId());
            if (friendRequest != null) {
                //因为 101行 new了一个新的friend对象，需要把Friend里的3个属性都给 新的friend对象赋值上。
                friend.setStatusVonFreundschaftanfrag(friendRequest.getFreundschaftanfragStatus());
            }
            return ResponseEntity.status(HttpStatus.OK).body(friend);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }


    @PostMapping("/friend/sendFriendRequest/{currentUserid}/{targetUserid}")
    public ResponseEntity<?> sendFriendRequest(@PathVariable(value = "currentUserid") Long currentUserId,
                                               @PathVariable(value = "targetUserid") Long targetUserId) {
        // 检查是否已经发过好友申请
        FriendRequest friendRequest = friendRequestRepository.findBySchickenUserIdAndZielUserId(currentUserId, targetUserId);
        if (friendRequest != null) {
            if (friendRequest.getFreundschaftanfragStatus() == 2) {
                // 如果已经发过申请并且被拒绝，修改请求状态并保存，使得目标用户可以再次审核
                friendRequest.setFreundschaftanfragStatus(0);
                friendRequestRepository.save(friendRequest);
                friendRequestEmail(currentUserId,targetUserId);
                return ResponseEntity.status(HttpStatus.OK).body(null);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);//应该要跳出一个消息提示
            }
        } else {
            // 如果没有发过好友申请，发送新的
            FriendRequest newFriendRequest = new FriendRequest(currentUserId, targetUserId, 0);
            friendRequestRepository.save(newFriendRequest);
            friendRequestEmail(currentUserId,targetUserId);
            return ResponseEntity.status(HttpStatus.OK).body(null);
        }
    }

    private void friendRequestEmail(Long currentUserId, Long targetUserId) {
        Optional<User> senderOptional = userRepository.findById(currentUserId);
        if (senderOptional.isPresent()) {
            User sender = senderOptional.get();
            Optional<User> receiverOptional = userRepository.findById(targetUserId);
            if (receiverOptional.isPresent()) {
                User receiver = receiverOptional.get();
                String emailSubject = "Friend request";
                String emailText = "Dear user, you have received a friend request from " + sender.getFirstname() + " " + sender.getLastname()
                        + " " + sender.getEmail()
                        + "Please login to our website to see the details.";

                emailService.sendEMail(receiver.getEmail(), emailSubject, emailText);

            }
        }
    }


    @GetMapping("/friend/getFriendRequests/{currentUserid}")
    public ResponseEntity<List<FriendRequest>> getFriendRequests(@PathVariable(value = "currentUserid") Long currentUserId) {
        List<FriendRequest> friendRequests = friendRequestRepository.findByZielUserIdOrderByFreundschaftanfragStatus(currentUserId);
        friendRequests.forEach(request ->{
                    Optional<User> senderOptional = userRepository.findById(request.getSchickenUserId());
                    senderOptional.ifPresent(request::setSchickenUser);
                }
        );
        return ResponseEntity.ok().body(friendRequests);

    }


    @PutMapping("/friend/friendRequest")
    public ResponseEntity<?> acceptOrDenyFriendRequest(@RequestBody FriendRequest friendRequest) {
        friendRequestRepository.save(friendRequest);
        if (friendRequest.getFreundschaftanfragStatus() == 1) {
            // 同意用户请求，把好友信息分别插入当前用户和目标用户的好友列表
            FriendList currentUserList = friendListRepository.findByUserId(friendRequest.getZielUserId());
            if (currentUserList == null) {
                currentUserList = friendListRepository.save(new FriendList(friendRequest.getZielUserId(), true));
            }
            FriendList targetUserList = friendListRepository.findByUserId(friendRequest.getSchickenUserId());
            if (targetUserList == null) {
                targetUserList = friendListRepository.save(new FriendList(friendRequest.getSchickenUserId(), true));
            }
            friendListDetailRepository.save(new FriendListDetail(currentUserList.getId(), friendRequest.getSchickenUserId()));
            friendListDetailRepository.save(new FriendListDetail(targetUserList.getId(), friendRequest.getZielUserId()));
        }
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }




    @GetMapping("/friend/getAllFriends/{currentUserId}")
    public ResponseEntity<List<User>> getAllFriends(@PathVariable(value = "currentUserId") Long currentUserId) {
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


    /*private void updateFriendLists(Long userID1, Long userID2) {
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

    }*/


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

}

