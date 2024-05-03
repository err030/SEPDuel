package de.unidue.backend.restcontroller;

import de.unidue.backend.repository.SecurityCodeRepository;
import de.unidue.backend.repository.UserRepository;
import de.unidue.backend.service.EmailService;
import de.unidue.backend.table.SecurityCode;
import de.unidue.backend.table.User;
import de.unidue.backend.utility.UserTokenUtil;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@CrossOrigin
@RestController
public class UserController {
    final UserRepository userRepository;
    final SecurityCodeRepository securityCodeRepository;
    final EmailService emailService;

    final BCryptPasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, SecurityCodeRepository securityCodeRepository, EmailService emailService, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.securityCodeRepository = securityCodeRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 添加新用户，该方法用于注册
     */
    @PostMapping("/user")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        // 先检查新用户的Email在同一个用户组里是否已经被注册了
        // 目前的设定是同一个用户组里面Email必须是唯一的，但是一个Email可以注册为普通用户和管理员
        List<User> list = userRepository.findUserByEmailAndGroupId(user.getEmail(), user.getGroupId());
        if (list != null && !list.isEmpty()) {
            // 如果Email在同一个用户组里已经被注册了，返回状态码409
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } else {
            // 如果Email还没有注册，则先把密码进行加密
            user.setPasswort(passwordEncoder.encode(user.getPasswort()));
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
            if (passwordEncoder.matches(password, userByEmailAndGroupId.get(0).getPasswort())) {
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
    public ResponseEntity<SecurityCode> getSecurityCode(@PathVariable(value = "userid") Long userId) {
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
            String emailSubject = "SEP: Ihr Sicherheitscode";
            String emailText = "Ihr Sicherheitscode lautet: " + code + ", der gültig bis " + format.format(expirationTime) + " ist. Geben Sie diesen Code nicht weiter.";
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
            return ResponseEntity.status(HttpStatus.OK).body(null);
        } else {
            // 不存在返回404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
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
            String emailSubject = "SEP: Ihr neues Passwort";
            String emailText = "Ihr neues Passwort lautet: " + newPassword + ".";
            try {
                emailService.sendEMail(user.getEmail(), emailSubject, emailText);
                User resetPasswordUser = list.get(0);
                // 将新生成的密码加密后保存到数据库中
                resetPasswordUser.setPasswort(passwordEncoder.encode(newPassword));
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
            String token = UserTokenUtil.generateUserToken(user.getId(), user.getVorname(), user.getNachname(), user.getEmail(), user.getPasswort(), user.getGroupId());
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
}
