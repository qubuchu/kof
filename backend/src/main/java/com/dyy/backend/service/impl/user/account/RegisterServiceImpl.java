package com.dyy.backend.service.impl.user.account;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.dyy.backend.mapper.UserMapper;
import com.dyy.backend.pojo.User;
import com.dyy.backend.service.user.account.RegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RegisterServiceImpl implements RegisterService {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public Map<String, String> register(String username, String password, String confirmedPassword) {
        System.out.println(username);

        Map<String, String> map = new HashMap<>();
        if (username == null) {

            map.put("error_message", "用户名不能为空");
            return map;
        }

        if (password == null || confirmedPassword == null) {
            map.put("error_message", "密码不能为空");
            return map;
        }

        username = username.trim();
        if (username.length() == 0) {
            map.put("error_message", "用户名不能为空");
            return map;
        }

        if (password.length() == 0 || confirmedPassword.length() == 0) {
            map.put("error_message", "密码不能为空");
            return map;
        }

        if (username.length() > 100) {
            map.put("error_message", "用户名长度不能大于100");
            return map;
        }

        if (password.length() > 100 || confirmedPassword.length() > 100) {
            map.put("error_message", "密码长度不能大于100");
            return map;
        }

        if (!password.equals(confirmedPassword)) {
            map.put("error_message", "两次输入的密码不一致");
            return map;
        }

        System.out.println("test");
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        List<User> usersList = userMapper.selectList(queryWrapper);
        if (usersList.size() > 0) {
            User fistUser = usersList.get(0);
            System.out.println(fistUser);
        }
        queryWrapper.eq("username", username);
        List<User> users = userMapper.selectList(queryWrapper);
        if (!users.isEmpty()) {
            map.put("error_message", "用户名已存在");
            return map;
        }

        String encodedPassword = passwordEncoder.encode(password);
        String photo = "https://tse3-mm.cn.bing.net/th/id/OIP-C.wVaQUcf3JSQtuUkfUoMX7AAAAA?rs=1&pid=ImgDetMain";
        Integer rating = 1500;
        User user = new User(null, username, encodedPassword, photo, rating);
        userMapper.insert(user);

        map.put("error_message", "success");
        return map;
    }
}
