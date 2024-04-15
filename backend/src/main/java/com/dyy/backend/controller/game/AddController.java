package com.dyy.backend.controller.game;

import com.dyy.backend.service.game.AddService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AddController {
    @Autowired
    private AddService addService;

    @PostMapping("/game/add/")
    public Map<String, String> add(@RequestParam Map<String, String> data) {
        Integer player1 = Integer.parseInt(data.get("player1"));
        return addService.add(data);
    }
}
