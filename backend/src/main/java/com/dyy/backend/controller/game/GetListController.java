package com.dyy.backend.controller.game;

import com.dyy.backend.pojo.Game;
import com.dyy.backend.service.game.GetListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class GetListController {
    @Autowired
    private GetListService getListService;

    @GetMapping("/game/getlist/")
    public List<Game> getList() {
        return getListService.getList();
    }
}
