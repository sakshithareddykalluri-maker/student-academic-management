# Multi-stage build for Smart Academic System Backend
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
VOLUME /tmp
COPY --from=build /app/target/smart-academic-system-backend-1.0.0.jar app.jar

ENV PORT=8080 \
    DB_HOST=localhost \
    DB_PORT=3306 \
    DB_NAME=smart_academic_db \
    DB_USERNAME=root \
    DB_PASSWORD=root

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
