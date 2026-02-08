-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: trustme
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `clausula_tipo_contrato`
--

DROP TABLE IF EXISTS `clausula_tipo_contrato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clausula_tipo_contrato` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contrato_tipo_id` bigint unsigned NOT NULL,
  `clausula_id` bigint unsigned NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clausula_tipo_contrato_contrato_tipo_id_foreign` (`contrato_tipo_id`),
  KEY `clausula_tipo_contrato_clausula_id_foreign` (`clausula_id`),
  CONSTRAINT `clausula_tipo_contrato_clausula_id_foreign` FOREIGN KEY (`clausula_id`) REFERENCES `clausulas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `clausula_tipo_contrato_contrato_tipo_id_foreign` FOREIGN KEY (`contrato_tipo_id`) REFERENCES `contrato_tipos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clausula_tipo_contrato`
--

LOCK TABLES `clausula_tipo_contrato` WRITE;
/*!40000 ALTER TABLE `clausula_tipo_contrato` DISABLE KEYS */;
/*!40000 ALTER TABLE `clausula_tipo_contrato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clausulas`
--

DROP TABLE IF EXISTS `clausulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clausulas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `sexual` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clausulas`
--

LOCK TABLES `clausulas` WRITE;
/*!40000 ALTER TABLE `clausulas` DISABLE KEYS */;
/*!40000 ALTER TABLE `clausulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contacts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','answered','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `admin_response` text COLLATE utf8mb4_unicode_ci,
  `responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
INSERT INTO `contacts` VALUES (1,'darlley Dias','darlley@gmail.com','31983104230','vendas','teste','pending',NULL,NULL,'2025-09-04 02:51:17','2025-09-04 02:51:17'),(2,'darlley Dias','marcio@gmail.com','31983104230','suporte','Teste','pending',NULL,NULL,'2025-09-04 03:38:00','2025-09-04 03:38:00'),(3,'Chesteton','che@gmail.com','31983104230','suporte','teste','pending',NULL,NULL,'2025-09-04 03:44:30','2025-09-04 03:44:30'),(4,'carlos dias','admin@segcond.local','31983104230','parcerias','ASDFASDaSDASd','pending',NULL,NULL,'2025-09-04 03:47:18','2025-09-04 03:47:18'),(5,'darlley Dias','admin@condominio.com','31983104230','suporte','jklhj','pending',NULL,NULL,'2025-09-04 03:50:49','2025-09-04 03:50:49'),(6,'Intermediário','marcio@gmail.com','31983104230','vendas','Mamita','pending',NULL,NULL,'2025-09-04 03:51:48','2025-09-04 03:51:48'),(7,'carlos dias','admin@trustme.com','31983104230','suporte','adfASDASD','pending',NULL,NULL,'2025-09-04 04:02:00','2025-09-04 04:02:00'),(8,'carlos dias','admin@trustme.com','31983104230','suporte','ASDASDASD','pending',NULL,NULL,'2025-09-04 04:03:03','2025-09-04 04:03:03'),(9,'carlos dias','admin@condominio.com','31983104230','suporte','eletrônica como Aldus PageMaker.\n\nPorque nós o usamos?\nÉ um fato conhecido de todos que um leitor se distrairá com o conteúdo de texto legível de uma página quando estiver examinando sua diagramação. A vantagem de usar Lorem Ipsum é que ele tem uma distribuição normal de letras, ao contrário de \"Conteúdo aqui, conteúdo aqui\", fazendo com que ele tenha uma aparência similar a de um texto legível. Muitos softwares de publicação e editores de páginas na internet agora usam Lorem Ipsum como texto-modelo padrão, e uma rápida busca por \'lorem ipsum\' mostra vários websites ainda em sua fase de construção. Várias versões novas surgiram ao longo dos anos, eventualmente por acidente, e às vezes de propósito (injetando humor, e coisas do gênero).\n\n\nDe onde ele vem?\nAo contrário do que se acredita, Lorem Ipsum não é simplesmente um texto randômico. Com mais de 2000 anos, suas raízes podem ser encontradas em uma obra de literatura latina clássica datada de 45 AC. Richard McClintock, um professor de latim do Hampden-Sydney College na Virginia, pesquisou uma das mais obscuras palavras em latim, consectetur, oriunda de uma passagem de Lorem Ipsum, e, procurando por entre citações da palavra na literatura clássica, descobriu a sua indubitável origem. Lorem Ipsum vem das seções 1.10.32 e 1.10.33 do \"de Finibus Bonorum et Malorum\" (Os Extremos do Bem e do Mal), de Cícero, escrito em 45 AC. Este livro é um tratado de teoria da ética muito popular na época da Renascença. A primeira linha de Lorem Ipsum, \"Lorem Ipsum dolor sit amet...\" vem de uma linha na seção 1.10.32.\n\nO trecho padrão original de Lorem Ipsum, usado desde o século XVI, está reproduzido abaixo para os interessados. Seções 1.10.32 e 1.10.33 de \"de Finibus Bonorum et Malorum\" de Cicero também foram reproduzidas abaixo em sua forma exata original, acompanhada das versões para o inglês da tradução feita por H. Rackham em 1914.\n\nOnde posso conseguí-lo?\nExistem muitas variações disponíveis de passagens de Lorem Ipsum, mas a maioria sofreu algum tipo de alteração, seja por inserção de passagens com humor, ou palavras aleatórias que não parecem nem um pouco convincentes. Se você pretende usar uma passagem de Lorem Ipsum, precisa ter certeza de que não há algo embaraçoso escrito escondido no meio do texto. Todos os geradores de Lorem Ipsum na internet tendem a repetir pedaços predefinidos conforme necessário, fazendo deste o primeiro gerador de Lorem Ipsum autêntico da internet. Ele usa um dicionário com mais de 200 palavras em Latim combinado com um punhado de modelos de estrutura de frases para gerar um Lorem Ipsum com aparência razoável, livre de repetições, inserções de humor, palavras não características, etc.\n\n5\n	parágrafos\n	palavras\n	bytes\n	listas\n	Começar com \'Lorem ipsum dolor sit amet...\'','pending',NULL,NULL,'2025-09-04 04:05:10','2025-09-04 04:05:10');
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contrato_clausulas`
--

