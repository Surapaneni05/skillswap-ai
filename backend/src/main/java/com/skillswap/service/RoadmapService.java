package com.skillswap.service;

import com.skillswap.dto.*;
import com.skillswap.entity.*;
import com.skillswap.exception.*;
import com.skillswap.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapService {

    private final CareerRoadmapRepository roadmapRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String openaiUrl;

    @Value("${openai.api.model:gpt-4o}")
    private String model;

    @Transactional
    public Map<String, Object> generateRoadmap(String email, RoadmapRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> roadmapData;

        if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            roadmapData = generateWithOpenAI(request);
        } else {
            roadmapData = generateFallbackRoadmap(request);
        }

        try {
            CareerRoadmap roadmap = CareerRoadmap.builder()
                    .user(user)
                    .targetRole(request.getTargetRole())
                    .currentSkills(request.getCurrentSkills())
                    .experienceLevel(request.getExperienceLevel())
                    .timeAvailable(request.getTimeAvailable())
                    .roadmapJson(objectMapper.writeValueAsString(roadmapData))
                    .build();
            roadmapRepository.save(roadmap);
        } catch (Exception e) {
            log.error("Failed to persist roadmap", e);
        }

        return roadmapData;
    }

    private Map<String, Object> generateWithOpenAI(RoadmapRequest request) {
        String prompt = buildPrompt(request);
        try {
            OkHttpClient client = new OkHttpClient();
            String requestBody = objectMapper.writeValueAsString(Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role", "system", "content",
                        "You are a career advisor AI. Generate detailed career roadmaps in JSON format."),
                    Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7,
                "max_tokens", 2000
            ));

            Request httpRequest = new Request.Builder()
                    .url(openaiUrl)
                    .post(RequestBody.create(requestBody, MediaType.get("application/json")))
                    .addHeader("Authorization", "Bearer " + openaiApiKey)
                    .addHeader("Content-Type", "application/json")
                    .build();

            try (Response response = client.newCall(httpRequest).execute()) {
                String responseBody = response.body().string();
                Map<String, Object> parsed = objectMapper.readValue(responseBody, Map.class);
                List choices = (List) parsed.get("choices");
                Map choice = (Map) choices.get(0);
                Map message = (Map) choice.get("message");
                String content = (String) message.get("content");
                // Extract JSON from content
                int start = content.indexOf("{");
                int end = content.lastIndexOf("}") + 1;
                if (start >= 0 && end > start) {
                    return objectMapper.readValue(content.substring(start, end), Map.class);
                }
            }
        } catch (Exception e) {
            log.error("OpenAI call failed, falling back: {}", e.getMessage());
        }
        return generateFallbackRoadmap(request);
    }

    private String buildPrompt(RoadmapRequest request) {
        return String.format(
            "Create a career roadmap for someone who wants to become a %s. " +
            "Current skills: %s. Experience level: %s. Time available: %s per week. " +
            "Return a JSON with this structure: { \"title\": \"...\", \"summary\": \"...\", " +
            "\"months\": [{\"month\": 1, \"title\": \"...\", \"topics\": [...], \"projects\": [...]}], " +
            "\"certifications\": [...], \"interviewPrep\": [...], \"weeklyPlan\": \"...\" }",
            request.getTargetRole(), request.getCurrentSkills(),
            request.getExperienceLevel(), request.getTimeAvailable()
        );
    }

    private Map<String, Object> generateFallbackRoadmap(RoadmapRequest request) {
        String role = request.getTargetRole();
        List<Map<String, Object>> months = getRoleMonths(role);

        return Map.of(
            "title", "Road to " + role,
            "summary", "A comprehensive " + months.size() + "-month roadmap to become a " + role,
            "months", months,
            "certifications", getCertifications(role),
            "interviewPrep", List.of("Data Structures & Algorithms", "System Design", "Behavioral Questions",
                "Mock Interviews", "LeetCode Practice"),
            "weeklyPlan", "10-15 hours/week of focused learning",
            "generatedBy", "Rule-based engine (add OpenAI key for AI-powered roadmaps)"
        );
    }

    private List<Map<String, Object>> getRoleMonths(String role) {
        String roleLower = role.toLowerCase();
        if (roleLower.contains("full stack")) {
            return List.of(
                Map.of("month", 1, "title", "Web Foundations", "topics", List.of("HTML5", "CSS3", "JavaScript ES6+"), "projects", List.of("Portfolio Website")),
                Map.of("month", 2, "title", "Frontend Framework", "topics", List.of("React.js", "Tailwind CSS", "Axios"), "projects", List.of("Todo App", "Weather App")),
                Map.of("month", 3, "title", "Backend Development", "topics", List.of("Node.js/Spring Boot", "REST APIs", "JWT Auth"), "projects", List.of("REST API Server")),
                Map.of("month", 4, "title", "Database & DevOps", "topics", List.of("MySQL", "MongoDB", "Docker"), "projects", List.of("Full Stack CRUD App")),
                Map.of("month", 5, "title", "Deployment & Cloud", "topics", List.of("AWS/Render", "CI/CD", "Nginx"), "projects", List.of("Deploy Full App")),
                Map.of("month", 6, "title", "Interview Prep", "topics", List.of("DSA", "System Design", "Mock Interviews"), "projects", List.of("Capstone Project"))
            );
        } else if (roleLower.contains("data scientist") || roleLower.contains("data science")) {
            return List.of(
                Map.of("month", 1, "title", "Python & Math", "topics", List.of("Python", "NumPy", "Linear Algebra", "Statistics"), "projects", List.of("Exploratory Data Analysis")),
                Map.of("month", 2, "title", "Data Analysis", "topics", List.of("Pandas", "Matplotlib", "Seaborn"), "projects", List.of("EDA on Real Dataset")),
                Map.of("month", 3, "title", "Machine Learning", "topics", List.of("Scikit-learn", "Regression", "Classification"), "projects", List.of("Prediction Model")),
                Map.of("month", 4, "title", "Deep Learning", "topics", List.of("TensorFlow/PyTorch", "Neural Networks", "CNNs"), "projects", List.of("Image Classifier")),
                Map.of("month", 5, "title", "Big Data & Cloud", "topics", List.of("Spark", "SQL", "AWS SageMaker"), "projects", List.of("End-to-End ML Pipeline")),
                Map.of("month", 6, "title", "Portfolio & Jobs", "topics", List.of("Kaggle", "GitHub", "Interviews"), "projects", List.of("Kaggle Competition"))
            );
        } else if (roleLower.contains("devops")) {
            return List.of(
                Map.of("month", 1, "title", "Linux & Scripting", "topics", List.of("Linux", "Bash", "Python Scripting"), "projects", List.of("Automate system tasks")),
                Map.of("month", 2, "title", "Containers", "topics", List.of("Docker", "Docker Compose"), "projects", List.of("Containerize an app")),
                Map.of("month", 3, "title", "Orchestration", "topics", List.of("Kubernetes", "Helm"), "projects", List.of("K8s Deployment")),
                Map.of("month", 4, "title", "CI/CD", "topics", List.of("GitHub Actions", "Jenkins", "GitLab CI"), "projects", List.of("Automated Pipeline")),
                Map.of("month", 5, "title", "Cloud & IaC", "topics", List.of("AWS/GCP", "Terraform", "Ansible"), "projects", List.of("Infrastructure as Code")),
                Map.of("month", 6, "title", "Monitoring", "topics", List.of("Prometheus", "Grafana", "ELK Stack"), "projects", List.of("Monitoring Dashboard"))
            );
        } else {
            return List.of(
                Map.of("month", 1, "title", "Fundamentals", "topics", List.of("Core Concepts", "Tools Setup", "Best Practices"), "projects", List.of("Hello World Project")),
                Map.of("month", 2, "title", "Intermediate Skills", "topics", List.of("Advanced Topics", "Frameworks"), "projects", List.of("Mini Project")),
                Map.of("month", 3, "title", "Practical Application", "topics", List.of("Real-world Patterns", "Testing"), "projects", List.of("Feature-rich App")),
                Map.of("month", 4, "title", "Specialization", "topics", List.of("Domain Expertise", "Performance"), "projects", List.of("Portfolio Project")),
                Map.of("month", 5, "title", "Industry Readiness", "topics", List.of("Agile/Scrum", "Code Review"), "projects", List.of("Team Project")),
                Map.of("month", 6, "title", "Job Preparation", "topics", List.of("Resume", "Interviews", "Networking"), "projects", List.of("Open Source Contribution"))
            );
        }
    }

    private List<String> getCertifications(String role) {
        String roleLower = role.toLowerCase();
        if (roleLower.contains("cloud") || roleLower.contains("devops")) {
            return List.of("AWS Solutions Architect", "CKA (Kubernetes)", "Terraform Associate");
        } else if (roleLower.contains("data") || roleLower.contains("ml")) {
            return List.of("Google Data Analytics", "AWS ML Specialty", "TensorFlow Developer");
        } else {
            return List.of("Relevant Online Certification", "GitHub Professional", "Industry-specific cert");
        }
    }
}
