package com.dyy.backend.controller.game;

import com.alibaba.fastjson.JSONObject;
import com.dyy.backend.pojo.Game;
import com.dyy.backend.service.game.GetListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class GetListController {
    @Autowired
    private GetListService getListService;

    @GetMapping("/game/getlist/")
    public JSONObject getList(@RequestParam Map<String, String> data) {
        Integer page = Integer.parseInt(data.get("page"));
        return getListService.getList(page);
    }
}
