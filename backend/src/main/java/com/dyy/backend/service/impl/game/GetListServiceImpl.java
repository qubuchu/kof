package com.dyy.backend.service.impl.game;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.dyy.backend.mapper.GameMapper;
import com.dyy.backend.pojo.Game;
import com.dyy.backend.pojo.User;
import com.dyy.backend.service.game.GetListService;
import com.dyy.backend.service.impl.utils.GetUserImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GetListServiceImpl implements GetListService{

    @Autowired
    private GameMapper gameMapper;

    @Override
    public List<Game> getList() {
        List<Game> re = new ArrayList<>();

        GetUserImpl getUser = new GetUserImpl();
        User user = getUser.getuser();

        QueryWrapper<Game> queryWrapper1 = new QueryWrapper<>();
        queryWrapper1.eq("player1", user.getId());

        re.addAll(gameMapper.selectList(queryWrapper1));

        QueryWrapper<Game> queryWrapper2 = new QueryWrapper<>();
        queryWrapper2.eq("player2", user.getId());

        re.addAll(gameMapper.selectList(queryWrapper2));

        System.out.println(re.get(1));

        return re;
    }
}
