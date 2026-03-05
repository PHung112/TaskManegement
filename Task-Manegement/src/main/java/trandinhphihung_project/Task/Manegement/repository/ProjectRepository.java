package trandinhphihung_project.Task.Manegement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import trandinhphihung_project.Task.Manegement.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {
}
