package de.unidue.beckend_gruppe_q.controller;


import de.unidue.beckend_gruppe_q.model.SecurityCode;
import de.unidue.beckend_gruppe_q.model.User;
import de.unidue.beckend_gruppe_q.repository.CardRepository;
import de.unidue.beckend_gruppe_q.repository.SecurityCodeRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import de.unidue.beckend_gruppe_q.service.EmailService;
import de.unidue.beckend_gruppe_q.utility.FileUtil;
import de.unidue.beckend_gruppe_q.utility.UserTokenUtil;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;

@CrossOrigin
@RestController
public class UserController {
    final UserRepository userRepository;
    final SecurityCodeRepository securityCodeRepository;
    final EmailService emailService;


    final BCryptPasswordEncoder passwordEncoder;
    private final CardRepository cardRepository;

    public UserController(UserRepository userRepository, SecurityCodeRepository securityCodeRepository, EmailService emailService, BCryptPasswordEncoder passwordEncoder, CardRepository cardRepository) {
        this.userRepository = userRepository;
        this.securityCodeRepository = securityCodeRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.cardRepository = cardRepository;
    }

    /**
     * 添加新用户，该方法用于注册
     */
    @PostMapping("/user")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        System.out.println("User: " + user);
        // 先检查新用户的Email在同一个用户组里是否已经被注册了
        // 目前的设定是同一个用户组里面Email必须是唯一的，但是一个Email可以注册为普通用户和管理员
        List<User> list = userRepository.findUserByEmailAndGroupId(user.getEmail(), user.getGroupId());
        if (list != null && !list.isEmpty()) {
            // 如果Email在同一个用户组里已经被注册了，返回状态码409
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } else {
            // 如果Email还没有注册，则先把密码进行加密
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setSepCoins(500L);
            user.setLeaderBoardPunkt(0L);
            // test cards
//            if (user.getCards().stream().anyMatch(card -> "Test Card".equals(card.getName()) || "Dog".equals(card.getName()) || "Cat".equals(card.getName()) || "Rabbit".equals(card.getName()) || "Elephant".equals(card.getName()))) {}
//            else {
//                user.decks.clear();
//                user.cards.clear();
//                userRepository.save(user);
//                user.cards.add(new Card("Test Card", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                user.cards.add(new Card("Dog", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                user.cards.add(new Card("Cat", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                user.cards.add(new Card("Rabbit", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                user.cards.add(new Card("Elephant", Rarity.COMMON, 1, 1, "A card for testing", ""));
//                cardRepository.saveAll(user.cards);
//                userRepository.save(user);
//
//            }

            // 然后保存到数据库里
            userRepository.save(user);
            // 注册成功，返回状态码201
            return ResponseEntity.status(HttpStatus.CREATED).body(null);
        }
    }

    /**
     * 通过Email、密码和用户组获取用户信息，该方法用于登录
     */
    @GetMapping("user/{email}/{password}/{groupid}")
    public ResponseEntity<User> getUserByEmailAndPasswordAndGroupId(@PathVariable(value = "email") String email,
                                                                    @PathVariable(value = "password") String password,
                                                                    @PathVariable(value = "groupid") Integer groupId) {
        // 检查Email和用户组在数据库中是否已经存在
        List<User> userByEmailAndGroupId = userRepository.findUserByEmailAndGroupId(email, groupId);
        if (userByEmailAndGroupId != null && !userByEmailAndGroupId.isEmpty()) {
            // 如果存在，则继续检查用户提交的密码和数据库中保存的密码是否一致
            if (passwordEncoder.matches(password, userByEmailAndGroupId.get(0).getPassword())) {
                // 如果一致，返回状态码200，并把用户信息放入body中
                return ResponseEntity.status(HttpStatus.OK).body(userByEmailAndGroupId.get(0));
            } else {
                // 如果不一致，返回状态码401
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }
        } else {
            // 如果不存在，返回状态码404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * 根据用户id获取验证码，用于登录时的二次验证
     */
    @GetMapping("/user/securitycode/{userid}")
    public ResponseEntity<SecurityCode> getSecurityCodeByUserId(@PathVariable(value = "userid") Long userId) {
        // 先通过用户id检查用户是否存在
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            // 如果用户存在
            User user = userOptional.get();
            // 生成一个6位数的随机字符串，只由数字组成
            String code = RandomStringUtils.randomNumeric(6);
            // 验证码的有效期截止到当前时间之后的10分钟
            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.MINUTE, 10);
            Date expirationTime = calendar.getTime();
            // 查找验证码表中该用户是否已经有数据
            List<SecurityCode> codeList = securityCodeRepository.findByUserId(user.getId());
            if (codeList.size() != 0) {
                // 如果已经有的话，直接替换当前数据，这样每个用户在表中始终只有一条数据存在
                SecurityCode securityCode = codeList.get(0);
                securityCode.setCode(code);
                securityCode.setExpirationTime(expirationTime);
                securityCodeRepository.save(securityCode);
            } else {
                // 如果没有的话，则添加一条新数据
                securityCodeRepository.save(new SecurityCode(user.getId(), code, expirationTime));
            }
            // 设置邮件内容
            SimpleDateFormat format = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");
            String emailSubject = "SEP: Your Securitycode";
            String emailText = "Your securitycode is: " + code + ", valid until " + format.format(expirationTime) + " . Do not share this code.";
            try {
                // 发送邮件
                emailService.sendEMail(user.getEmail(), emailSubject, emailText);
            } catch (Exception e) {
                // 如果发送失败，返回状态码503
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(null);
            }
            // 如果发送成功，返回状态码201
            return ResponseEntity.status(HttpStatus.CREATED).body(null);
        } else {
            // 如果用户不存在，返回状态码404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * 检查验证码是否有效
     */
    @GetMapping("/user/securitycode/{userid}/{securitycode}")
    public ResponseEntity<SecurityCode> checkSecurityCode(@PathVariable(value = "userid") Long userId,
                                                          @PathVariable(value = "securitycode") String code) {
        // 根据用户id和提交的验证码检查数据库中是否有记录
        List<SecurityCode> list = securityCodeRepository.findByUserIdAndCode(userId, code);
        if (!list.isEmpty()) {
            // 如果有记录，继续检查验证码是否已经过期
            SecurityCode securityCode = list.get(0);
            Date now = new Date();
            if (now.after(securityCode.getExpirationTime())) {
                // 如果验证码已经过期，返回状态码401
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            } else {
                // 如果验证码有效，返回状态码200
                return ResponseEntity.status(HttpStatus.OK).body(null);
            }
        } else {
            // 没有记录的话说明验证码错误，返回状态码404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * 检查Email在用户组中是否存在，用户找回密码
     */
    @GetMapping("user/{email}/{groupid}")
    public ResponseEntity<?> checkUserByEmailAndGroupId(@PathVariable(value = "email") String email, @PathVariable(value = "groupid") Integer groupId) {
        List<User> list = userRepository.findUserByEmailAndGroupId(email, groupId);
        if (list != null && !list.isEmpty()) {
            // 存在返回状态码200
            return ResponseEntity.status(HttpStatus.OK).body(true);
        } else {
            // 不存在返回404
            return ResponseEntity.status(HttpStatus.OK).body(false);
        }
    }

    @GetMapping("user/checkusername/{groupid}/{username}")
    public ResponseEntity<?> checkUserByGroupIdAndUsername(@PathVariable(value = "groupid") Integer groupId, @PathVariable(value = "username") String username) {
        List<User> list = userRepository.findUserByGroupIdAndUsername(groupId, username);
        if (list != null && !list.isEmpty()) {// 存在返回状态码200
            return ResponseEntity.status(HttpStatus.OK).body(true);
        } else {

            return ResponseEntity.status(HttpStatus.OK).body(false);
        }

    }

    /**
     * 重置密码，用于找回密码
     */
    @PutMapping("/user/resetpassword")
    public ResponseEntity<?> resetPassword(@RequestBody User user) {
        // 先通过Email和用户组检查用户是否存在
        List<User> list = userRepository.findUserByEmailAndGroupId(user.getEmail(), user.getGroupId());
        if (list != null && !list.isEmpty()) {
            // 如果用户存在，则生成一个6位数的随机字符串，由大写小写字母和数字组成
            String newPassword = RandomStringUtils.randomAlphanumeric(6);
            // 设置Email内容
            String emailSubject = "SEP: Your new password";
            String emailText = "Your new password is: " + newPassword + ".";
            try {
                emailService.sendEMail(user.getEmail(), emailSubject, emailText);
                User resetPasswordUser = list.get(0);
                // 将新生成的密码加密后保存到数据库中
                resetPasswordUser.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(resetPasswordUser);
                // 邮件发送成功返回200
                return ResponseEntity.status(HttpStatus.OK).body(null);
            } catch (Exception e) {
                // 邮件发送失败返回503
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(null);
            }
        } else {
            // 用户不存在返回404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * 通过用户id获取Token
     */
    @GetMapping("/user/token/generate/{userid}")
    public ResponseEntity<String> getTokenByUserId(@PathVariable(name = "userid") Long userId) {
        // 根据用户id检查用户是否存在
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            // 用户存在，生成Token，返回200，并将Token放到Body中
            User user = userOptional.get();
            String token = UserTokenUtil.generateUserToken(user.getId(), user.getFirstname(), user.getLastname(), user.getEmail(), user.getPassword(), user.getGroupId());
            return ResponseEntity.status(HttpStatus.OK).body(token);
        } else {
            // 用户不存在返回404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * 通过Http请求头中的Token获取用户信息
     */
    @GetMapping("/user/token/getuser")
    public ResponseEntity<User> getUserByToken(@RequestHeader("Authorization") String token) {
        // 通过Token获取用户Id
        Long userId = UserTokenUtil.getUserIdByToken(token);
        if (userId != null) {
            // 检查用户id是否存在
            Optional<User> userOptional = userRepository.findById(userId);
            // 用户存在返回200，并把用户信息放在body中
            // 用户不存在返回404
            return userOptional.map(user -> ResponseEntity.status(HttpStatus.OK).body(user)).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
        } else {
            // 用户id不存在返回404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * 根据用户id删除用户
     */
    @DeleteMapping("/user/{userid}")
    public ResponseEntity<?> deleteUserByUserId(@PathVariable(name = "userid") Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            userRepository.deleteById(userId);
            // 删除成功返回200
            return ResponseEntity.status(HttpStatus.OK).body(null);
        } else {
            // 用户id不存在返回404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PutMapping("/user/{currentpassword}/{newpassword}")
    public ResponseEntity<?> changeUserPassword(@PathVariable(name = "currentpassword") String currentPassword, @PathVariable(name = "newpassword") String newPassword, @RequestBody User user) {
        // 检查用户输入的当前密码是否正确
        if (passwordEncoder.matches(currentPassword, user.getPassword())) {
            // 如果正确，加密新密码并保存，返回状态码200
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.OK).body(null);
        } else {
            // 如果不正确，返回状态码401
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @PutMapping("/user/avatar/{userid}")
    public ResponseEntity<User> uploadUserAvatar(@RequestParam("file") MultipartFile multipartFile, @PathVariable(name = "userid") Long userId) {
        if (!multipartFile.isEmpty()) {
            // 查找用户是否存在
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                try {
                    String originalFilename = multipartFile.getOriginalFilename();
                    String filenameExtension;
                    // 如果前端发送来的数据没有原始的文件名，则默认扩展名为png
                    if (originalFilename == null) {
                        filenameExtension = ".png";
                    } else {
                        // 查找文件的扩展名
                        int filenameExtensionIndex = originalFilename.lastIndexOf(".");
                        filenameExtension = originalFilename.substring(filenameExtensionIndex);
                    }
                    // 使用UUID生成唯一文件名
                    String newFilename = UUID.randomUUID() + filenameExtension;
                    File userAvatar = FileUtil.createFile("avatars", newFilename);
                    if (userAvatar != null) {
                        // 将前端发送来的头像文件写入硬盘
                        multipartFile.transferTo(userAvatar);
                        // 将头像路径保存到数据库
                        User user = userOptional.get();
                        user.setAvatarUrl("/avatars/" + newFilename);
                        User newUser = userRepository.save(user);
                        // 如果文件保存成功，返回200，同时将新的用户信息返回
                        return ResponseEntity.status(HttpStatus.OK).body(newUser);
                    } else {
                        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(null);
                    }
                } catch (Exception e) {
                    // 如果文件保存失败，返回503
                    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(null);
                }
            } else {
                // 如果不存在，返回404
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } else {
            // 如果请求中没有文件，返回400
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }


    @GetMapping("/user/getAllUser/{groupid}")
    public ResponseEntity<List<User>> getAllUserByGroupId(@PathVariable(value = "groupid") Integer groupId) {
        List<User> userList = userRepository.findAllByGroupId(1);
        return ResponseEntity.status(HttpStatus.OK).body(userList);
    }

    /**
     * 获取排行榜
     */
    @GetMapping("/user/leaderboard")
    public ResponseEntity<List<User>> getLeaderboard() {
        List<User> leaderboard = userRepository.findAllByOrderByLeaderBoardPunktDesc();
        return new ResponseEntity<>(leaderboard, HttpStatus.OK);
    }

    /**
     * 更新用户积分
     */
    @PutMapping("/user/{userid}/score")
    public ResponseEntity<User> updateLeaderboard(@PathVariable(name = "userid") Long userId, @RequestBody Long newScore) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setLeaderBoardPunkt(newScore);
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.OK).body(user);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PutMapping("/user/updateUserStatus/{currentUserId}/{status}")
    public ResponseEntity<?> updateUserStatus(@PathVariable(value = "currentUserId") Long currentUserId,
                                              @PathVariable(value = "status") Integer status) {
        User user = userRepository.findById(currentUserId).orElse(null);
        if (user != null) {
            // 更新用户状态
            user.setStatus(status);
            System.out.println(user.toString() + status);
            userRepository.save(user);
//            fixed bug
//            return ResponseEntity.ok().body(status);
            return ResponseEntity.ok().body(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
   /* public ResponseEntity<User> updateUserStatus(@PathVariable("userId") Long userId, @RequestBody Map<String, Integer> statusRequest) {
        User updatedUser = userService.updateUserStatus(userId, statusRequest.get("status"));
        return ResponseEntity.ok(updatedUser);
    }*/


    /**
     * Abrufen von Benutzerinformationen anhand der User ID
     *
     * @param userId
     * @return
     */
    @GetMapping("/user/{userid}")
    public ResponseEntity<?> getUserByUserId(@PathVariable(name = "userid") Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {

            return ResponseEntity.status(HttpStatus.OK).body(userOptional);
        } else {
            // Die UserId existiert nicht und gibt 404 zurück
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }


}