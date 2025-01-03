CREATE DATABASE  IF NOT EXISTS `privatetutorapp` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `privatetutorapp`;
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
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher` (
  `id` varchar(50) NOT NULL,
  `firstName` varchar(50) DEFAULT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `userName` varchar(30) DEFAULT NULL,
  `password` varchar(20) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `addressLine1` varchar(100) DEFAULT NULL,
  `addressCity` varchar(50) DEFAULT NULL,
  `addressState` varchar(50) DEFAULT NULL,
  `pinCode` int DEFAULT NULL,
  `profilePicUrl` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `upiId` varchar(30) DEFAULT NULL,
  `accountNumber` varchar(20) DEFAULT NULL,
  `accountName` varchar(50) DEFAULT NULL,
  `ifscCode` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

LOCK TABLES `teacher` WRITE;
/*!40000 ALTER TABLE `teacher` DISABLE KEYS */;
INSERT INTO `teacher` VALUES ('660f9400-f39b-52e5-b827-557766551111','Sangeetha','Santhoosh','sangeetha.s','securepass456',28,'female','456 Elm Street','Newcity','Newstate',654321,'http://example.com/sangeetha_profile.jpg','sangeetha.s@example.com','9876543210','sangeetha@upi','9876543210','Sangeetha Santhoosh','IFSC9876543'),('770f9411-f49c-63f6-c938-667877661222','Arjun','Krishna','arjun.k','mypassword123',32,'male','789 Maple Avenue','Oldtown','Oldstate',987654,'http://example.com/arjun_profile.jpg','arjun.k@example.com','8765432190','arjun@upi','8765432190','Arjun Krishna','IFSC8765432'),('880g9522-g59d-74g7-d049-778988772333','Priya','Mehta','priya.m','secure456pass',25,'female','123 Oak Street','Smallville','Midstate',456789,'http://example.com/priya_profile.jpg','priya.m@example.com','7654321980','priya@upi','7654321980','Priya Mehta','IFSC7654321'),('990h9633-h69e-85h8-e150-889099883444','Rahul','Sharma','rahul.s','pass789secure',29,'male','101 Pine Boulevard','Bigcity','Weststate',321456,'http://example.com/rahul_profile.jpg','rahul.s@example.com','6543219870','rahul@upi','6543219870','Rahul Sharma','IFSC6543210'),('AA1i0744-i79f-96i9-f261-990100994555','Anjali','Verma','anjali.v','strongpass123',27,'female','202 Birch Lane','Metropolis','Eaststate',789123,'http://example.com/anjali_profile.jpg','anjali.v@example.com','5432108760','anjali@upi','5432108760','Anjali Verma','IFSC5432109');
/*!40000 ALTER TABLE `teacher` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-03 15:29:44
