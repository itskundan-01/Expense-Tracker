# Build stage
FROM maven:3.8.4-openjdk-17 AS build

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:17-jre-slim

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN addgroup --system spring && adduser --system --group spring

# Set working directory
WORKDIR /app

# Create directory for H2 database files and logs
RUN mkdir -p /app/data /app/logs && chown -R spring:spring /app

# Copy jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Copy environment file (optional - can be overridden by docker run -e)
COPY .env.production .env

# Change ownership of the app directory
RUN chown -R spring:spring /app

# Switch to non-root user
USER spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application with JVM optimizations
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Xms256m", "-Xmx512m", "-XX:+UseContainerSupport", "-jar", "app.jar"]