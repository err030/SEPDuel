package de.unidue.beckend_gruppe_q.utility;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.unidue.beckend_gruppe_q.model.Message;
import de.unidue.beckend_gruppe_q.service.MessageService;
import jakarta.annotation.Resource;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@ServerEndpoint("/websocket/{name}")
public class WebSocket {

    //存放所有连接的客户端
    private static ConcurrentHashMap<String, WebSocket> webSocketConcurrentHashMap = new ConcurrentHashMap<>();
    // concurrent包的线程安全Set,用来存放每个客户端对应的WebSocket对象。
    private static CopyOnWriteArraySet<WebSocket> webSocketSet = new CopyOnWriteArraySet<>();
    //实例一个session，这个session是websocket的session，与某个客户端连接对话，通过此对客户端发送消息
    private Session session;
    @Resource
    private MessageService messageService;

    public static ConcurrentHashMap<String, WebSocket> getWebSocketMap() {
        return webSocketConcurrentHashMap;
    }

    public static void setWebSocketMap(ConcurrentHashMap<String, WebSocket> webSocketMap) {
        WebSocket.webSocketConcurrentHashMap = webSocketMap;
    }

    //用于主动向客户端发送消息
    public static void sendMessage(String message, String userId) {
        WebSocket webSocket = webSocketConcurrentHashMap.get(userId);
        if (webSocket != null) {
            try {

                webSocket.session.getBasicRemote().sendText(message);
                System.out.println("【websocket消息】发送消息成功,用户=" + userId + ",消息内容" + message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    //前端请求时一个websocket时
    @OnOpen
    public void onOpen(Session session, @PathParam(value = "name") String userId) {


        this.session = session;
        webSocketConcurrentHashMap.put(userId, this);
        webSocketSet.add(this);
        String message = "{\"senderType\":\"friend\",\"msgType\":\"server\",\"msgContent\":\"" + userId + "|new_user\"}";
        groupSending(message, session);

        System.out.println("【userId:" + userId + "连接成功】当前连接人数为：" + webSocketConcurrentHashMap.size() + "，连接用户id：" + userId);
    }

    @OnClose
    public void onClose(@PathParam("name") String userId) {

        webSocketConcurrentHashMap.remove(userId);
        webSocketSet.remove(this);
//        for (String name : webSocketConcurrentHashMap.keySet()) {
//
//            if (this == webSocketConcurrentHashMap.get(name)) {
//
//                webSocketConcurrentHashMap.remove(name);
//                break;
//            }
//        }

        System.out.println("【userId:" + userId + "退出成功】当前连接人数为：" + webSocketConcurrentHashMap.size());
    }

    @OnError
    public void onError(Session session, Throwable throwable) {

        System.out.println("错误原因:" + throwable.getMessage());

        throwable.printStackTrace();
    }

    @OnMessage
    public void onMessage(Session session, String message) throws JsonProcessingException {

        System.out.println("【webSocket接收成功】内容为：" + message);

        ObjectMapper objectMapper = new ObjectMapper();

        Message msgObj = objectMapper.readValue(message, Message.class);
        //发送者
        String senderId = msgObj.getSender();
        //指定接收者
        String recipientId = msgObj.getRecipient();
        //消息内容
        String msgContent = msgObj.getMsgContent();


        //此处可以指定发送，或者群发

        if (recipientId.indexOf(",") > 0 || recipientId.split(",").length > 1) {

            String[] recipientIds = recipientId.split(",");
            sendMoreMessage(recipientIds, message, session);

        } else {

            sendOneMessage(recipientId, message);

            //获取sender的Stirng
//            for (String senderStr : webSocketConcurrentHashMap.keySet()) {
//
//                if (webSocketConcurrentHashMap.get(senderStr).getSession() == session) {
//
//                    appointSending(senderStr, recipientId, message.substring(message.indexOf(";") + 1));
//                }
//            }
        }
    }

    //除自己外群发消息
    public void groupSending(String message, Session exIncludeSession) {

        for (String name : webSocketConcurrentHashMap.keySet()) {

            try {
                //排除自己
                if (exIncludeSession == webSocketConcurrentHashMap.get(name).session) {
                    continue;
                }

                webSocketConcurrentHashMap.get(name).session.getBasicRemote().sendText(message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    //指定用户发消息
    public void appointSending(String sender, String name, String message) {

        try {
            sendMessage(message, sender);

            Message receivedMessage = new Message();
            receivedMessage.setTimestamp(LocalDateTime.now());
            receivedMessage.setMsgContent(message);
            receivedMessage.setIsRead(false);
//            receivedMessage.setSender();
//            receivedMessage.setChat();
            Message savedMessage = messageService.create(receivedMessage);

            webSocketConcurrentHashMap.get(name).session.getBasicRemote().sendText(sender + ":" + message);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Session getSession() {
        return session;
    }


    //广播消息
    public void sendAllMessage(String message) {

        for (WebSocket webSocket : webSocketSet) {
            try {
                if (webSocket.session.isOpen()) {
                    webSocket.session.getAsyncRemote().sendText(message);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    //单点消息
    public void sendOneMessage(String userId, String msg) throws JsonProcessingException {
        WebSocket webSocket = webSocketConcurrentHashMap.get(userId);
        ObjectMapper objectMapper = new ObjectMapper();

        Message msgObj = objectMapper.readValue(msg, Message.class);
        //发送者
        String senderId = msgObj.getSender();
        //指定接收者
        String recipientId = msgObj.getRecipient();
        //消息内容
        String msgContent = msgObj.getMsgContent();
        //消息是否读取
        //boolean isRead = msgObj.isRead();
        String msgType = msgObj.getMsgType();
        String uuid = msgObj.getUuid();
        String message = msgObj.getMsgContent();
        System.out.printf("msgType是：" + msgType);
        if (webSocket != null) {
            if (msgType != null && msgType.equals("backToMsgRead")) {
                message = "{\"fromUuid\":\"" + uuid + "\",\"msgType\":\"backToMsgRead\",\"isRead\":\"true\"}";
            } else {
                message = "{\"fromUuid\":\"" + uuid + "\",\"senderType\":\"friend\",\"msgContent\":\"" + message + "\"}";

            }

            Session session = webSocketConcurrentHashMap.get(userId).session;
            if (session.isOpen()) {
                try {

                    session.getAsyncRemote().sendText(message);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        } else {
            message = "{\"senderType\":\"friend\",\"msgType\":\"server\",\"msgContent\":\"" + userId + "_offline\"}";
            session.getAsyncRemote().sendText(message);
        }

    }

    // 单点消息(多人)
    public void sendMoreMessage(String[] userIds, String message, Session exIncludeSession) {
        for (String userId : userIds) {
            WebSocket webSocket = webSocketConcurrentHashMap.get(userId);
            if (webSocket != null) {
                Session session = webSocketConcurrentHashMap.get(userId).session;
                if (session != null && session.isOpen()) {
                    try {
                        if (exIncludeSession == webSocketConcurrentHashMap.get(userId).session) {
                            continue;
                        }
                        session.getAsyncRemote().sendText(message);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

        }

    }

}
