package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.FriendRequest;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendRequestRepository extends CrudRepository<FriendRequest, Long> {
    FriendRequest findBySchickenUserIdAndZielUserId(Long schickenUserId, Long zielUserId);
    List<FriendRequest> findByZielUserId(Long zielUserId);
    List<FriendRequest> findByZielUserIdOrderByFreundschaftanfragStatus(Long zielUserId);


}
