package de.unidue.beckend_gruppe_q.controller;


import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.*;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;

import static de.unidue.beckend_gruppe_q.model.LootboxType.GOLD;

@CrossOrigin
@RestController
public class TournamentController {

    private final TournamentRepository tournamentRepository;

    private final UserRepository userRepository;

    private final ClanRepository clanRepository;

    private final TournamentInvitationRepository tournamentInvitationRepository;

    private final TournamentBetRepository tournamentBetRepository;

    private final LootboxRepository lootboxRepository;

    private final DuelHistoryRepository duelHistoryRepository;

    private final DuelRequestRepository duelRequestRepository;
    private final DuelController duelController;
    List<TournamentInvitation> winners = new ArrayList<>();
    List<TournamentInvitation> playersList = new ArrayList<>();


    public TournamentController(TournamentRepository tournamentRepository, UserRepository userRepository,
                                ClanRepository clanRepository, TournamentInvitationRepository tournamentInvitationRepository, TournamentBetRepository tournamentBetRepository, LootboxRepository lootboxRepository, DuelHistoryRepository duelHistoryRepository, DuelRequestRepository duelRequestRepository, @Lazy DuelController duelController) {
        this.tournamentRepository = tournamentRepository;
        this.userRepository = userRepository;
        this.clanRepository = clanRepository;
        this.tournamentInvitationRepository = tournamentInvitationRepository;
        this.tournamentBetRepository = tournamentBetRepository;
        this.lootboxRepository = lootboxRepository;
        this.duelHistoryRepository = duelHistoryRepository;
        this.duelRequestRepository = duelRequestRepository;
        this.duelController = duelController;
    }


    /**
     * send invitations to all the users in the clan except himself
     *
     * @param currentUserId
     * @param clanId
     * @return null
     */
    @PostMapping("/api/tournament/clan/{clanId}/user/{currentUserId}/sendRequest")
    ResponseEntity<?> startTournamentRequest(@PathVariable Long currentUserId, @PathVariable Long clanId) {

        Clan clan = clanRepository.findById(clanId).orElseThrow(() -> new NoSuchElementException("clan not found"));

        User currentUser = userRepository.findById(currentUserId).orElseThrow(() -> new NoSuchElementException("user not found"));

        if (!clan.getUsers().contains(currentUser)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Tournament tournament = new Tournament();
        tournament.setClan(clan);
        tournament.setStatus("Waiting");
        tournament = tournamentRepository.save(tournament);

        Tournament finalTournament = tournament;

        /* suppose the user who starts the invitation already accepted the invitation
           in the startTournament method, all the invitations are manipulated,
           so the sender of this invitation should also be included
        */
        TournamentInvitation currentUserInvitation = new TournamentInvitation(finalTournament, currentUser,true);
        tournamentInvitationRepository.save(currentUserInvitation);

        List<TournamentInvitation> invitations = clan.getUsers().stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(user -> new TournamentInvitation(finalTournament, user, false))
                .toList();
        tournamentInvitationRepository.saveAll(invitations);
        playersList.add(currentUserInvitation);
        playersList.addAll(invitations);

        return ResponseEntity.status(HttpStatus.CREATED).body(invitations);
    }

    @GetMapping("api/tournament/user/{userId}/getTournament")
    ResponseEntity<Tournament> getTournament(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("user not found"));

        List<Tournament> tournaments = tournamentRepository.findByClanId(user.getClanId());

        Tournament tournament = tournaments.get(tournaments.size() - 1);

        return ResponseEntity.ok().body(tournament);
    }


    /**
     * whether the invitations are accepted by the user will be stored in the database
     *
     * @param updateRequest
     * @param userId
     * @return TournamentInvitation
     */
    @PutMapping("/api/tournament/user/{userId}/invitations")
    ResponseEntity<TournamentInvitation> acceptOrDenyTournamentRequest(@RequestBody TournamentInvitation updateRequest, @PathVariable Long userId) {

        TournamentInvitation tournamentInvitation = tournamentInvitationRepository.findById(updateRequest.getId()).orElseThrow(() -> new NoSuchElementException("invitation not found"));


        if (!tournamentInvitation.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(tournamentInvitation);
        }
        tournamentInvitation.setAccepted(updateRequest.isAccepted());

        tournamentInvitationRepository.save(tournamentInvitation);

        return ResponseEntity.status(HttpStatus.OK).body(tournamentInvitationRepository.save(tournamentInvitation));
    }


