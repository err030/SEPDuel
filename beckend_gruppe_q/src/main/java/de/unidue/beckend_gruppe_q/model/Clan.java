package de.unidue.beckend_gruppe_q.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Clan {
    @OneToMany(fetch = FetchType.EAGER)
    public List<User> users = new ArrayList<>();
    @Id
    @GeneratedValue
    private Long id;
    private String name;
}
