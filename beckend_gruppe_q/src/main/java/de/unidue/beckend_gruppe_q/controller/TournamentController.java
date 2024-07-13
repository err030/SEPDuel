package de.unidue.beckend_gruppe_q.controller;


import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.repository.*;
import de.unidue.beckend_gruppe_q.service.LootboxGenerator;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import static de.unidue.beckend_gruppe_q.model.LootboxType.GOLD;

@CrossOrigin
@RestController
public class TournamentController {

    private final TournamentRepository tournamentRepository;

    private final UserRepository userRepository;

    private final ClanRepository clanRepository;

    private final TournamentInvitationRepository tournamentInvitationRepository;

    private final TournamentBetRepository tournamentBetRepository;

    private final DuelRequestRepository duelRequestRepository;
    private final DuelController duelController;
    private final LootboxGenerator lootboxGenerator;
    List<TournamentInvitation> winners = new ArrayList<>();
    List<TournamentInvitation> playersList = new ArrayList<>();
    Tournament tournament;


    public TournamentController(TournamentRepository tournamentRepository,
                                UserRepository userRepository,
                                ClanRepository clanRepository,
                                TournamentInvitationRepository tournamentInvitationRepository,
                                TournamentBetRepository tournamentBetRepository,
                                DuelRequestRepository duelRequestRepository,
                                @Lazy DuelController duelController,
                                LootboxGenerator lootboxGenerator) {
        this.tournamentRepository = tournamentRepository;
        this.userRepository = userRepository;
        this.clanRepository = clanRepository;
        this.tournamentInvitationRepository = tournamentInvitationRepository;
        this.tournamentBetRepository = tournamentBetRepository;
        this.duelRequestRepository = duelRequestRepository;
        this.duelController = duelController;
        this.lootboxGenerator = lootboxGenerator;
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
        this.tournament = tournament;

        /* suppose the user who starts the invitation already accepted the invitation
           in the startTournament method, all the invitations are manipulated,
           so the sender of this invitation should also be included
        */
        TournamentInvitation currentUserInvitation = new TournamentInvitation(finalTournament, currentUser, true);
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
                matchPlayersAndDuel(a, b);

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
        if ((duelController.duels == null || duelController.duels.isEmpty()) && (userRepository.findAll().stream().filter(user -> !(user.getStatus() ==null)).allMatch(u -> u.getStatus() != 3))) {
            if (winners.size() < 2) {
                playersList.clear();
                winners.clear();
                User winner = userRepository.findUserByUsername(winnerUsername);
                this.tournament.setWinnerId(winner.getId());
                winner.setSepCoins(winner.getSepCoins() + 700);
                userRepository.save(winner);
                tournamentRepository.save(this.tournament);
                return;
            }
            while (winners.size() > 1) {
                matchPlayersAndDuel(winners.remove(0), winners.remove(0));
            }
        }
    }


    /**
     * @param userId
     * @param betOnUserId
     * @return
     */
    @PostMapping("/api/tournament/user/{userId}/betOnUser/{betOnUserId}/placeBet")
    ResponseEntity<?> placeBet(@PathVariable Long userId, @PathVariable Long betOnUserId) {

        User currentUser = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("user not found"));

        if (currentUser.getSepCoins() < 50) {
            return ResponseEntity.badRequest().body("Not enough sep coins!");
        }

        if (this.tournament == null ) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tournament has not been started!");
        }

        currentUser.setSepCoins(currentUser.getSepCoins() - 50);
        userRepository.save(currentUser);

        TournamentBet tournamentBet = new TournamentBet();
        tournamentBet.setTournament(this.tournament);
        tournamentBet.setUser(currentUser);
        tournamentBet.setBetOnUserId(betOnUserId);
        tournamentBetRepository.save(tournamentBet);

        return ResponseEntity.ok().body(tournamentBet);
    }


    /**
     * @return
     */
    @GetMapping("/api/tournament/user/{userId}/betResult")
    ResponseEntity<?> getBetResult(@PathVariable Long userId) {

        if (tournament == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tournament has not been started!");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new NoSuchElementException("user not found"));

        TournamentBet bet = tournamentBetRepository.findByTournamentAndUser(tournament, user);

        if (bet.getBetOnUserId().equals(tournament.getWinnerId())) {

            bet.getUser().setSepCoins(bet.getUser().getSepCoins() + 50);
            Lootbox lootbox = lootboxGenerator.generateLootbox(GOLD);
            bet.getUser().getLootboxes().add(lootbox);
            userRepository.save(bet.getUser());

            return ResponseEntity.status(HttpStatus.OK).body("Congrats! You won The Bet!");
        }
        return ResponseEntity.ok().body("You lost the Bet!");

    }
}
