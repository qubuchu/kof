package com.dyy.backend.service.impl.game;

import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dyy.backend.mapper.GameMapper;
import com.dyy.backend.pojo.Game;
import com.dyy.backend.pojo.User;
import com.dyy.backend.service.game.GetListService;
import com.dyy.backend.service.impl.utils.GetUserImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GetListServiceImpl implements GetListService{

    @Autowired
    private GameMapper gameMapper;

    @Override
    public JSONObject getList(Integer page) {
        IPage<Game> gameIPage = new Page<>(page, 10);

        GetUserImpl getUser = new GetUserImpl();
        User user = getUser.getuser();

        QueryWrapper<Game> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("play_time");
        queryWrapper.or(wrapper -> wrapper.eq("player1", user.getId()))
                .or(wrapper -> wrapper.eq("player2", user.getId()));

        long res_count = gameMapper.selectCount(queryWrapper);
        int lists_count = (int) res_count;

        IPage<Game> resultPage = gameMapper.selectPage(gameIPage, queryWrapper);
        List<Game> resultList = resultPage.getRecords();

        JSONObject resp = new JSONObject();
        resp.put("lists", resultList);
        resp.put("lists_count", lists_count);
        return resp;
    }
}
