package com.dyy.backend.service.impl.game;

import com.dyy.backend.mapper.GameMapper;
import com.dyy.backend.pojo.Game;
import com.dyy.backend.pojo.User;
import com.dyy.backend.service.game.AddService;
import com.dyy.backend.service.impl.utils.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class AddServiceImpl implements AddService {

    @Autowired
    private GameMapper gameMapper;

    @Override
    public Map<String, String> add(Map<String, String> data) {
        UsernamePasswordAuthenticationToken authenticationToken =
                (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl loginUser = (UserDetailsImpl) authenticationToken.getPrincipal();
        User user = loginUser.getUser();

        Integer player1 = Integer.parseInt(data.get("player1"));
        Integer player2 = Integer.parseInt(data.get("player2"));

        Integer role1 = Integer.parseInt(data.get("role1"));
        Integer role2 = Integer.parseInt(data.get("role2"));

        Integer winId = Integer.parseInt(data.get("winId"));

        Map<String, String> map = new HashMap<>();

        Date now = new Date();
        Game game = new Game(null, player1, player2, role1, role2, now, now, winId);

        gameMapper.insert(game);
        map.put("error_message", "success");

        return map;
    }
}
