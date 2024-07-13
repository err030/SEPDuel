package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Lootbox;
import org.springframework.data.jpa.repository.JpaRepository;


public interface LootboxRepository extends JpaRepository<Lootbox, Long> {
    Lootbox findByLootboxType(String string);
}
