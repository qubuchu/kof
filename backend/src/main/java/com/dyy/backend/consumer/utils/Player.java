package com.dyy.backend.consumer.utils;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Player {
    private Integer id;
    private Integer sx;//起始x坐标
    private Integer sy;
    private Integer sz;
    private Integer hp;
    private List<int[]> steps;
}
