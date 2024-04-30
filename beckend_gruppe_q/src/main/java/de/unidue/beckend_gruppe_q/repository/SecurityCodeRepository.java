package de.unidue.beckend_gruppe_q.repository;


import de.unidue.beckend_gruppe_q.model.SecurityCode;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityCodeRepository extends CrudRepository<SecurityCode, Long> {
    List<SecurityCode> findByUserId(Long userId);

    List<SecurityCode> findByUserIdAndCode(Long userId, String code);
}
