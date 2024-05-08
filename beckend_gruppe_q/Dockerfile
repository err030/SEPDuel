# 使用 OpenJDK 11 作为基础镜像
FROM openjdk:17

# 设置工作目录
WORKDIR /src

# 拷贝应用程序文件到容器中
COPY target/backend_probe-0.0.1-SNAPSHOT.jar .

# 定义容器启动时要执行的命令
CMD ["java", "-jar", "backend_probe-0.0.1-SNAPSHOT.jar"]
