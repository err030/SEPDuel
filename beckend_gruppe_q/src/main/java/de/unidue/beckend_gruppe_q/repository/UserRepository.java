package de.unidue.beckend_gruppe_q.repository;


import de.unidue.beckend_gruppe_q.model.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    List<User> findUserByEmailAndGroupId(String email, Integer groupId);

    List<User> findUserByGroupIdAndUsername(Integer groupId, String username);

    List<User> findUserByUsernameAndGroupId(String username, Integer groupId);

    List<User> findAllByGroupId(Integer groupId);
    List<User> findAll();


    List<User> findByCardsName(String name);

    List<User> findAllByOrderByLeaderBoardPunktDesc();

    List<User> findTop20ByOrderByLeaderBoardPunktDesc();

    User findUserByUsername(String username);

    Optional<User> findByEmail(String email);
}

