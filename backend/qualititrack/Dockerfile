# ==========================================
# Stage 1: Build the application using Maven
# ==========================================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the pom.xml and the source code into the build container
# (The '.' refers to the root of your backend folder)
COPY pom.xml .
COPY src ./src

# Package the application into a .jar file, skipping tests to speed up the deploy
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Create a lightweight runtime image
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the compiled .jar file from the build stage
# We use a wildcard (*.jar) so you don't have to hardcode the exact 
# version name (like qualititrack-0.0.1-SNAPSHOT.jar) from your pom.xml
COPY --from=build /app/target/*.jar app.jar

# Expose the standard port (Render will override this dynamically)
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]