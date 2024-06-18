package de.unidue.beckend_gruppe_q.controller;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class DuelScheduledTask {
    private final Map<Long, Long> duelTimers = new ConcurrentHashMap<>();
    private final DuelController duelController;

    public DuelScheduledTask(DuelController duelController) {
        this.duelController = duelController;
    }

    public void startTimer(long duelId) {
        duelTimers.put(duelId, System.currentTimeMillis());
    }

    @Scheduled(fixedRate = 1000) // Run every second
    public void checkDuelTimers() {
        long currentTime = System.currentTimeMillis();
        for (Map.Entry<Long, Long> entry : duelTimers.entrySet()) {
            long duelId = entry.getKey();
            long startTime = entry.getValue();
            long elapsedTime = currentTime - startTime;
            if (elapsedTime >= 2000) { // 2 seconds
                duelController.nextRound(duelId);
                startTimer(duelId); // Restart the timer for the next round
            }
        }
    }
}
