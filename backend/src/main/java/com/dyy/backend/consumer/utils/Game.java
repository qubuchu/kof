package com.dyy.backend.consumer.utils;

import com.alibaba.fastjson.JSONObject;
import com.dyy.backend.consumer.WebSocketServer;
import org.springframework.aop.scope.ScopedProxyUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.concurrent.locks.ReentrantLock;

public class Game extends Thread{
    private final static int[] operate = {0, 0, 0, 0, 0, 0, 0};
    private final Player playerA, playerB;

    private int[] nextStepA = {0, 0, 0, 0, 0, 0, 0};
    private int[] nextStepB = {0, 0, 0, 0, 0, 0, 0};

    private ReentrantLock lock = new ReentrantLock();
    private String status = "playing"; // playing finished
    private String loser = ""; // all: 平局 A: A输 B: B输
    private int hpA = 100;
    private int hpB = 100;

    public Game(Integer idA, Integer idB) {
        playerA = new Player(idA, 2, 3, 0, hpA, new ArrayList<>());
        playerB = new Player(idB, -2, 3, 0, hpB, new ArrayList<>());
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
            this.hpA = this.hpA - down;
        } finally {
            lock.unlock();
        }
    }

    public void setHpB(int down) {
        lock.lock();
        try {
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
            if (flagA || flagB)
                return true;
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return false;
    }

    private void judge() {
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
            System.out.println("?");
            for(int i = 0; i < 7; i ++ )
                System.out.print(nextStepA[i] + " ");
            sendAllMessage(resp.toJSONString());
            for(int i = 0; i < 7; i ++ ){
                nextStepA[i] = 0;
                nextStepB[i] = 0;
            }
        } finally {
            lock.unlock();
        }
    }

    public void sendResult() {
        JSONObject resp = new JSONObject();
        resp.put("event", "result");
        resp.put("loser", loser);
        sendAllMessage(resp.toJSONString());
    }

    @Override
    public void run() {
//        for(int i = 0; i < 1000; i ++) {
        while(true) {
            if (nextStep()) // 存在操作
            {
                judge();
                if (status.equals("playing")) {
                    sendOperate();
                } else {
                    sendResult();
                    break;
                }
            }
        }
//        }
//        System.out.println(1000);
    }
}
