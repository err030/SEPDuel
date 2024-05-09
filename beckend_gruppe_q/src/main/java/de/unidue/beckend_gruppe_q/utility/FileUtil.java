package de.unidue.beckend_gruppe_q.utility;

import org.springframework.util.ResourceUtils;

import java.io.File;

public class FileUtil {
    /**
     * 创建文件
     */
    public static File createFile(String directory, String filename) {
        try {
            // 获取后端项目路径
            File path = new File(ResourceUtils.getURL("classpath:").getPath());
            // 如果不存在，则创建一个新的
            if (!path.exists()) path = new File("");
            // 在static的文件夹directory里查找文件
            File file = new File(path.getAbsolutePath(), "static/" + directory + "/" + filename);
            if (!file.exists()) {
                // 如果文件不存在，则生成新的
                boolean mkdirs = file.mkdirs();
                // 如果文件创建失败，返回null
                if (!mkdirs) return null;
            }
            return file;
        } catch (Exception e) {
            return null;
        }
    }
}
