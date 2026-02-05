# ETAPA 1: Build (Compilar o Java)
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
# Baixa as dependências (para o cache ficar rápido)
RUN mvn dependency:go-offline
COPY src ./src
# Compila o projeto e gera o .jar (pula testes para ser mais rápido)
RUN mvn clean package -DskipTests

# ETAPA 2: Run (Rodar o Sistema)
FROM openjdk:17-jdk-alpine
WORKDIR /app
# Copia apenas o arquivo .jar gerado na etapa anterior
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]