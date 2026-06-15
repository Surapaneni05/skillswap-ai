package com.skillswap.repository;

import com.skillswap.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByUserId(Long userId);

    List<Skill> findByUserIdAndType(Long userId, Skill.SkillType type);

    @Query("SELECT s FROM Skill s WHERE s.user.isActive = true AND " +
           "LOWER(s.skillName) LIKE LOWER(CONCAT('%', :skill, '%'))")
    List<Skill> findBySkillNameContaining(@Param("skill") String skill);

    @Query("SELECT s FROM Skill s WHERE s.user.id != :userId AND " +
           "s.type = 'OFFERED' AND s.user.isActive = true AND " +
           "LOWER(s.skillName) IN :wantedSkills")
    List<Skill> findPotentialMatches(@Param("userId") Long userId,
                                     @Param("wantedSkills") List<String> wantedSkills);

    @Query("SELECT DISTINCT s.skillName, COUNT(s) as cnt FROM Skill s " +
           "GROUP BY s.skillName ORDER BY cnt DESC")
    List<Object[]> findTopSkills();

    void deleteByUserId(Long userId);
}
