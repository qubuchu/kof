package com.dyy.backend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dyy.backend.pojo.Game;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GameMapper extends BaseMapper<Game> {
}
