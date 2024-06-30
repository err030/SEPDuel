package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.DuelHistory;
import de.unidue.beckend_gruppe_q.repository.DuelHistoryRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
public class DuelHistoryController {
    private final DuelHistoryRepository repository;

    public DuelHistoryController(DuelHistoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/duel-history/{name}")
    public List<DuelHistory> getDuelHistory(@PathVariable String name) {
        return repository.findByPlayerAUsernameOrPlayerBUsername(name);
    }
}
