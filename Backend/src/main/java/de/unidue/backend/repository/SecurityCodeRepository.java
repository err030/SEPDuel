package de.unidue.backend.repository;

import de.unidue.backend.table.SecurityCode;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityCodeRepository extends CrudRepository<SecurityCode, Long> {
    List<SecurityCode> findByUserId(Long userId);

    List<SecurityCode> findByUserIdAndCode(Long userId, String code);
}

