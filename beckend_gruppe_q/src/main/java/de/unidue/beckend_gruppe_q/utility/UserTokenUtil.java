package de.unidue.beckend_gruppe_q.utility;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.Map;

public class UserTokenUtil {
    private static final String TOKEN_KEY = "SEPGruppeQ"; // 用于加密的key

    /**
     * 使用用户id、姓、名字、Email、密码、用户组id生成Token
     */
    public static String generateUserToken(Long id, String firstname, String lastname, String email, String password, Integer groupId) {
        Algorithm generateAlgorithm = Algorithm.HMAC256(TOKEN_KEY);
        Map<String, Object> header = Map.of("typ", "JWT", "alg", "HS256");
        return JWT.create().withHeader(header)
                .withClaim("id", id)
                .withClaim("firstname", firstname)
                .withClaim("lastname", lastname)
                .withClaim("email", email)
                .withClaim("password", password)
                .withClaim("groupId", groupId)
                .sign(generateAlgorithm);
    }

    /**
     * 根据Token获取用户id
     */
    public static Long getUserIdByToken(String token) {
        try {
            Algorithm verifyAlgorithm = Algorithm.HMAC256(TOKEN_KEY);
            // 验证Token
            JWTVerifier verifier = JWT.require(verifyAlgorithm).build();
            // 定义Token解析器
            DecodedJWT decodedJWT = verifier.verify(token);
            // 使用解析器获取Token里面的用户id
            return decodedJWT.getClaim("id").asLong();
        } catch (Exception e) {
            // Token验证失败
            return null;
        }
    }
}
