package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.Clan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClanRepository extends JpaRepository<Clan, Long> {
    List<Clan> findAllByName(String name);

}
