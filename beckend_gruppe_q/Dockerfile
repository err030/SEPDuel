FROM maven:3-eclipse-temurin-17 AS backend-runner
WORKDIR /backend_gruppe_q
COPY . .
RUN mvn clean install

CMD ["java", "-jar", "./target/backend_probe-0.0.1-SNAPSHOT.jar"]