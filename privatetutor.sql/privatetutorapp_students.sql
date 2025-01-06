-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: privatetutorapp
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` char(36) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `addressLine1` varchar(255) NOT NULL,
  `addressCity` varchar(100) DEFAULT NULL,
  `addressState` varchar(100) DEFAULT NULL,
  `pinCode` int NOT NULL,
  `profilePicUrl` varchar(2048) DEFAULT NULL,
  `gender` enum('male','female','do not disclose') NOT NULL,
  `parent1Name` varchar(100) NOT NULL,
  `parent1Phone` char(10) NOT NULL,
  `parent1Email` varchar(255) DEFAULT NULL,
  `parent2Name` varchar(100) DEFAULT NULL,
  `parent2Phone` char(10) NOT NULL,
  `parent2Email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('f47ac10b-58cc-4372-a567-0e02b2c3d479','Jane','Doe',16,'456 Elm St','Othertown','Otherstate',654321,'http://example.com/profile1.jpg','female','John Doe','9876543210','john.doe@example.com','Mary Doe','0123456789','mary.doe@example.com'),('f47ac10b-58cc-4372-a567-0e02b2c3d480','John','Smith',17,'789 Oak St','Newville','Stateland',123456,'http://example.com/profile2.jpg','male','Robert Smith','9876543221','robert.smith@example.com','Sara Smith','0123456790','sara.smith@example.com'),('f47ac10b-58cc-4372-a567-0e02b2c3d481','Alice','Johnson',15,'123 Maple St','Oldtown','Regionstate',234567,'http://example.com/profile3.jpg','female','David Johnson','9876543232','david.johnson@example.com','Emma Johnson','0123456791','emma.johnson@example.com'),('f47ac10b-58cc-4372-a567-0e02b2c3d482','Michael','Brown',18,'321 Pine St','Middletown','Foreststate',345678,'http://example.com/profile4.jpg','male','Henry Brown','9876543243','henry.brown@example.com','Olivia Brown','0123456792','olivia.brown@example.com'),('f47ac10b-58cc-4372-a567-0e02b2c3d483','Emma','Davis',16,'654 Cedar St','Littletown','Hillstate',456789,'http://example.com/profile5.jpg','female','George Davis','9876543254','george.davis@example.com','Sophia Davis','0123456793','sophia.davis@example.com');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-03 19:21:55
