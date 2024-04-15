package com.dyy.backend.service.impl.game;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.dyy.backend.mapper.GameMapper;
import com.dyy.backend.pojo.Game;
import com.dyy.backend.pojo.User;
import com.dyy.backend.service.game.GetListService;
import com.dyy.backend.service.impl.utils.GetUserImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetListServiceImpl implements GetListService{

    @Autowired
    private GameMapper gameMapper;

    @Override
    public List<Game> getList() {
        GetUserImpl getUser = new GetUserImpl();
        User user = getUser.getuser();

        QueryWrapper<Game> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("player1", user.getId());

        return gameMapper.selectList(queryWrapper);
    }
}
