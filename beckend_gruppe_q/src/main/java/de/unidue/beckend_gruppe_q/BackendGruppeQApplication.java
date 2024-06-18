package de.unidue.beckend_gruppe_q;

import de.unidue.beckend_gruppe_q.controller.AdminController;
import de.unidue.beckend_gruppe_q.model.Card;
import de.unidue.beckend_gruppe_q.model.Deck;
import de.unidue.beckend_gruppe_q.model.Rarity;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.DeckRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.List;

@EnableScheduling
@SpringBootApplication
//@Transactional
public class BackendGruppeQApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendGruppeQApplication.class, args);
    }

    @Bean
    public CommandLineRunner demo(DeckRepository deckRepository, CardRepository cardRepository, UserRepository userRepository, AdminController adminController) {
        return args -> {
            // 创建 File 对象指向要上传的文件
            File file = new File("beckend_gruppe_q/src/main/resources/CSV/test_cards_upload.csv");
            FileInputStream input = new FileInputStream(file);

            // 创建 MockMultipartFile 对象
            MultipartFile multipartFile = new MockMultipartFile("file",
                    file.getName(), "text/csv", input);
            adminController.uploadCard(multipartFile);
        };
////            create a deck
////            Deck deck = new Deck();
////            deck.setName("Deck");
////            deckRepository.save(deck);
////            Card card = new Card("kill", Rarity.COMMON, 1, 1, "A card that kills", "");
////            cardRepository.save(card);
////            Card card2 = new Card("heal", Rarity.COMMON, 1, 1, "A card that heals", "");
////            cardRepository.save(card2);
////
////            User user = new User();
////            user.setUsername("admin");
////            user.cards.add(card);
////            user.cards.add(card2);
////
////            userRepository.save(user);
//            for (User u : userRepository.findAll()) {
//                u.cards.clear();
////                u.decks.clear();
//                userRepository.save(u);
//            }
////          展示需要这段代码生成测试卡片
//            for (User u : userRepository.findAll()) {
//                if (u.getCards().stream().anyMatch(card -> "test".equals(card.getName()) || "桃园结义".equals(card.getName()) || "顺手牵羊".equals(card.getName()) || "无懈可击".equals(card.getName()) || "铁索连环".equals(card.getName()))) {}
//                else {
//                    u.decks.clear();
//                    u.cards.clear();
//                    userRepository.save(u);
//                    u.cards.add(new Card("test", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                    u.cards.add(new Card("桃园结义", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                    u.cards.add(new Card("顺手牵羊", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                    u.cards.add(new Card("无懈可击", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                    u.cards.add(new Card("铁索连环", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                    userRepository.save(u);
//
//                }
//            }

////            User u = userRepository.findById(1L).get();
////
////            List<Deck> d = u.decks;
////            for (int i = 1; i < 4; i++) {
////                List<Card> c = new ArrayList<>();
////                d.add(new Deck("Deck " + i, "", c));
////
////                c.add(new Card("test", Rarity.COMMON, 1, 1, "A card for testing", ""));
////            }
////            userRepository.save(u);
    }
}
