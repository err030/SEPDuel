package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Clan;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.ClanRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin
@RestController
public class ClanController {

    final ClanRepository clanRepository;
    final UserRepository userRepository;

    public ClanController(ClanRepository clanRepository, UserRepository userRepository) {
        this.clanRepository = clanRepository;
        this.userRepository = userRepository;
    }

    //创建战队，且战队名唯一，创建后无法加入其他战队(前端disable）
    @GetMapping("/api/clan/{id}/createClan/{clanName}")
    public ResponseEntity<User> createClan(@PathVariable Long id, @PathVariable String clanName) {
        List<Clan> list = clanRepository.findAllByName(clanName);
        if (list != null && !list.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } else {
            Clan clan = new Clan();
            clan.setName(clanName);
            User user = userRepository.findById(id).orElse(null);
            if (user != null) {
                if (user.getClanId() != null) return null;
                clan.users.add(user);
                clanRepository.save(clan);
                user.setClanId(clan.getId());
                user.setClanName(clanName);
                userRepository.save(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            clanRepository.save(clan);
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        }

    }

    //用户加入战队，加入后无法再加其他的战队(前端disable）
    @GetMapping("/api/clan/{id}/joinClan/{clanId}")
    public ResponseEntity<User> joinClan(@PathVariable Long id, @PathVariable Long clanId) {
        Clan clan = clanRepository.findById(clanId).get();
        User user = userRepository.findById(id).get();
        clan.users.add(user);
        user.setClanId(clan.getId());
        userRepository.save(user);
        clanRepository.save(clan);
        user.setClanName(clan.getName());
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    //返回所有存在的战队，前端显示战队列表
    @GetMapping("/api/clan/allClans")
    public ResponseEntity<List<Clan>> getAllClans() {
        List<Clan> list = clanRepository.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    //返回战队成员
    @GetMapping("/api/clan/{id}/members")
    public ResponseEntity<Clan> getClanMembers(@PathVariable Long id) {
        Clan clan = clanRepository.findById(id).get();
        List<User> list = clan.users;
        System.out.println("here" + list);
        return ResponseEntity.status(HttpStatus.OK).body(clan);
    }

    //退出战队

    @GetMapping("/api/clan/{id}/exitClan")
    public ResponseEntity<User> exitClan(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        Clan clan = clanRepository.findById(user.getClanId()).orElse(null);
        if (clan == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        user.setClanId(null);
        user.setClanName(null);
        clan.users.remove(user);
        if (clan.getUsers().isEmpty()) {
            clanRepository.delete(clan);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
        }
        userRepository.save(user);
        clanRepository.save(clan);
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }
}
