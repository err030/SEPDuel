package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.DuelHistory;
import de.unidue.beckend_gruppe_q.repository.DuelHistoryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DuelHistoryController {
    private DuelHistoryRepository repository;

    public DuelHistoryController(DuelHistoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/api/duel-history/{name}")
    public List<DuelHistory> getDuelHistory(@PathVariable String name) {
        //     List result = repository.findByPlayerAUsernameOrPlayerBUsername(name, name);
        //     return result;
        return repository.findByPlayerAUsernameOrPlayerBUsername(name, name);
    }
}
