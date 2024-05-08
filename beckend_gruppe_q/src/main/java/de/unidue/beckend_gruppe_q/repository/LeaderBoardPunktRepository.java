package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.LeaderBoardPunkt;
import org.springframework.data.jpa.repository.JpaRepository;



public interface LeaderBoardPunktRepository extends JpaRepository<LeaderBoardPunkt, Long> {
        // 这里可以添加自定义的查询方法，根据需要
        LeaderBoardPunkt findByUserId(Long userId);
}


