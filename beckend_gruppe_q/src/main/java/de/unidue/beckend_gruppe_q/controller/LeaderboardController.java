package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
public class LeaderboardController {
    private final UserRepository userRepository;

    public LeaderboardController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @GetMapping("/leaderboard")
    public List<User> getLeaderboard() {
        return userRepository.findAllByOrderByLeaderBoardPunktDesc();
    }


}
