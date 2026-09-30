package com.qualitytrack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.qualitytrack.modelos.Cliente;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente>findByEmail(String email);
    Optional<Cliente>findByEmailAndIdNot(String email, Long id);
    Optional<Cliente> findByCuit(String cuit);
}
