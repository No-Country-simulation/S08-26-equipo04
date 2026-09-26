package com.qualitytrack.eurekaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;


@SpringBootApplication
@EnableEurekaServer
public class EurekaSvApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaSvApplication.class, args);
    }

}