    /**
     * get all invitations,if all invitations are accepted, the tournament will start
     *
     * @return List<TournamentInvitation>
     */
    @GetMapping("/api/tournament/getInvitations/")
    ResponseEntity<List<TournamentInvitation>> getInvitations() {

        List<TournamentInvitation> invitations = tournamentInvitationRepository.findAll();
        invitations = invitations.stream().filter(invitation -> !invitation.isAccepted()).toList();
        return ResponseEntity.status(HttpStatus.OK).body(invitations);
    }


    /**
     * the tournament will start according to the tournamentId
     *
     * @param tournamentId
     * @return message
     */
    @PostMapping("/api/tournament/{tournamentId}/start")
    ResponseEntity<?> startTournament(@PathVariable Long tournamentId) {

        Tournament tournament = tournamentRepository.findById(tournamentId).orElseThrow(() -> new NoSuchElementException("tournament not found"));

        List<TournamentInvitation> invitations = tournamentInvitationRepository.findByTournamentId(tournamentId);

        if (invitations.stream().allMatch(TournamentInvitation::isAccepted)) {
            tournament.setStatus("In_Progress");
            tournamentRepository.save(tournament);
            Collections.shuffle(invitations);



            while (invitations.size() > 1) {


                TournamentInvitation a = invitations.remove(0);
                TournamentInvitation b = invitations.remove(0);
                matchPlayersAndDuel(a,b);

//                for(TournamentInvitation restInvitations: invitations) {
//                    restInvitations.getUser().setStatus(1);
//                }
//                DuelHistory record = duelHistoryRepository.findByPlayerAUsernameAndPlayerBUsername(a.getUser().getUsername(),b.getUser().getUsername());
//
//                if (a.getUser().getUsername().equals(record.getWinnerUsername())) {
//                    winners.add(a);
//                }
//                if (b.getUser().getUsername().equals(record.getWinnerUsername())) {
//                    winners.add(b);
//                }
//
//                winners.addAll(invitations);
//            }
//            invitations = winners;
//            System.out.println("invitations are :" +invitations);
//            if (invitations.size() == 1) {
//                User finalWinner = invitations.get(0).getUser();
//                tournament.setWinnerId(finalWinner.getId());
//                tournament.setStatus("Completed");
//                tournamentRepository.save(tournament);
//                finalWinner.setSepCoins(finalWinner.getSepCoins() + 700);
//                userRepository.save(finalWinner);
            }
            if (invitations.size() == 1) {
                winners.add(invitations.get(0));
            }
            tournamentRepository.save(tournament);

            return ResponseEntity.ok().body("Tournament has started and users are matched");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Not all invitations are accepted");
        }
    }

    private void matchPlayersAndDuel(TournamentInvitation invitationA, TournamentInvitation invitationB) {
        User A = invitationA.getUser();
        User B = invitationB.getUser();

        A.setStatus(3);
        B.setStatus(3);

        DuelRequest duelRequest = new DuelRequest(A.getId(), B.getId(), 3);
        duelRequest.setSendDeckId(A.getDecks().get(0).getId());
        duelRequestRepository.save(duelRequest);
    }