DROP TABLE IF EXISTS `contrato_clausulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrato_clausulas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contrato_id` bigint unsigned NOT NULL,
  `clausula_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contrato_clausulas_contrato_id_foreign` (`contrato_id`),
  KEY `contrato_clausulas_clausula_id_foreign` (`clausula_id`),
  CONSTRAINT `contrato_clausulas_clausula_id_foreign` FOREIGN KEY (`clausula_id`) REFERENCES `clausulas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contrato_clausulas_contrato_id_foreign` FOREIGN KEY (`contrato_id`) REFERENCES `contratos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrato_clausulas`
--

LOCK TABLES `contrato_clausulas` WRITE;
/*!40000 ALTER TABLE `contrato_clausulas` DISABLE KEYS */;
/*!40000 ALTER TABLE `contrato_clausulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contrato_logs`
--

DROP TABLE IF EXISTS `contrato_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrato_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contrato_id` bigint unsigned NOT NULL,
  `usuario_id` bigint unsigned NOT NULL,
  `tabela` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `coluna` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor_antigo` text COLLATE utf8mb4_unicode_ci,
  `valor_novo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contrato_logs_contrato_id_foreign` (`contrato_id`),
  KEY `contrato_logs_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `contrato_logs_contrato_id_foreign` FOREIGN KEY (`contrato_id`) REFERENCES `contratos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contrato_logs_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrato_logs`
--

LOCK TABLES `contrato_logs` WRITE;
/*!40000 ALTER TABLE `contrato_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `contrato_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contrato_tipos`
--

DROP TABLE IF EXISTS `contrato_tipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrato_tipos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contrato_tipos_codigo_unique` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrato_tipos`
--

LOCK TABLES `contrato_tipos` WRITE;
/*!40000 ALTER TABLE `contrato_tipos` DISABLE KEYS */;
INSERT INTO `contrato_tipos` VALUES (1,'CT001','Contrato de Prestação de Serviços',NULL,'2025-09-04 02:10:28','2025-09-04 02:10:28'),(2,'CT002','Contrato de Trabalho',NULL,'2025-09-04 02:10:28','2025-09-04 02:10:28'),(3,'CT003','Contrato de Compra e Venda',NULL,'2025-09-04 02:10:28','2025-09-04 02:10:28'),(4,'CT004','Contrato de Locação',NULL,'2025-09-04 02:10:28','2025-09-04 02:10:28'),(5,'CT005','Contrato de Parceria',NULL,'2025-09-04 02:10:28','2025-09-04 02:10:28');
/*!40000 ALTER TABLE `contrato_tipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contrato_usuario_clausulas`
--

DROP TABLE IF EXISTS `contrato_usuario_clausulas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrato_usuario_clausulas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contrato_usuario_id` bigint unsigned NOT NULL,
  `contrato_clausula_id` bigint unsigned NOT NULL,
  `aceito` tinyint(1) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contrato_usuario_clausulas_contrato_usuario_id_foreign` (`contrato_usuario_id`),
  KEY `contrato_usuario_clausulas_contrato_clausula_id_foreign` (`contrato_clausula_id`),
  CONSTRAINT `contrato_usuario_clausulas_contrato_clausula_id_foreign` FOREIGN KEY (`contrato_clausula_id`) REFERENCES `contrato_clausulas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contrato_usuario_clausulas_contrato_usuario_id_foreign` FOREIGN KEY (`contrato_usuario_id`) REFERENCES `contrato_usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrato_usuario_clausulas`
--

LOCK TABLES `contrato_usuario_clausulas` WRITE;
/*!40000 ALTER TABLE `contrato_usuario_clausulas` DISABLE KEYS */;
/*!40000 ALTER TABLE `contrato_usuario_clausulas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contrato_usuario_perguntas`
--

DROP TABLE IF EXISTS `contrato_usuario_perguntas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrato_usuario_perguntas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contrato_id` bigint unsigned NOT NULL,
  `pergunta_id` bigint unsigned NOT NULL,
  `usuario_id` bigint unsigned NOT NULL,
  `resposta` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_contrato_pergunta_usuario` (`contrato_id`,`pergunta_id`,`usuario_id`),
  KEY `contrato_usuario_perguntas_pergunta_id_foreign` (`pergunta_id`),
  KEY `contrato_usuario_perguntas_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `contrato_usuario_perguntas_contrato_id_foreign` FOREIGN KEY (`contrato_id`) REFERENCES `contratos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contrato_usuario_perguntas_pergunta_id_foreign` FOREIGN KEY (`pergunta_id`) REFERENCES `perguntas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contrato_usuario_perguntas_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrato_usuario_perguntas`
--

LOCK TABLES `contrato_usuario_perguntas` WRITE;
/*!40000 ALTER TABLE `contrato_usuario_perguntas` DISABLE KEYS */;
/*!40000 ALTER TABLE `contrato_usuario_perguntas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contrato_usuarios`
--

DROP TABLE IF EXISTS `contrato_usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrato_usuarios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contrato_id` bigint unsigned NOT NULL,
  `usuario_id` bigint unsigned NOT NULL,
  `aceito` tinyint(1) DEFAULT NULL,
  `dt_aceito` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contrato_usuarios_contrato_id_foreign` (`contrato_id`),
  KEY `contrato_usuarios_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `contrato_usuarios_contrato_id_foreign` FOREIGN KEY (`contrato_id`) REFERENCES `contratos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contrato_usuarios_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrato_usuarios`
--

LOCK TABLES `contrato_usuarios` WRITE;
/*!40000 ALTER TABLE `contrato_usuarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `contrato_usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contratos`
--

DROP TABLE IF EXISTS `contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contratos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(25) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrato_tipo_id` bigint unsigned NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `contratante_id` bigint unsigned NOT NULL,
  `status` enum('Pendente','Ativo','Concluído','Suspenso','Expirado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendente',
  `duracao` int unsigned NOT NULL,
  `dt_inicio` timestamp NULL DEFAULT NULL,
  `dt_fim` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contratos_contrato_tipo_id_foreign` (`contrato_tipo_id`),
  KEY `contratos_contratante_id_foreign` (`contratante_id`),
  CONSTRAINT `contratos_contratante_id_foreign` FOREIGN KEY (`contratante_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contratos_contrato_tipo_id_foreign` FOREIGN KEY (`contrato_tipo_id`) REFERENCES `contrato_tipos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contratos`
--

LOCK TABLES `contratos` WRITE;
/*!40000 ALTER TABLE `contratos` DISABLE KEYS */;
/*!40000 ALTER TABLE `contratos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` int NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
INSERT INTO `faqs` VALUES (1,'O que é o TrueConnect?','O TrueConnect é uma plataforma de certificação digital que oferece selos de confiança e contratos digitais seguros para empresas de todos os tamanhos.',1,1,'2025-09-04 02:10:27','2025-09-04 02:10:27'),(2,'Como funciona o selo digital?','O selo digital é um certificado que comprova a autenticidade e segurança do seu site ou aplicação, aumentando a confiança dos seus clientes.',2,1,'2025-09-04 02:10:27','2025-09-04 02:10:27'),(3,'Posso cancelar minha assinatura a qualquer momento?','Sim, você pode cancelar sua assinatura a qualquer momento através do painel administrativo ou entrando em contato conosco.',3,1,'2025-09-04 02:10:27','2025-09-04 02:10:27'),(4,'Qual a diferença entre os planos?','Os planos diferem na quantidade de selos e contratos inclusos, além dos recursos disponíveis. O plano Básico oferece 1 selo e 1 contrato, o Intermediário oferece 3 de cada, e o Plus oferece recursos ilimitados.',4,1,'2025-09-04 02:10:27','2025-09-04 02:10:27'),(5,'Como posso integrar o TrueConnect ao meu sistema?','Oferecemos APIs e documentação completa para integração. Clientes do plano Plus têm acesso a APIs personalizadas e suporte técnico especializado.',5,1,'2025-09-04 02:10:27','2025-09-04 02:10:27');
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funcionalidade`
--

DROP TABLE IF EXISTS `funcionalidade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionalidade` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modulo_id` bigint unsigned NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `ordem` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `funcionalidade_modulo_id_foreign` (`modulo_id`),
  CONSTRAINT `funcionalidade_modulo_id_foreign` FOREIGN KEY (`modulo_id`) REFERENCES `modulo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionalidade`
--

LOCK TABLES `funcionalidade` WRITE;
/*!40000 ALTER TABLE `funcionalidade` DISABLE KEYS */;
/*!40000 ALTER TABLE `funcionalidade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo`
--

DROP TABLE IF EXISTS `grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo`
--

LOCK TABLES `grupo` WRITE;
/*!40000 ALTER TABLE `grupo` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo_funcionalidade`
--

DROP TABLE IF EXISTS `grupo_funcionalidade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo_funcionalidade` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `funcionalidade_id` bigint unsigned NOT NULL,
  `grupo_id` bigint unsigned NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grupo_funcionalidade_funcionalidade_id_foreign` (`funcionalidade_id`),
  KEY `grupo_funcionalidade_grupo_id_foreign` (`grupo_id`),
  CONSTRAINT `grupo_funcionalidade_funcionalidade_id_foreign` FOREIGN KEY (`funcionalidade_id`) REFERENCES `funcionalidade` (`id`),
  CONSTRAINT `grupo_funcionalidade_grupo_id_foreign` FOREIGN KEY (`grupo_id`) REFERENCES `grupo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo_funcionalidade`
--

LOCK TABLES `grupo_funcionalidade` WRITE;
/*!40000 ALTER TABLE `grupo_funcionalidade` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupo_funcionalidade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo_usuario`
--

DROP TABLE IF EXISTS `grupo_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo_usuario` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint unsigned NOT NULL,
  `grupo_id` bigint unsigned NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `grupo_usuario_grupo_id_foreign` (`grupo_id`),
  KEY `grupo_usuario_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `grupo_usuario_grupo_id_foreign` FOREIGN KEY (`grupo_id`) REFERENCES `grupo` (`id`),
  CONSTRAINT `grupo_usuario_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo_usuario`
--

LOCK TABLES `grupo_usuario` WRITE;
/*!40000 ALTER TABLE `grupo_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `grupo_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_history`
--

DROP TABLE IF EXISTS `login_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `first_login_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `login_history_user_id_foreign` (`user_id`),
  CONSTRAINT `login_history_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_history`
--

LOCK TABLES `login_history` WRITE;
/*!40000 ALTER TABLE `login_history` DISABLE KEYS */;
INSERT INTO `login_history` VALUES (2,1,'2025-09-04 02:33:36','2026-02-08 04:32:16','2025-09-04 02:33:36','2026-02-08 04:32:16');
/*!40000 ALTER TABLE `login_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2014_10_12_000000_create_users_table',1),(2,'2014_10_12_100000_create_password_reset_tokens_table',1),(3,'2019_08_19_000000_create_failed_jobs_table',1),(4,'2019_12_14_000001_create_personal_access_tokens_table',1),(5,'2024_03_19_000000_create_login_history_table',1),(6,'2024_03_19_000001_create_contrato_tipos_table',1),(7,'2024_03_19_000002_create_selos_table',1),(8,'2025_06_14_123740_create_plans_table',1),(9,'2025_06_14_123741_create_subscriptions_table',1),(10,'2025_06_14_123742_create_faqs_table',1),(11,'2025_06_14_123743_create_contacts_table',1),(12,'2025_06_14_123743_create_testimonials_table',1),(13,'2025_06_14_123744_create_site_settings_table',1),(14,'2025_08_15_124652_add_google_fields_to_users_table',1),(15,'2026_02_06_000621_01_create_seal_types_table',2),(16,'2026_02_06_000621_02_create_user_seals_table',2),(17,'2026_02_06_000621_03_create_seal_requests_table',2),(18,'2026_02_06_000621_04_create_seal_documents_table',2),(19,'2026_02_06_000621_add_servicedesk_role_to_users_table',2),(20,'2025_03_29_000001_create_grupos_table',3),(21,'2025_03_29_000002_create_modulos_table',3),(22,'2025_03_29_000003_create_funcionalidades_table',3),(23,'2025_03_29_000004_create_funcionalidade_grupos_table',3),(24,'2025_03_29_000009_create_grupo_usuarios_table',3),(25,'2025_03_29_000020_create_usuario_selos_table',3),(26,'2025_03_29_000030_create_usuario_conexoes_table',3),(27,'2025_03_29_000050_create_clausulas_table',3),(28,'2025_03_29_000060_create_contratos_table',3),(29,'2025_03_29_000070_create_contrato_logs_table',3),(30,'2025_03_29_000080_create_contrato_usuarios_table',3),(31,'2025_03_29_000090_create_contrato_clausulas_table',3),(32,'2025_03_29_000100_create_contrato_usuario_clausulas_table',3),(33,'2025_03_29_000110_create_clausula_tipo_contrato_table',3),(34,'2025_06_13_225939_create_perguntas_table',3),(35,'2025_06_13_230139_create_contrato_usuario_perguntas_table',3),(36,'2025_06_15_201741_create_usuario_chave_table',3),(37,'2025_09_24_164625_add_fields_to_users',4),(39,'2026_02_07_232457_change_dt_nascimento_to_datetime',5),(40,'2026_02_08_013042_sync_name_and_nome_completo_in_users_table',6),(42,'2026_02_08_013117_keep_only_admin_user',7),(44,'2026_02_08_013735_add_fields_to_selos_table',8),(45,'2026_02_08_022537_restore_app_users_after_admin_cleanup',8);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modulo`
--

DROP TABLE IF EXISTS `modulo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modulo` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `URL` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `caminho_img` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ordem` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modulo`
--

LOCK TABLES `modulo` WRITE;
/*!40000 ALTER TABLE `modulo` DISABLE KEYS */;
/*!40000 ALTER TABLE `modulo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `perguntas`
--

DROP TABLE IF EXISTS `perguntas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `perguntas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contrato_tipo_id` bigint unsigned NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `alternativas` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_alternativa` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `perguntas_contrato_tipo_id_foreign` (`contrato_tipo_id`),
  CONSTRAINT `perguntas_contrato_tipo_id_foreign` FOREIGN KEY (`contrato_tipo_id`) REFERENCES `contrato_tipos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perguntas`
--

LOCK TABLES `perguntas` WRITE;
/*!40000 ALTER TABLE `perguntas` DISABLE KEYS */;
/*!40000 ALTER TABLE `perguntas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',5,'auth_token','16b31227d56d834b5c4a3e56d9393af2059e13c9794a4e70745ddcb767a56ac4','[\"*\"]','2025-09-04 02:16:50',NULL,'2025-09-04 02:13:21','2025-09-04 02:16:50'),(2,'App\\Models\\User',5,'auth_token','7ec3ebbbc447d956c78c9904b87e738e1c4e9ef1ed320609409e239f0d4bf228','[\"*\"]','2025-09-04 02:32:13',NULL,'2025-09-04 02:17:06','2025-09-04 02:32:13'),(3,'App\\Models\\User',1,'auth_token','0920f28c64e8e0b08c6786ed730c2938244a974d663e7036fef2b545e3e6f86a','[\"*\"]','2025-09-04 02:36:55',NULL,'2025-09-04 02:33:36','2025-09-04 02:36:55'),(4,'App\\Models\\User',5,'auth_token','fca94169efa3039a9c566036df2b7d050e9bd970eb12c7b48cd952094a2d82cd','[\"*\"]','2025-09-04 02:38:11',NULL,'2025-09-04 02:37:19','2025-09-04 02:38:11'),(5,'App\\Models\\User',5,'auth_token','913d4e2c75b50d37f58eb01750df77851c7111212ffa57d23dedff08017e64e4','[\"*\"]','2025-09-04 02:38:23',NULL,'2025-09-04 02:38:23','2025-09-04 02:38:23'),(6,'App\\Models\\User',1,'auth_token','4ce39f7014f6fdbace58d78a5129e906298209c60a23f6730d4263f1c8020c94','[\"*\"]','2025-09-04 02:57:25',NULL,'2025-09-04 02:38:36','2025-09-04 02:57:25'),(7,'App\\Models\\User',5,'auth_token','9a9398cb8558722e4faf5f10bd309ef6889fc65b5e1da16a883aaf068f7bed32','[\"*\"]','2025-09-04 02:58:34',NULL,'2025-09-04 02:58:34','2025-09-04 02:58:34'),(8,'App\\Models\\User',1,'auth_token','2fa181b586e943c16c836ef244f157fcaa8791907ec1650e85fefe31ed671581','[\"*\"]','2025-09-04 03:43:10',NULL,'2025-09-04 03:02:45','2025-09-04 03:43:10'),(9,'App\\Models\\User',1,'test','2977c77713fa639a23568f4ad60929af22e73af90d034e299b3549e6a4545eff','[\"*\"]','2025-09-04 03:41:06',NULL,'2025-09-04 03:41:06','2025-09-04 03:41:06'),(10,'App\\Models\\User',5,'auth_token','079fe246070b3053a183f029980e0bf96e56b60b2c0d7e630ad76a5e031269a0','[\"*\"]','2025-09-04 03:44:38',NULL,'2025-09-04 03:43:54','2025-09-04 03:44:38'),(11,'App\\Models\\User',1,'auth_token','1329c75d204d56119b2ec45dbe64349b2e9e68b163be4c3aeba09f68fc482a64','[\"*\"]','2025-09-07 22:16:36',NULL,'2025-09-04 03:44:52','2025-09-07 22:16:36'),(12,'App\\Models\\User',1,'auth_token','97d519cb8afcbaa780df4b8b4b774105577655a0363fbcdfb3fb6a0d1025f45b','[\"*\"]','2025-09-04 03:56:15',NULL,'2025-09-04 03:51:32','2025-09-04 03:56:15'),(13,'App\\Models\\User',1,'test','7e6d19a50c58783d93c463c2fd60c1e1a9c9bdaad4c95e4aada6c6c2b9239c93','[\"*\"]','2025-09-04 03:53:48',NULL,'2025-09-04 03:53:48','2025-09-04 03:53:48'),(14,'App\\Models\\User',1,'auth_token','b8aaa30aa144b67795be1047c4fdf35fc89b43b51820d65c9a16ef07a372c9c0','[\"*\"]','2025-09-04 03:56:54',NULL,'2025-09-04 03:56:45','2025-09-04 03:56:54'),(15,'App\\Models\\User',5,'auth_token','7faadb78e1a8f9930a7c24a59112be5460a4d91f50d120487c006d0599310da2','[\"*\"]','2025-09-04 03:59:02',NULL,'2025-09-04 03:57:54','2025-09-04 03:59:02'),(16,'App\\Models\\User',1,'auth_token','87ad23d7a982d6f9478ca71f44b53e8ff00ab200ea051f9c28b73ac821690de0','[\"*\"]','2025-09-04 04:03:10',NULL,'2025-09-04 04:00:34','2025-09-04 04:03:10'),(17,'App\\Models\\User',1,'auth_token','3ce7b409b12daf0bd04b770dce15d957cd1d82d94fecb411bf9a0a98c756b70a','[\"*\"]','2025-09-07 22:16:48',NULL,'2025-09-07 22:16:48','2025-09-07 22:16:48'),(18,'App\\Models\\User',1,'auth_token','3b1ccb1e0b9238cff3d851bfde6b624adb4b2101222e35c7e6b1b0d86f4d0d0e','[\"*\"]','2026-02-08 05:24:15',NULL,'2026-02-06 05:39:48','2026-02-08 05:24:15'),(19,'App\\Models\\User',5,'auth_token','98263bd3fa92a56a2be87b3304a1f6d70cd7912cd7d5949be6d99258d7575281','[\"*\"]',NULL,NULL,'2026-02-06 06:14:32','2026-02-06 06:14:32'),(20,'App\\Models\\User',5,'auth_token','9b70e8177568e53ebe63396bdafc748f863698e637ef0eaad05fc73777c1e54b','[\"*\"]','2026-02-06 13:50:08',NULL,'2026-02-06 06:14:42','2026-02-06 13:50:08'),(21,'App\\Models\\User',6,'usuarioLogado','3514f1b9e45eabf81d506a5a90a6401dad6f91f83ba7bdf75180f6701f57dcaf','[\"*\"]',NULL,NULL,'2026-02-08 02:27:16','2026-02-08 02:27:16'),(22,'App\\Models\\User',6,'usuarioLogado','0d0f12985b70d29dcf3accb2edeb6d69a3cbae14cd350ec630c7ebb937af4898','[\"*\"]','2026-02-08 03:20:46','2026-02-22 02:27:28','2026-02-08 02:27:28','2026-02-08 03:20:46'),(23,'App\\Models\\User',1,'auth_token','b3a87f5ffad73ce8db96cc6f839bfb3fe767673c2d8167776c9be7d7c0b298d7','[\"*\"]','2026-02-08 04:17:19',NULL,'2026-02-08 03:29:19','2026-02-08 04:17:19'),(24,'App\\Models\\User',6,'usuarioLogado','1abd62452de8fb28533841ffafdf16c697387cb007f1890c1b88318a8af7c23b','[\"*\"]','2026-02-08 03:32:39','2026-02-22 03:32:39','2026-02-08 03:32:39','2026-02-08 03:32:39'),(25,'App\\Models\\User',6,'usuarioLogado','77b4e132b18da5e71d57157ec46ae8142997f925ed101c3aa2d410f79521d2e7','[\"*\"]','2026-02-08 03:49:07','2026-02-22 03:49:07','2026-02-08 03:49:07','2026-02-08 03:49:07'),(26,'App\\Models\\User',1,'auth_token','07bb6ba456fdbfa14823c8d3d8b0c477120ee3f742bed20f8ee9ca1d821d1e2b','[\"*\"]','2026-02-08 05:32:17',NULL,'2026-02-08 04:32:16','2026-02-08 05:32:17');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plans`
--

DROP TABLE IF EXISTS `plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plans` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `monthly_price` decimal(8,2) NOT NULL,
  `semiannual_price` decimal(8,2) NOT NULL,
  `annual_price` decimal(8,2) NOT NULL,
  `seals_limit` int DEFAULT NULL,
  `contracts_limit` int DEFAULT NULL,
  `features` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plans`
--

LOCK TABLES `plans` WRITE;
/*!40000 ALTER TABLE `plans` DISABLE KEYS */;
INSERT INTO `plans` VALUES (1,'Básico','Plano ideal para pequenos negócios que estão começando',29.90,99.90,199.90,1,1,'[\"1 selo digital\", \"1 contrato\", \"Suporte por email\", \"Certificado SSL\", \"Backup automático\"]',1,'2025-09-04 02:10:27','2025-09-04 02:10:27'),(2,'Intermediário','Plano perfeito para empresas em crescimento',49.90,199.90,299.90,3,3,'[\"3 selos digitais\", \"3 contratos\", \"Suporte prioritário\", \"Certificado SSL\", \"Backup automático\", \"Relatórios avançados\"]',1,'2025-09-04 02:10:27','2025-09-04 02:10:27'),(3,'Plus','Plano completo para empresas que precisam de recursos ilimitados',69.90,299.90,499.90,NULL,NULL,'[\"Selos digitais ilimitados\", \"Contratos ilimitados\", \"Suporte 24/7\", \"Certificado SSL\", \"Backup automático\", \"Relatórios avançados\", \"API personalizada\", \"Integração com sistemas\"]',1,'2025-09-04 02:10:27','2025-09-04 02:10:27');
/*!40000 ALTER TABLE `plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seal_documents`
--

DROP TABLE IF EXISTS `seal_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seal_documents` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `seal_request_id` bigint unsigned NOT NULL,
  `document_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `seal_documents_seal_request_id_foreign` (`seal_request_id`),
  CONSTRAINT `seal_documents_seal_request_id_foreign` FOREIGN KEY (`seal_request_id`) REFERENCES `seal_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seal_documents`
--

LOCK TABLES `seal_documents` WRITE;
/*!40000 ALTER TABLE `seal_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `seal_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seal_requests`
--

DROP TABLE IF EXISTS `seal_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seal_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `seal_type_id` bigint unsigned NOT NULL,
  `status` enum('pending','under_review','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `reviewed_by` bigint unsigned DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `seal_requests_user_id_foreign` (`user_id`),
  KEY `seal_requests_seal_type_id_foreign` (`seal_type_id`),
  KEY `seal_requests_reviewed_by_foreign` (`reviewed_by`),
  CONSTRAINT `seal_requests_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `seal_requests_seal_type_id_foreign` FOREIGN KEY (`seal_type_id`) REFERENCES `seal_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `seal_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seal_requests`
--

LOCK TABLES `seal_requests` WRITE;
/*!40000 ALTER TABLE `seal_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `seal_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seal_types`
--

DROP TABLE IF EXISTS `seal_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seal_types` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `requires_manual_approval` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `seal_types_code_unique` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seal_types`
--

LOCK TABLES `seal_types` WRITE;
/*!40000 ALTER TABLE `seal_types` DISABLE KEYS */;
INSERT INTO `seal_types` VALUES (1,'telefone','Telefone/WhatsApp','Validação automática de telefone e WhatsApp',0,1,'2026-02-06 06:07:23','2026-02-06 06:07:23'),(2,'endereco','Endereço','Comprovação de endereço através de documentos',1,1,'2026-02-06 06:07:23','2026-02-06 06:07:23'),(3,'documentos','Documentos (RG/CNH/CTPS/Passaporte)','Validação de documentos de identidade',1,1,'2026-02-06 06:07:23','2026-02-06 06:07:23'),(4,'veiculo','Veículo (CRLV)','Validação de documentação de veículo',1,1,'2026-02-06 06:07:23','2026-02-06 06:07:23'),(5,'irpf','IRPF (Renda)','Comprovação de renda através de IRPF',1,1,'2026-02-06 06:07:23','2026-02-06 06:07:23'),(6,'empresario','Empresário (CNPJ)','Validação de CNPJ e documentação empresarial',1,1,'2026-02-06 06:07:23','2026-02-06 06:07:23');
/*!40000 ALTER TABLE `seal_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `selos`
--

DROP TABLE IF EXISTS `selos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `selos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `validade` int NOT NULL COMMENT 'Validade em dias',
  `documentos_evidencias` json DEFAULT NULL,
  `descricao_como_obter` text COLLATE utf8mb4_unicode_ci,
  `custo_obtencao` decimal(10,2) NOT NULL DEFAULT '0.00',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `selos`
--

LOCK TABLES `selos` WRITE;
/*!40000 ALTER TABLE `selos` DISABLE KEYS */;
INSERT INTO `selos` VALUES (1,'SELO001',NULL,'Selo de Qualidade',365,NULL,NULL,0.00,1,'2026-02-08 04:44:27','2025-09-04 02:10:28','2026-02-08 04:44:27'),(2,'SELO002',NULL,'Selo de Segurança',180,NULL,NULL,0.00,1,'2026-02-08 04:44:30','2025-09-04 02:10:28','2026-02-08 04:44:30'),(3,'SELO003',NULL,'Selo de Conformidade',90,NULL,NULL,0.00,1,'2026-02-08 04:44:32','2025-09-04 02:10:28','2026-02-08 04:44:32'),(4,'SELO004',NULL,'Selo de Excelência',730,NULL,NULL,0.00,1,'2026-02-08 04:44:36','2025-09-04 02:10:28','2026-02-08 04:44:36'),(5,'SELO005',NULL,'Selo de Inovação',365,NULL,NULL,0.00,1,'2026-02-08 04:44:37','2025-09-04 02:10:28','2026-02-08 04:44:37'),(6,'SEL01',NULL,'Verificação de existência de identidade',90,NULL,NULL,0.00,1,NULL,'2026-02-08 05:05:02','2026-02-08 05:05:02'),(7,'SEL02',NULL,'Verificação junto a Secretaria de justiça, através do SERPRO de a CNH existe e se  está válida',90,NULL,NULL,0.00,1,NULL,'2026-02-08 05:07:49','2026-02-08 05:07:49'),(8,'SEL03',NULL,'Verificação de veracidade e validade de Passaporte, bem como nada cosnta para pedidos de recolhimentos com medica cautelar',120,NULL,NULL,0.00,1,NULL,'2026-02-08 05:10:04','2026-02-08 05:10:04');
/*!40000 ALTER TABLE `selos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `group` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_unique` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'site_name','TrueConnect','text','general','2025-09-04 02:10:27','2026-01-14 01:56:30'),(2,'site_slogan','TrueConnect plataforma de certificação digital','text','general','2025-09-04 02:10:27','2026-01-14 01:56:30'),(3,'site_description','Plataforma de certificação digital para relacionamentos seguros','textarea','general','2025-09-04 02:10:27','2025-09-04 02:44:12'),(4,'home.hero_title','Certificação Digital e Contratos Seguros','text','home','2025-09-04 02:10:27','2025-09-04 02:10:27'),(5,'home.hero_subtitle','Aumente a confiança dos seus clientes com nossos selos digitais e contratos seguros','textarea','home','2025-09-04 02:10:27','2025-09-04 02:10:27'),(6,'home.cta_primary_label','Começar Agora','text','home','2025-09-04 02:10:27','2025-09-04 02:10:27'),(7,'home.cta_secondary_label','Ver Planos','text','home','2025-09-04 02:10:28','2025-09-04 02:10:28'),(8,'home.cta_block_title','Pronto para Começar?','text','home','2025-09-04 02:10:28','2025-09-04 02:10:28'),(9,'home.cta_block_subtitle','Junte-se a milhares de pessoas que já confiam no TrueConnect','textarea','home','2025-09-04 02:10:28','2025-09-04 02:49:19'),(10,'about.hero_title','Sobre o TrueConnect','text','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(11,'about.hero_subtitle','Somos uma empresa dedicada a transformar a forma como as equipes colaboram e gerenciam seus projetos, oferecendo soluções inovadoras e confiáveis.','textarea','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(12,'about.mission_title','Nossa Missão','text','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(13,'about.mission_text','Capacitar empresas de todos os tamanhos com ferramentas intuitivas e poderosas que simplificam a gestão de projetos e potencializam a colaboração em equipe.','textarea','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(14,'about.mission_text_2','Acreditamos que a tecnologia deve ser um facilitador, não um obstáculo. Por isso, desenvolvemos soluções que são ao mesmo tempo sofisticadas e fáceis de usar.','textarea','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(15,'about.values_title','Nossos Valores','text','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(16,'about.team_title','Nossa Equipe','text','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(17,'about.team_subtitle','Profissionais apaixonados por tecnologia e dedicados a criar as melhores soluções para nossos clientes.','textarea','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(18,'about.history_title','Nossa História','text','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(19,'about.cta_title','Faça parte da nossa história','text','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(20,'about.cta_subtitle','Junte-se a milhares de empresas que já confiam no TrueConnect para gerenciar seus projetos e alcançar seus objetivos.','textarea','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(21,'about.cta_button','Começar Agora','text','about','2025-09-04 02:10:28','2025-09-04 02:10:28'),(22,'contact_email','contato@TrueConnect.com','text','contact','2025-09-04 02:10:28','2025-09-04 02:10:28'),(23,'contact_phone','(11) 99999-9999','text','contact','2025-09-04 02:10:28','2025-09-04 02:10:28'),(24,'contact_address','Rua das Pedras, 128 - Bairro das canárias -  São João','textarea','contact','2025-09-04 02:10:28','2026-02-08 04:55:21'),(25,'mercado_pago_enabled','1','boolean','payment','2025-09-04 02:10:28','2025-09-04 02:10:28'),(26,'mercado_pago_public_key','','text','payment','2025-09-04 02:10:28','2025-09-04 02:10:28'),(27,'mercado_pago_access_token','','text','payment','2025-09-04 02:10:28','2025-09-04 02:10:28'),(28,'email_notifications_enabled','1','boolean','email','2025-09-04 02:10:28','2025-09-04 02:10:28'),(29,'welcome_email_enabled','1','boolean','email','2025-09-04 02:10:28','2025-09-04 02:10:28'),(30,'meta_keywords','certificação digital, contratos digitais, selo de confiança, segurança digital','textarea','seo','2025-09-04 02:10:28','2025-09-04 02:10:28'),(31,'meta_description','TrueConnect oferece certificação digital e contratos seguros para empresas. Aumente a confiança dos seus clientes com nossos selos digitais.','textarea','seo','2025-09-04 02:10:28','2025-09-04 02:10:28'),(32,'contact_email_primary','oi@TrueConnect.com','text','contact','2025-09-04 02:58:48','2026-02-08 04:55:14'),(33,'contact_email_support','financeiro@TrueConnect.com','text','contact','2025-09-04 02:58:48','2026-02-08 04:55:14'),(34,'contact_phone_primary','3198555555','text','contact','2025-09-04 02:58:48','2025-09-04 04:00:51'),(35,'contact_phone_secondary','111111111111','text','contact','2025-09-04 02:58:48','2025-09-04 03:14:35'),(36,'contact_hours','','textarea','contact','2025-09-04 02:58:48','2025-09-04 03:13:34');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `plan_id` bigint unsigned NOT NULL,
  `billing_cycle` enum('monthly','semiannual','annual') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(8,2) NOT NULL,
  `status` enum('active','inactive','cancelled','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptions_user_id_foreign` (`user_id`),
  KEY `subscriptions_plan_id_foreign` (`plan_id`),
  CONSTRAINT `subscriptions_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int NOT NULL DEFAULT '5',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (1,'João Silva','TechCorp Ltda','O TrueConnect Me dá hoje tranquilidade para estabelecer relações sem medo se desacordos e processos indevidos contra mim',NULL,5,1,'2025-09-04 02:10:27','2026-02-08 04:52:13'),(2,'Maria Santos','Inovação Digital','Excelente plataforma! Faltava mesmo uma forma de ter essa tranquilidade que a plataforma nos trouxe',NULL,5,1,'2025-09-04 02:10:27','2026-02-08 04:52:50'),(3,'Pedro Oliveira','StartupXYZ','Já tive problemas com ex-parceiros e hoje me sinto mais a vontade.',NULL,4,1,'2025-09-04 02:10:27','2026-02-08 04:53:29'),(4,'Ana Costa','E-commerce Plus','Excelente ideia! como foi bom contar com vocês',NULL,5,1,'2025-09-04 02:10:27','2026-02-08 04:54:09');
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_seals`
--

DROP TABLE IF EXISTS `user_seals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_seals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `seal_type_id` bigint unsigned NOT NULL,
  `status` enum('pending','approved','rejected','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` bigint unsigned DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `expires_at` timestamp NULL DEFAULT NULL,
  `validation_data` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_seals_user_id_seal_type_id_unique` (`user_id`,`seal_type_id`),
  KEY `user_seals_seal_type_id_foreign` (`seal_type_id`),
  KEY `user_seals_approved_by_foreign` (`approved_by`),
  CONSTRAINT `user_seals_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `user_seals_seal_type_id_foreign` FOREIGN KEY (`seal_type_id`) REFERENCES `seal_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_seals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_seals`
--

LOCK TABLES `user_seals` WRITE;
/*!40000 ALTER TABLE `user_seals` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_seals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` bigint DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_completo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CPF` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pais` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cep` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cidade` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endereco` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bairro` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endereco_numero` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complemento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profissao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `renda_classe` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dt_nascimento` datetime DEFAULT NULL,
  `caminho_foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','user','servicedesk') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_google_id_unique` (`google_id`),
  UNIQUE KEY `users_codigo_unique` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'Administrador','Administrador',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'admin@trustme.com',NULL,NULL,'2025-09-04 02:10:27','$2y$12$Y9hneKYp8uUiY3KiWUDU3e8fWqjGwbVdJQj99Jmy0p4bNdGD38miW','admin',NULL,'2025-09-04 02:10:27','2026-02-08 04:57:17',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_chave`
--

DROP TABLE IF EXISTS `usuario_chave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_chave` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint unsigned NOT NULL,
  `chave` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_chave_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `usuario_chave_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_chave`
--

LOCK TABLES `usuario_chave` WRITE;
/*!40000 ALTER TABLE `usuario_chave` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_chave` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_conexoes`
--

DROP TABLE IF EXISTS `usuario_conexoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_conexoes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `solicitante_id` bigint unsigned NOT NULL,
  `destinatario_id` bigint unsigned NOT NULL,
  `aceito` tinyint(1) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_conexoes_solicitante_id_foreign` (`solicitante_id`),
  KEY `usuario_conexoes_destinatario_id_foreign` (`destinatario_id`),
  CONSTRAINT `usuario_conexoes_destinatario_id_foreign` FOREIGN KEY (`destinatario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuario_conexoes_solicitante_id_foreign` FOREIGN KEY (`solicitante_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_conexoes`
--

LOCK TABLES `usuario_conexoes` WRITE;
/*!40000 ALTER TABLE `usuario_conexoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_conexoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_selos`
--

DROP TABLE IF EXISTS `usuario_selos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_selos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `selo_id` bigint unsigned NOT NULL,
  `usuario_id` bigint unsigned NOT NULL,
  `verificado` tinyint(1) DEFAULT NULL,
  `obtido_em` timestamp NULL DEFAULT NULL,
  `expira_em` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_selos_selo_id_foreign` (`selo_id`),
  KEY `usuario_selos_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `usuario_selos_selo_id_foreign` FOREIGN KEY (`selo_id`) REFERENCES `selos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuario_selos_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_selos`
--

LOCK TABLES `usuario_selos` WRITE;
/*!40000 ALTER TABLE `usuario_selos` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_selos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-07 23:37:49
