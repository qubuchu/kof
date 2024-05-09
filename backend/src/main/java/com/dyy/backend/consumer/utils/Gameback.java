package com.dyy.backend.consumer.utils;

import com.alibaba.fastjson.JSONObject;
import com.dyy.backend.consumer.WebSocketServer;
import com.dyy.backend.pojo.Game;
import com.dyy.backend.pojo.User;

import java.util.ArrayList;
import java.util.Date;
import java.util.concurrent.locks.ReentrantLock;

public class Gameback extends Thread{
    private final static int[] operate = {0, 0, 0, 0, 0, 0, 0};
    private final Player playerA, playerB;

    private int[] nextStepA = {0, 0, 0, 0, 0, 0, 0};
    private int[] nextStepB = {0, 0, 0, 0, 0, 0, 0};

    private ReentrantLock lock = new ReentrantLock();
    private String status = "playing"; // playing finished
    private String loser = ""; // all: 平局 A: A输 B: B输
    private int hpA = 100;
    private int downA = 0; // 玩家A减少生命，用于判断是否需要发送信息给前端
    private int hpB = 100;
    private int downB = 0;

    public Gameback(Integer idA, Integer idB) {
        playerA = new Player(idA, 2, 3, 0, hpA, new ArrayList<>());
        playerB = new Player(idB, -2, 3, 0, hpB, new ArrayList<>());
    }

    private void updateUserRating(Player player, Integer rating) {
        User user = WebSocketServer.userMapper.selectById(player.getId());
        user.setRating(rating);
        WebSocketServer.userMapper.updateById(user);
    }

    private void saveToDatabase() {
        Date now = new Date();
        Integer ratingA = WebSocketServer.userMapper.selectById(playerA.getId()).getRating();
        Integer ratingB = WebSocketServer.userMapper.selectById(playerB.getId()).getRating();


        int winid = 0;
        if("A".equals(loser))
        {
            winid = playerB.getId();
            ratingB += 10;
            ratingA -= 10;
        }
        if("B".equals(loser))
        {
            winid = playerA.getId();
            ratingB -= 10;
            ratingA += 10;
        }
        Game game = new Game(null, playerA.getId(), playerB.getId(), 1, 1, now, winid);

        updateUserRating(playerA, ratingA);
        updateUserRating(playerB, ratingB);

        WebSocketServer.gameMapper.insert(game);
    }

    public Player getPlayerA() {
        return playerA;
    }

    public Player getPlayerB() {
        return playerB;
    }

    public void setNextStepA(int[] nextStepA) {
        lock.lock();
        try {
            this.nextStepA = nextStepA;
        } finally {
            lock.unlock();
        }
    }

    public void setNextStepB(int[] nextStepB) {
        lock.lock();
        try {
            this.nextStepB = nextStepB;
        } finally {
            lock.unlock();
        }
    }

    public void setHpA(int down) {
        lock.lock();
        try {
            this.downA = down;
            this.hpA = this.hpA - down;
        } finally {
            lock.unlock();
        }
    }

    public void setHpB(int down) {
        lock.lock();
        try {
            this.downB = down;
            this.hpB = this.hpB - down;
        } finally {
            lock.unlock();
        }
    }

    private Boolean nextStep() { // 是否接收信息
        boolean flagA = false, flagB = false;
        try {
            Thread.sleep(100);
            for (int i = 0; i < 7; i++) {
                lock.lock();
                try {
                    if (nextStepA[i] != 0) {
                        flagA = true;
                    }
                    if (nextStepB[i] != 0) {
                        flagB = true;
                    }
                } finally {
                    lock.unlock();
                }
            }
            if (flagA) {
                lock.lock();
                try {
                    playerA.getSteps().add(nextStepA);
                } finally {
                    lock.unlock();
                }
            }
            if (flagB) {
                lock.lock();
                try {
                    playerB.getSteps().add(nextStepB);
                } finally {
                    lock.unlock();
                }
            }
            if (this.downA != 0)
                flagA = true;
            if (this.downB != 0)
                flagB = true;
            if (flagA || flagB)
                return true;
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return false;
    }

    public void judge() {
        lock.lock();
        try {
            if(this.hpA == 0)
            {
                this.status = "finished";
                this.loser = "A";
            }
            else if(this.hpB == 0)
            {
                this.status = "finished";
                this.loser = "B";
            }
        } finally {
            lock.unlock();
        }
    }

    private void sendAllMessage(String message) {
        WebSocketServer.users.get(playerA.getId()).sendMessage(message);
        WebSocketServer.users.get(playerB.getId()).sendMessage(message);
    }


    private void sendOperate() {
        lock.lock();
        try {
            JSONObject resp = new JSONObject();
            resp.put("event", "operate");
            resp.put("a_operate", nextStepA);
            resp.put("b_operate", nextStepB);
            resp.put("a_down", downA);
            resp.put("b_down", downB);
            sendAllMessage(resp.toJSONString());
            for(int i = 0; i < 7; i ++ ){
                nextStepA[i] = 0;
                nextStepB[i] = 0;
            }
            downA = downB = 0;
        } finally {
            lock.unlock();
        }
    }

    public void sendResult() {
        JSONObject resp = new JSONObject();
        resp.put("event", "result");
        resp.put("loser", loser);
        System.out.println("save");
        saveToDatabase();
        sendAllMessage(resp.toJSONString());
    }

    @Override
    public void run() {
        while(true) {
            if (nextStep()) // 存在操作
            {
                judge();
                if (status.equals("playing")) {
                    sendOperate();
                } else {
                    sendOperate();
                    sendResult();
                    break;
                }
            }
        }
    }
}
