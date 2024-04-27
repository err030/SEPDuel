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


}

