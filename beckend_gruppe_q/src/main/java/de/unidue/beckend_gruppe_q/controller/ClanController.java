package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Clan;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.ClanRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Clan> createClan(@PathVariable Long id, @PathVariable String clanName) {
        List<Clan> list = clanRepository.findAllByName(clanName);
        if (list != null && !list.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } else {
            Clan clan = new Clan();
            clan.setName(clanName);
            if (userRepository.existsById(id)) {
                User user = userRepository.findById(id).get();
                clan.users.add(user);
                user.setClanId(clan.getId());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            clanRepository.save(clan);
            return ResponseEntity.status(HttpStatus.CREATED).body(null);
        }

    }

    //用户加入战队，加入后无法再加其他的战队(前端disable）
    @GetMapping("/api/clan/{id}/joinClan/{clanId}")
    public ResponseEntity<Clan> joinClan(@PathVariable Long id, @PathVariable Long clanId) {
        Clan clan = clanRepository.findById(clanId).get();
        User user = userRepository.findById(id).get();
        clan.users.add(user);
        user.setClanId(clan.getId());
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    //返回所有存在的战队，前端显示战队列表
    @GetMapping("/api/clan/allClans")
    public ResponseEntity<List<Clan>> getAllClans() {
        List<Clan> list = clanRepository.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }
}
