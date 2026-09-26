package com.qualitytrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MsBusinessApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsBusinessApplication.class, args);
	}

}
