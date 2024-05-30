package de.unidue.beckend_gruppe_q.controller;

import de.unidue.beckend_gruppe_q.model.Chat;
import de.unidue.beckend_gruppe_q.repository.ChatRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import de.unidue.beckend_gruppe_q.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@CrossOrigin
@RestController
@RequestMapping("/chatgroup")
public class ChatController {
    private final ChatService chatService;

    final ChatRepository chatRepository;
    final UserRepository userRepository;
    //在没有konstruktor之前，ChatService存在 related problem？
    public ChatController(ChatService chatService, ChatRepository chatRepository, UserRepository userRepository) {
        this.chatService = chatService;
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/create")
    public Chat create(@RequestBody Chat chat) {
        return chatService.create(chat);
    }


    /**
     * Alle Chatgruppen für diesen Benutzer abrufen
     * @param currentUserId
     * @return
     */
    @GetMapping("/getChatGroupList/{currentUserId}")
    public ResponseEntity<List<Chat>> getChatGroupListByUserId(@PathVariable(value = "currentUserId") Long currentUserId){
        List<Chat> chatGroupList = new ArrayList<>();
        List<Chat> groupList = chatRepository.findAll();
        groupList.forEach(
                group ->{
//                 Optional<User> userOptional = userRepository.findById(currentUserId);
//                 boolean isContainUser=group.getParticipants().contains(userOptional);
                    //boolean isContainUser=group.getChatUserIds().indexOf(","+currentUserId.toString())>0?true:false;
                    boolean isContainUser=false;
                    String[] userIds = group.getChatUserIds().split(",");
                    List userIdList= Arrays.stream(userIds).toList();
                    if(userIdList.contains(currentUserId.toString())){
                        isContainUser=true;
                    }
//                 else if(group.getChatUserIds().indexOf(currentUserId.toString()+",")>0){
//                     isContainUser=true;
//                 }

                    if(isContainUser){
                        chatGroupList.add(group);
                    }
                }
        );
        return ResponseEntity.status(HttpStatus.OK).body(chatGroupList);
    }

    /**
     * Abrufen von Chatgruppeninformationen basierend auf der Chatgruppen-ID
     * @param groupid
     * @return
     */
    @GetMapping("/{groupid}")
    public ResponseEntity<?> getGroupByGroupId(@PathVariable(name = "groupid") Long groupid) {
        Optional<Chat> chatOptional = chatRepository.findById(groupid);
        if (chatOptional.isPresent()) {

            return ResponseEntity.status(HttpStatus.OK).body(chatOptional);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    /**
     * Update Gruppe Information
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateChatGroup(@RequestBody Chat chat) {

        if(chat!=null){
            chatRepository.save(chat);
            return ResponseEntity.status(HttpStatus.OK).body(null);
        }else{
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }

    }
}
