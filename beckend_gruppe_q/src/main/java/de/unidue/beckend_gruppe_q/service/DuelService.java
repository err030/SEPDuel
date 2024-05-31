package de.unidue.beckend_gruppe_q.service;

import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Deck;
import de.unidue.beckend_gruppe_q.model.Duel;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class DuelService {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private DeckRepository deckRepository;

    private Duel duel;


    public Duel startDuel(Deck deck1, Deck deck2) {
        duel = new Duel();
        duel.setDeckA(deck1);
        duel.setDeckB(deck2);
        return duel;
    }



    public Card drawCard(Deck deck) {
        // 随机抽取卡片
        List<Card> allCards = (List<Card>) cardRepository.findAll();
        Random rand = new Random();
        return allCards.get(rand.nextInt(allCards.size()));
    }
}
