package com.dyy.backend.controller.pk;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pk/")
public class botinfoController {
    @RequestMapping("/getbotinfo/")
    public String getbotinfo() {
        return "hhhh";
    }
}
