package de.unidue.beckend_gruppe_q;

import de.unidue.beckend_gruppe_q.controller.AdminController;
import de.unidue.beckend_gruppe_q.controller.PlayerController;
import de.unidue.beckend_gruppe_q.controller.UserController;
import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Deck;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.util.Random;

@EnableScheduling
@SpringBootApplication
@Transactional
public class BackendGruppeQApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendGruppeQApplication.class, args);
    }

    @Bean
    public CommandLineRunner demo(DeckRepository deckRepository, CardRepository cardRepository, UserRepository userRepository, AdminController adminController, UserController userController, PlayerController playerController) {
        return args -> {
            if (userRepository.existsByUsername("aa")) return;
            // 创建 File 对象指向要上传的文件
            File file = new File("src/main/resources/CSV/test_cards_upload.csv");
            FileInputStream input = new FileInputStream(file);

            // 创建 MockMultipartFile 对象
            MultipartFile multipartFile = new MockMultipartFile("file",
                    file.getName(), "text/csv", input);
            adminController.uploadCard(multipartFile);
            User a = new User();
            a.setUsername("aa");
            a.setFirstname("aa");
            a.setLastname("aa");
            a.setPassword("aa");
            a.setStatus(0);
            a.setLeaderBoardPunkt(0L);
            a.setSepCoins(500L);
            a.setGroupId(1);
            a.setEmail("aa@aa.com");
            userController.addUser(a);
            User b = new User();
            b.setUsername("bb");
            b.setFirstname("bb");
            b.setLastname("bb");
            b.setPassword("bb");
            b.setStatus(0);
            b.setLeaderBoardPunkt(0L);
            b.setSepCoins(500L);
            b.setGroupId(1);
            b.setEmail("bb@bb.com");
            userController.addUser(b);
            User c = new User();
            c.setUsername("cc");
            c.setFirstname("cc");
            c.setLastname("cc");
            c.setPassword("cc");
            c.setStatus(0);
            c.setLeaderBoardPunkt(0L);
            c.setSepCoins(500L);
            c.setGroupId(1);
            c.setEmail("cc@cc.com");
            userController.addUser(c);
            User d = new User();
            d.setUsername("dd");
            d.setFirstname("dd");
            d.setLastname("dd");
            d.setPassword("dd");
            d.setStatus(0);
            d.setLeaderBoardPunkt(0L);
            d.setSepCoins(500L);
            d.setGroupId(1);
            d.setEmail("dd@dd.com");
            userController.addUser(d);
            for (User user : userRepository.findAll().stream().filter(u -> !u.isRobot()).toList()) {
                Random random = new Random();
                for (int i = 0; i < 10; i++) {                      //add 10 random cards
                    int r = random.nextInt(cardRepository.findAll().size() - 1);
                    Card card = cardRepository.findAll().get(r).clone();
                    card.setId(null);
                    cardRepository.save(card);
                    user.cards.add(card);
                    userRepository.save(user);
                }
                Deck deck = new Deck();
                deck.setName("Auto Generated Deck");
                deck.setCards(user.cards);
                user.decks.add(deck);
//                deckRepository.save(deck);
                userRepository.save(user);
            }
        };
    }
}
