# 运行

如果你初次使用, 我们可以生成一个示例配置并启动服务. 只需要运行 `mm` 或 `mockm` 即可.

``` sh
mm
```

运行成功后, 你会看到类似下面的输出.
``` txt
port: http://localhost:9000/
replayPort: http://localhost:9001/
testPort: http://localhost:9005/
```

::: details FQA
**端口被占用**
- 关闭占用端口的程序, 再重新运行命令.
- 或者告诉 mockm 使用其他端口

``` sh
# 告诉 mockm 使用其他端口
mm port=8800 replayPort=8801  replayPort=8802
```

默认情况下 mockm 的几个服务分别占用以下端口:
- port=9000
- replayPort=9001
- testPort=9002

**node 版本过低**
mockm 支持 node 8.x 以上的版本, 请更新 node 版本.

:::