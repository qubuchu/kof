package com.dyy.backend.service.game;

import com.alibaba.fastjson.JSONObject;
import com.dyy.backend.pojo.Game;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;


public interface GetListService {
    JSONObject getList(Integer page);
}
