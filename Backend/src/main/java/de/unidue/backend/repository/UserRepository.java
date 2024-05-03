package de.unidue.backend.repository;

import de.unidue.backend.table.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    List<User> findUserByEmailAndGroupId(String email, Integer groupId);
}

