package com.qualitytrack.repository;

import com.qualitytrack.modelos.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente>findByEmail(String email);
    Optional<Cliente>findByEmailAndIdNot(String email, Long id);
}
