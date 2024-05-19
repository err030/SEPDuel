package de.unidue.beckend_gruppe_q.controller;


import de.unidue.beckend_gruppe_q.model.*;
import de.unidue.beckend_gruppe_q.service.EmailService;
import de.unidue.beckend_gruppe_q.repository.SecurityCodeRepository;
import de.unidue.beckend_gruppe_q.repository.UserRepository;
import de.unidue.beckend_gruppe_q.utility.FileUtil;
import de.unidue.beckend_gruppe_q.utility.UserTokenUtil;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;
import java.nio.file.Path;
import java.nio.file.Paths;

