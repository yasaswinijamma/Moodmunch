// src/main/java/com/example/moodmunch/config/SecurityConfig.java
package com.example.moodmunch.config;

import com.example.moodmunch.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserService userService;

    public SecurityConfig(UserService userService) {
        this.userService = userService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Add /api/local-flavor to the list of permitted endpoints
                        .requestMatchers("/api/register", "/api/login", "/api/home", "/api/recipes/**", "/api/random-spin", "/api/local-flavor").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/favorites", "/api/shopping-list", "/api/meal-planner", "/api/users/profile", "/api/check-session").authenticated()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginProcessingUrl("/api/login")
                        .usernameParameter("username")
                        .passwordParameter("password")
                        .successHandler((req, res, auth) -> {
                            String sessionId = req.getSession(true).getId();
                            System.out.println("Login successful for: " + auth.getName() +
                                    ", Session ID: " + sessionId +
                                    ", Cookies sent: " + req.getHeader("Cookie"));
                            res.setStatus(HttpServletResponse.SC_OK);
                            res.setContentType("text/plain");
                            res.getWriter().write("Login successful");
                            System.out.println("Response headers: " + res.getHeaderNames());
                            System.out.println("Set-Cookie header: " + res.getHeader("Set-Cookie"));
                        })
                        .failureHandler((req, res, ex) -> {
                            System.out.println("Login failed: " + ex.getMessage());
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("text/plain");
                            res.getWriter().write("Login failed");
                        })
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/api/logout")
                        .logoutSuccessHandler((req, res, auth) -> {
                            System.out.println("Logout successful for session: " + (req.getSession(false) != null ? req.getSession(false).getId() : "none"));
                            res.setStatus(HttpServletResponse.SC_OK);
                            res.setContentType("text/plain");
                            res.getWriter().write("Logout successful");
                        })
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )
                .sessionManagement(session -> session
                        .sessionFixation().migrateSession()
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .maximumSessions(1)
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, authEx) -> {
                            String sessionId = req.getSession(false) != null ? req.getSession(false).getId() : "none";
                            System.out.println("Unauthorized request: " + req.getRequestURI() +
                                    ", Session ID: " + sessionId +
                                    ", Cookies received: " + req.getHeader("Cookie"));
                            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            res.setContentType("text/plain");
                            res.getWriter().write("Unauthorized - please log in");
                        })
                )
                .addFilterBefore(new Filter() {
                    @Override
                    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
                            throws IOException, ServletException {
                        HttpServletRequest request = (HttpServletRequest) req;
                        System.out.println("Incoming request: " + request.getRequestURI() +
                                ", Session: " + (request.getSession(false) != null ? request.getSession(false).getId() : "none") +
                                ", Cookies: " + request.getHeader("Cookie"));
                        chain.doFilter(req, res);
                    }
                }, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Set-Cookie"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            com.example.moodmunch.model.User user = userService.getProfile(username);
            if (user == null) {
                throw new UsernameNotFoundException("User not found: " + username);
            }
            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getUsername())
                    .password(user.getPassword())
                    .roles(user.getRole())
                    .build();
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}