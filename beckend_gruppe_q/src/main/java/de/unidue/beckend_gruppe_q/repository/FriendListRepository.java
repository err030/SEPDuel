package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.FriendList;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FriendListRepository extends CrudRepository<FriendList, Long> {
    FriendList findByUserId(Long userId);
}