    void checkIfTournamentEnded(String winnerUsername) {
        if (playersList == null || playersList.isEmpty()) {
            return;
        }
        winners.add(playersList.stream().filter(p -> p.getUser().getUsername().equals(winnerUsername)).findFirst().get());
        if ((duelController.duels == null || duelController.duels.isEmpty()) && (userRepository.findAll().stream().allMatch(u -> u.getStatus() != 3))) {
            if (winners.size() < 2) {
                playersList.clear();
                winners.clear();
                User winner = userRepository.findUserByUsername(winnerUsername);
                winner.setSepCoins(winner.getSepCoins() + 700);
                userRepository.save(winner);
                return;
            }
            while (winners.size() > 1) {
                matchPlayersAndDuel(winners.remove(0), winners.remove(0));
            }
        }
    }


//    /**
//     * this is a helping function where the logic in each round is dealt
//     * @param participants
//     */
//    private void matchPLayersAndDuel(List<User> participants) {
//
//        while (participants.size() > 1) {
//            Collections.shuffle(participants);
//
//            List<User> winners = new ArrayList<>();
//            for (int i=0; i<participants.size(); i+=2) {
//                if (i + 1 < participants.size()) {
//                    User user1 = participants.get(i);
//                    User user2 = participants.get(i + 1);
//
//                    Player player1 = new Player(user1,user1.getDecks().get(0));
//                    Player player2 = new Player(user2,user2.getDecks().get(0));
//
//                    Duel duel = new Duel(player1,player2);
//                    duels.add(duel);
//                    duel.start();
//                    duelController.startTimer(duel.getId());
//                    user1.setStatus(1);
//                    user2.setStatus(1);
//                    if (player1.isDead()) {
//                        winners.add(user2);
//                        user2.setStatus(0);
//                    }
//                    if (player2.isDead()) {
//                        winners.add(user1);
//                        user1.setStatus(0);
//                    }
//                }
//                winners.add(participants.get(participants.size()-1)); // if participants are odd, the last participant will go to the next round automatically
//            }
//            participants = winners;
//        }
//        if (participants.size() == 1) {
//            User finalWinner = participants.get(0);
//            finalWinner.setSepCoins(finalWinner.getSepCoins() + 700);
//            userRepository.save(finalWinner);
//        }
//    }



    /**
     * it returns a list of duels which gives user the possibility to make bets on all duels
     *
     * @return a list of duels
     */
//    @GetMapping("/api/tournament/{id}/duelRequests")
//    ResponseEntity<List<DuelRequest>> getAllDuelRequests(@PathVariable Long id) {
//        Tournament tournament = tournamentRepository.findById(id).orElse(null);
//
//
//        if (tournament == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
//        }
//
//
//        List<DuelRequest> duelRequests = tournament.getDuelRequests();
//        System.out.println("get duelRequests:"+duelRequests);
//
//        return ResponseEntity.status(HttpStatus.OK).body(duelRequests);
//    }

    /**
     * @param userId
     * @param clanId
     * @param betOnUserId
     * @return
     */
    @PostMapping("/api/clan/{clanId}/user/{userId}/betOnUser/{betOnUserId}/placeBet")
    ResponseEntity<?> placeBet(@PathVariable Long userId,
                               @PathVariable Long clanId,
                               @PathVariable Long betOnUserId) {

        User currentUser = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("user not found"));

        List<Tournament> tournaments = tournamentRepository.findByClanId(clanId);

        Tournament tournament = tournaments.get(tournaments.size() - 1);

        if (betOnUserId.equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You cannot bet on yourself!");
        }

        if (tournament.getStatus().equals("In_Progress") || tournament.getStatus().equals("Completed")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Betting is closed for this Tournament!");
        }

        List<TournamentBet> existingBet = tournamentBetRepository.findByUserId(userId);
        if (existingBet.size() > 1) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only bet on one person!");
        }

        currentUser.setSepCoins(currentUser.getSepCoins() - 50);
        userRepository.save(currentUser);

        TournamentBet tournamentBet = new TournamentBet();
        tournamentBet.setTournament(tournament);
        tournamentBet.setUser(currentUser);
        tournamentBet.setBetOnUserId(betOnUserId);
        tournamentBetRepository.save(tournamentBet);

        return ResponseEntity.ok().body("Bet has been placed");
    }


    /**
     * @param tournamentId
     * @param userId
     * @return
     */
    @GetMapping("/api/user/{userId}/tournament/{tournamentId}/betResult")
    ResponseEntity<String> getBetResult(@PathVariable Long tournamentId, @PathVariable Long userId) {

        Tournament tournament = tournamentRepository.findById(tournamentId).orElseThrow(() -> new NoSuchElementException("tournament not found"));

        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("user not found"));


        TournamentBet bet = tournamentBetRepository.findByTournament(tournament);

        if (bet.getUser().equals(user)) {
            if (bet.getBetOnUserId().equals(tournament.getWinnerId())) {
                user.setSepCoins(user.getSepCoins() + 50);
                Lootbox lootbox = new Lootbox();
                lootbox.setLootboxType(GOLD);
                lootboxRepository.save(lootbox);
                user.getLootboxes().add(lootbox);
                userRepository.save(user);
                return ResponseEntity.status(HttpStatus.OK).body("You won!\n SEP_Points + 50\n Gold_Lootbox + 1\n");
            }
            return ResponseEntity.ok().body("You lost!");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You are have not made this bet");
    }
}
