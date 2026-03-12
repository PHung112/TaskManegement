package trandinhphihung_project.Task.Manegement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TaskManegementApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskManegementApplication.class, args);
	}

}
