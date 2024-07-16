package de.unidue.beckend_gruppe_q.utility;

import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class RobotUserInitializer implements ApplicationRunner {

    private final UserRepository userRepository;

    @Autowired
    public RobotUserInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        // 检查是否已经存在Robot用户
        if (userRepository.findByEmail("robot@robot.com").isEmpty()) {
            User robotUser = new User();
            robotUser.setUsername("robot");
            robotUser.setPassword("password");
            robotUser.setFirstname("Robot");
            robotUser.setLastname("Player");
            robotUser.setEmail("robot@robot.com");
            robotUser.setRobot(true);

            userRepository.save(robotUser);
            System.out.println("Robot user created successfully.");
        } else {
            System.out.println("Robot user already exists.");
        }
    }
}
