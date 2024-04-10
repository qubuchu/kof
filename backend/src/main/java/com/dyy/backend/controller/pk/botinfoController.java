package com.dyy.backend.controller.pk;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/pk/")
public class botinfoController {
    @RequestMapping("/getbotinfo/")
    public Map<String, String> getbotinfo() {
        Map<String, String> bot1 = new HashMap<>();
        bot1.put("name", "tiger");
        bot1.put("rating", "1200");
        return bot1;
    }
}
