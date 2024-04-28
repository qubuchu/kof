package com.dyy.backend.consumer;

import com.alibaba.fastjson.JSONObject;
import com.dyy.backend.consumer.utils.Gameback;
import com.dyy.backend.consumer.utils.JwtAuthentication;
import com.dyy.backend.mapper.GameMapper;
import com.dyy.backend.mapper.UserMapper;
import com.dyy.backend.pojo.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@ServerEndpoint("/websocket/{token}")  // 注意不要以'/'结尾
public class WebSocketServer {

    final public static ConcurrentHashMap<Integer, WebSocketServer> users = new ConcurrentHashMap<>();
    final private static CopyOnWriteArraySet<User> matchpool = new CopyOnWriteArraySet<>();
    private User user;
    private Session session = null;

    public static UserMapper userMapper;
    public static GameMapper gameMapper;
    private Gameback gameback = null;

    @Autowired
    public void setUserMapper(UserMapper userMapper) {
        WebSocketServer.userMapper = userMapper;
    }

    @Autowired
    public void setGameMapper(GameMapper gameMapper) {
        WebSocketServer.gameMapper = gameMapper;
    }

    @OnOpen
    public void onOpen(Session session, @PathParam("token") String token) throws IOException {
        // 建立连接
        this.session = session;
        System.out.println("connected");

        Integer userId = JwtAuthentication.getUserId(token);
        this.user = userMapper.selectById(userId);

        if(this.user != null)
        {
            users.put(userId, this);
        }
        else {
            this.session.close();
        }
    }

    @OnClose
    public void onClose() {
        // 关闭链接
        System.out.println("disconnected");
        if(this.user != null) {
            users.remove(this.user.getId());
        }
    }

    private void startMatching() {
        System.out.println("start matching");
        matchpool.add(this.user);

        while(matchpool.size() >= 2) {
            Iterator<User> it = matchpool.iterator();
            User a = it.next(), b = it.next();
            matchpool.remove(a);
            matchpool.remove(b);

            Gameback gameback = new Gameback(a.getId(), b.getId());
            users.get(a.getId()).gameback = gameback;
            users.get(b.getId()).gameback = gameback;

            gameback.start();

            JSONObject respGame = new JSONObject();
            respGame.put("a_id", gameback.getPlayerA().getId());
            respGame.put("a_sx", gameback.getPlayerA().getSx());
            respGame.put("a_sy", gameback.getPlayerA().getSy());
            respGame.put("a_sz", gameback.getPlayerA().getSz());
            respGame.put("b_id", gameback.getPlayerB().getId());
            respGame.put("b_sx", gameback.getPlayerB().getSx());
            respGame.put("b_sy", gameback.getPlayerB().getSy());
            respGame.put("b_sz", gameback.getPlayerB().getSz());

            JSONObject respA = new JSONObject();
            respA.put("event", "start-matching");
            respA.put("opponent_username", b.getUsername());
            respA.put("opponent_photo", b.getPhoto());
            respA.put("game", respGame);
            users.get(a.getId()).sendMessage(respA.toJSONString());

            JSONObject respB = new JSONObject();
            respB.put("event", "start-matching");
            respB.put("opponent_username", a.getUsername());
            respB.put("opponent_photo", a.getPhoto());
            respB.put("game", respGame);
            users.get(b.getId()).sendMessage(respB.toJSONString());
        }
    }

    private void stopMatching() {
        System.out.println("stop matching");
        matchpool.remove(this.user);
    }

    private void operate(int[] keyin) {
        if(gameback.getPlayerA().getId().equals(user.getId())) { // 判断请求为哪位玩家发出
            gameback.setNextStepA(keyin);
        } else if (gameback.getPlayerB().getId().equals(user.getId())) {
            gameback.setNextStepB(keyin);
        }
    }

    private void decrease(int hp) { // 同时减少是因为同步问题， 客户端的玩家A和玩家B都向服务器发送了请求
        if(gameback.getPlayerA().getId().equals(user.getId())) { // 如果请求为A玩家发出，则B掉血
            gameback.setHpB(hp);
        } else if (gameback.getPlayerB().getId().equals(user.getId())) {
            gameback.setHpA(hp);
        }
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        // 从Client接收消息
//        System.out.println("receive message");
        JSONObject data = JSONObject.parseObject(message);
        String event = data.getString("event");
        if("start-matching".equals(event)) {
            startMatching();
        } else if("stop-matching".equals(event)) {
            stopMatching();
        } else if("operate".equals(event)) { // 传入操作
            int ow = data.getInteger("ow");
            int os = data.getInteger("os");
            int oa = data.getInteger("oa");
            int od = data.getInteger("od");
            int ospace = data.getInteger("ospace");
            int oj = data.getInteger("oj");
            int ok = data.getInteger("ok");
            int[] op = {ow, os, oa, od, ospace, oj, ok};
            operate(op);
        } else if("attack".equals(event)) {
            int hp = data.getInteger("hp");
            decrease(hp);
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        error.printStackTrace();
    }

    public  void sendMessage(String message) {
        synchronized(this.session) {
            try {
                this.session.getBasicRemote().sendText(message);
            } catch(IOException e) {
                e.printStackTrace();
            }
        }
    }
}