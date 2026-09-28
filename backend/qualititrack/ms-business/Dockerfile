FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /build

RUN rm -rf /root/.m2/repository
COPY . .
RUN mvn -B -pl ms-business -am -DskipTests clean package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/ms-business/target/ms-business-*.jar app.jar
EXPOSE 8082
ENV JAVA_TOOL_OPTIONS="-Xmx256m -Xms128m"
ENTRYPOINT ["java", "-jar", "app.jar"]