package de.unidue.beckend_gruppe_q.controller;


import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;

@CrossOrigin
@RestController
public class TournamentController {

    private final TournamentRepository tournamentRepository;

    private final UserRepository userRepository;

    private final ClanRepository clanRepository;

    private final TournamentInvitationRepository tournamentInvitationRepository;
    private final DuelController duelController;
    private final TournamentBetRepository tournamentBetRepository;
    private final LootboxRepository lootboxRepository;
    List<Duel> duels = new ArrayList<>();


    public TournamentController(TournamentRepository tournamentRepository, UserRepository userRepository,
                                ClanRepository clanRepository, TournamentInvitationRepository tournamentInvitationRepository, DuelController duelController, TournamentBetRepository tournamentBetRepository, LootboxRepository lootboxRepository) {
        this.tournamentRepository = tournamentRepository;
        this.userRepository = userRepository;
        this.clanRepository = clanRepository;
        this.tournamentInvitationRepository = tournamentInvitationRepository;
        this.duelController = duelController;
        this.tournamentBetRepository = tournamentBetRepository;
        this.lootboxRepository = lootboxRepository;
    }


    /**
     * send invitations to all the users in the clan except himself
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
        List<TournamentInvitation> invitations = clan.getUsers().stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(user -> new TournamentInvitation(finalTournament, user,false))
                .toList();
        tournamentInvitationRepository.saveAll(invitations);

        return ResponseEntity.status(HttpStatus.CREATED).body(invitations);
    }


    /**
     * whether the invitations are accepted by the user will be stored in the database
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
     * @return List<TournamentInvitation>
     */
    @GetMapping("/api/tournament/getInvitations/")
    ResponseEntity<List<TournamentInvitation>> getInvitations() {

        List<TournamentInvitation> invitations = tournamentInvitationRepository.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(invitations);
    }


    /**
     * the tournament will start according to the tournamentId
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

            List<User> participants = invitations.stream().map(TournamentInvitation::getUser).toList();
            matchPLayersAndDuel(participants);

            tournament.setStatus("Completed");
            tournamentRepository.save(tournament);

            if (participants.size() == 1) {
                tournament.setWinnerId(participants.get(0).getId()); //the tournament is over, set the winnerId in oder to see if the user wins the bet
                tournamentRepository.save(tournament);
            }
            return ResponseEntity.ok().body("Tournament has started and users are matched");
        }
        else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Not all invitations are accepted");
        }
    }


    /**
     * this is a helping function where the logic in each round is dealt
     * @param participants
     */
    private void matchPLayersAndDuel(List<User> participants) {

        while (participants.size() > 1) {
            Collections.shuffle(participants);

            List<User> winners = new ArrayList<>();
            for (int i=0; i<participants.size(); i+=2) {
                if (i + 1 < participants.size()) {
                    User user1 = participants.get(i);
                    User user2 = participants.get(i + 1);

                    Player player1 = new Player(user1,user1.getDecks().get(0));
                    Player player2 = new Player(user2,user2.getDecks().get(0));

                    Duel duel = new Duel(player1,player2);
                    duels.add(duel);
                    duel.start();
                    duelController.startTimer(duel.getId());
                    user1.setStatus(1);
                    user2.setStatus(1);
                    if (player1.isDead()) {
                        winners.add(user2);
                        user2.setStatus(0);
                    }
                    if (player2.isDead()) {
                        winners.add(user1);
                        user1.setStatus(0);
                    }
                }
                winners.add(participants.get(participants.size()-1)); // if participants are odd, the last participant will go to the next round automatically
            }
            participants = winners;
        }
        if (participants.size() == 1) {
            User finalWinner = participants.get(0);
            finalWinner.setSepCoins(finalWinner.getSepCoins() + 700);
            userRepository.save(finalWinner);
        }
    }


    /**
     * it returns a list of duels which gives user the possibility to make bets on all duels
     * @return a list of duels
     */
    @GetMapping("/api/tournament/duels")
    ResponseEntity<List<Duel>> getAllDuels(){

        return ResponseEntity.status(HttpStatus.OK).body(duels);
    }

    /**
     *
     * @param userId
     * @param tournamentId
     * @param betOnUserId
     * @return
     */
    @PostMapping("/api/user/{userId}/tournament/{tournamentId}/betOnUser/{betOnUserId}/placeBet")
    ResponseEntity<?> placeBet(@PathVariable Long userId,
                               @PathVariable Long tournamentId,
                               @PathVariable Long betOnUserId) {

        User currentUser = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("user not found"));

        Tournament tournament = tournamentRepository.findById(tournamentId).orElseThrow(() -> new NoSuchElementException("tournament not found"));

        if (betOnUserId.equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You cannot bet on yourself!");
        }

        if (tournament.getStatus().equals("In_Progress")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Betting is closed for this Tournament!");
        }

        currentUser.setSepCoins(currentUser.getSepCoins() - 50);
        userRepository.save(currentUser);

        TournamentBet tournamentBet = new TournamentBet();
        tournamentBet.setTournament(tournament);
        tournamentBet.setUser(currentUser);
        tournamentBet.setBetOnUserId(betOnUserId);
        tournamentBetRepository.save(tournamentBet);

        return ResponseEntity.ok().body("Tournament has been placed");
    }


    /**
     * 
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
                lootbox.setLootboxType(LootboxType.GOLD);
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
