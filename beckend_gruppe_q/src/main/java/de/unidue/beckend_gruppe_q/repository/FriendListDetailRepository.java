package de.unidue.beckend_gruppe_q.repository;

import de.unidue.beckend_gruppe_q.model.FriendListDetail;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FriendListDetailRepository extends CrudRepository<FriendListDetail, Long> {
    FriendListDetail findByFreundListIdAndFreundUserId(Long freundListId, Long freundUserId);

    List<FriendListDetail> findByFreundListId(Long listId);


}