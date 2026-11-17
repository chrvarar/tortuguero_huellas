/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.16-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: vitalink_demo
-- ------------------------------------------------------
-- Server version	10.11.16-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adoption_profiles`
--

DROP TABLE IF EXISTS `adoption_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `adoption_profiles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `animal_id` int(10) unsigned NOT NULL,
  `shelter_name` varchar(120) NOT NULL,
  `age_label` varchar(80) NOT NULL,
  `story` text NOT NULL,
  `published` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `is_demo` tinyint(3) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `animal_id` (`animal_id`),
  CONSTRAINT `adoption_profiles_animal_id_foreign` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adoption_profiles`
--

LOCK TABLES `adoption_profiles` WRITE;
/*!40000 ALTER TABLE `adoption_profiles` DISABLE KEYS */;
INSERT INTO `adoption_profiles` VALUES
(1,3,'Albergue de demostración','2 años · noble y leal','Historia de rescate (demo): Mora fue encontrada bajo un puente peatonal en Catedral después de un fuerte aguacero, buscando comida y refugio. Con atención veterinaria y cariño recuperó toda su alegría. Hoy luce su collar verde con orgullo y sueña con una familia que la lleve a caminar cada tarde.',1,1),
(2,7,'Albergue de demostración','4 meses · dócil y protector','Historia de rescate (demo): Bruno llegó al albergue desde Catedral siendo muy pequeño y tímido, pero en pocas semanas se volvió un cachorro atento y muy dócil. Le gusta sentarse tranquilo a escuchar a las personas y esperar pacientemente su premio.',1,1),
(8,14,'Albergue de demostración','2 años · alegre y energético','Historia de rescate (demo): A Zorro lo rescataron cerca de un parque en el distrito Carmen mientras seguía a los transeúntes moviendo su cola esponjosa. Es un compañero vivaz de pelaje rojizo que disfruta jugar al aire libre y recibir caricias después de cada paseo.',1,1),
(9,15,'Albergue de demostración','5 meses · juguetón y fiel','Historia de rescate (demo): Lucas apareció solito cerca de una cancha en Zapote cuando apenas tenía tres meses. Fue resguardado de inmediato y ya cuenta con sus vacunas al día. Le encanta correr tras pelotas suaves y quedarse dormido junto a quien lo cuida.',1,1),
(10,16,'Albergue de demostración','4 meses · tierno y curioso','Historia de rescate (demo): Oso fue rescatado junto a su camada en un lote baldío de Catedral. Este cachorrito de pelaje oscuro y patitas color fuego observa todo con curiosidad y adora explorar jardines tranquilos antes de acurrucarse en una cobija tibia.',1,1),
(11,17,'Albergue de demostración','3 años · sociable y aventurero','Historia de rescate (demo): Pirata, distinguido por la mancha canela en su ojito, sobrevivió varios meses en calles del Carmen hasta que una vecina avisó al albergue. Es muy sociable con personas y disfruta pasear con correa bajo el sol de la mañana.',1,1),
(12,18,'Albergue de demostración','1 año · dulce y afectuosa','Historia de rescate (demo): Miel fue encontrada desorientada y con su pelaje rizado enredado tras una tormenta en Zapote. Después de un baño tibio y revisión veterinaria, mostró su carácter sumamente tierno. Busca un hogar sereno donde compartir siestas sobre el césped.',1,1),
(13,19,'Albergue de demostración','4 años · sereno y compañero','Historia de rescate (demo): Barón fue abandonado frente a un portón en el distrito Carmen, donde esperó en calma hasta ser auxiliado. Es un perro adulto de porte noble que cruza sus patitas para descansar y resulta ideal para una familia que busque paz y lealtad.',1,1),
(14,20,'Albergue de demostración','3 meses · curioso y cariñoso','Historia de rescate (demo): Pecas, llamado así por las simpáticas manchitas de su hocico y sus patas blancas, fue hallado dentro de una caja en Zapote. Hoy crece sano y fuerte, siempre dispuesto a jugar en el patio y regalar lamidas de cariño.',1,1),
(15,21,'Albergue de demostración','3 meses · valiente y mimoso','Historia de rescate (demo): Roco apareció buscando abrigo cerca de una parada de autobús en Catedral. Aunque era el más pequeñito del grupo, demostró una valentía enorme al recuperarse por completo. Hoy espera una familia que lo vea crecer con amor.',1,1);
/*!40000 ALTER TABLE `adoption_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adoption_requests`
--

DROP TABLE IF EXISTS `adoption_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `adoption_requests` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `profile_id` int(10) unsigned NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(254) NOT NULL,
  `phone` varchar(40) DEFAULT NULL,
  `message` text NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adoption_requests_profile_id_foreign` (`profile_id`),
  CONSTRAINT `adoption_requests_profile_id_foreign` FOREIGN KEY (`profile_id`) REFERENCES `adoption_profiles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adoption_requests`
--

LOCK TABLES `adoption_requests` WRITE;
/*!40000 ALTER TABLE `adoption_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `adoption_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `animal_reports`
--

DROP TABLE IF EXISTS `animal_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `animal_reports` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `kind` enum('hallazgo','extravio') NOT NULL,
  `animal_id` int(10) unsigned DEFAULT NULL,
  `animal_name` varchar(120) DEFAULT NULL,
  `species` enum('perro') NOT NULL,
  `district_id` int(10) unsigned NOT NULL,
  `address` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `shelter_address` varchar(255) DEFAULT NULL,
  `contact_name` varchar(120) DEFAULT NULL,
  `contact_email` varchar(254) DEFAULT NULL,
  `contact_phone` varchar(40) DEFAULT NULL,
  `share_contact` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `animal_reports_animal_id_foreign` (`animal_id`),
  KEY `animal_reports_district_id_foreign` (`district_id`),
  CONSTRAINT `animal_reports_animal_id_foreign` FOREIGN KEY (`animal_id`) REFERENCES `animals` (`id`) ON DELETE SET NULL,
  CONSTRAINT `animal_reports_district_id_foreign` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `animal_reports`
--

LOCK TABLES `animal_reports` WRITE;
/*!40000 ALTER TABLE `animal_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `animal_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `animals`
--

DROP TABLE IF EXISTS `animals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `animals` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `public_code` char(32) NOT NULL,
  `name` varchar(120) NOT NULL,
  `species` enum('perro') NOT NULL,
  `living_condition` enum('hogar','calle','albergue') NOT NULL,
  `status` enum('activo','inactivo','archivado') NOT NULL DEFAULT 'activo',
  `district_id` int(10) unsigned NOT NULL,
  `address` varchar(255) NOT NULL,
  `observations` text DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `owner_id` int(10) unsigned DEFAULT NULL,
  `owner_email` varchar(254) DEFAULT NULL,
  `qr_code` char(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `public_code` (`public_code`),
  UNIQUE KEY `uq_animals_qr_code` (`qr_code`),
  KEY `animals_owner_id_foreign` (`owner_id`),
  KEY `idx_animals_census` (`district_id`,`status`,`species`,`living_condition`),
  CONSTRAINT `animals_district_id_foreign` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`),
  CONSTRAINT `animals_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `animals`
--

LOCK TABLES `animals` WRITE;
/*!40000 ALTER TABLE `animals` DISABLE KEYS */;
INSERT INTO `animals` VALUES
(1,'943961c088b8db70f74cbce29fc517af','Luna','perro','hogar','activo',1,'Ubicación ficticia para la demostración',NULL,'943961c088b8db70f74cbce29fc517af.webp',NULL,NULL,'943961c088b8db70f74cbce29fc517af'),
(2,'3f9671a58ae8f4086b54e3ce7b0ea197','Toby','perro','calle','activo',1,'Ubicación ficticia para la demostración',NULL,'3f9671a58ae8f4086b54e3ce7b0ea197.webp',NULL,NULL,'3f9671a58ae8f4086b54e3ce7b0ea197'),
(3,'3eb07ed1e84c6d91efe0d2685f7ac7fc','Mora','perro','albergue','activo',2,'Ubicación ficticia para la demostración',NULL,'3eb07ed1e84c6d91efe0d2685f7ac7fc.webp',NULL,NULL,'3eb07ed1e84c6d91efe0d2685f7ac7fc'),
(4,'dec69d0babcae768edada7c5820858ff','Nube','perro','calle','archivado',1,'Ubicación ficticia para la demostración',NULL,NULL,NULL,NULL,'dec69d0babcae768edada7c5820858ff'),
(5,'198f88f074bda1b6d8deced41082356c','Chispa','perro','hogar','inactivo',1,'Ubicación ficticia para la demostración',NULL,NULL,NULL,NULL,'198f88f074bda1b6d8deced41082356c'),
(6,'ec7541bdb5581cc266711ee775dfc84c','Bruno','perro','hogar','activo',1,'Frente a la iglesia central.','No tiene pulgas, es mi mejor amigo.','ec7541bdb5581cc266711ee775dfc84c.webp',3,NULL,'ec7541bdb5581cc266711ee775dfc84c'),
(7,'06ace4bec68f5559e2ed122b374ed304','Bruno','perro','albergue','activo',2,'Ubicación ficticia para la demostración',NULL,'06ace4bec68f5559e2ed122b374ed304.webp',NULL,NULL,'06ace4bec68f5559e2ed122b374ed304'),
(13,'4346d795ad448b2ee3c6f33230af6f58','Coco','perro','hogar','activo',97,'Frente a Autos de Lujo S.A.','Es un mimado y le gusta usar pañoleta','4346d795ad448b2ee3c6f33230af6f58.webp',NULL,NULL,'4346d795ad448b2ee3c6f33230af6f58'),
(14,'a7e624689a472f019e4a08432937230d','Zorro','perro','albergue','activo',1,'Ubicación ficticia para la demostración',NULL,'a7e624689a472f019e4a08432937230d.webp',NULL,NULL,'a7e624689a472f019e4a08432937230d'),
(15,'7dba0760b9c344ef5b7a04a7e14862f7','Lucas','perro','albergue','activo',3,'Ubicación ficticia para la demostración',NULL,'7dba0760b9c344ef5b7a04a7e14862f7.webp',NULL,NULL,'7dba0760b9c344ef5b7a04a7e14862f7'),
(16,'93d2a1518e4b923b74e308c95b6a9721','Oso','perro','albergue','activo',2,'Ubicación ficticia para la demostración',NULL,'93d2a1518e4b923b74e308c95b6a9721.webp',NULL,NULL,'93d2a1518e4b923b74e308c95b6a9721'),
(17,'6ec61bf971a337b2e53c9df0a6eb724c','Pirata','perro','albergue','activo',1,'Ubicación ficticia para la demostración',NULL,'6ec61bf971a337b2e53c9df0a6eb724c.webp',NULL,NULL,'6ec61bf971a337b2e53c9df0a6eb724c'),
(18,'25f36230c685116a795f8eaa5b15a64f','Miel','perro','albergue','activo',3,'Ubicación ficticia para la demostración',NULL,'25f36230c685116a795f8eaa5b15a64f.webp',NULL,NULL,'25f36230c685116a795f8eaa5b15a64f'),
(19,'025a3ef608c7c16593a2a784dc697de1','Barón','perro','albergue','activo',1,'Ubicación ficticia para la demostración',NULL,'025a3ef608c7c16593a2a784dc697de1.webp',NULL,NULL,'025a3ef608c7c16593a2a784dc697de1'),
(20,'3856b3f811dbb6b95a704077792b920f','Pecas','perro','albergue','activo',3,'Ubicación ficticia para la demostración',NULL,'3856b3f811dbb6b95a704077792b920f.webp',NULL,NULL,'3856b3f811dbb6b95a704077792b920f'),
(21,'38d3f4a70568deb019c8b66525b3849e','Roco','perro','albergue','activo',2,'Ubicación ficticia para la demostración',NULL,'38d3f4a70568deb019c8b66525b3849e.webp',NULL,NULL,'38d3f4a70568deb019c8b66525b3849e');
/*!40000 ALTER TABLE `animals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cantons`
--

DROP TABLE IF EXISTS `cantons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cantons` (
  `id` int(10) unsigned NOT NULL,
  `province_id` int(10) unsigned NOT NULL,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `province_id` (`province_id`),
  CONSTRAINT `cantons_province_id_foreign` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cantons`
--

LOCK TABLES `cantons` WRITE;
/*!40000 ALTER TABLE `cantons` DISABLE KEYS */;
INSERT INTO `cantons` VALUES
(101,1,'San José'),
(102,1,'Escazú'),
(103,1,'Desamparados'),
(104,1,'Puriscal'),
(105,1,'Tarrazú'),
(106,1,'Aserrí'),
(107,1,'Mora'),
(108,1,'Goicoechea'),
(109,1,'Santa Ana'),
(110,1,'Alajuelita'),
(111,1,'Vázquez de Coronado'),
(112,1,'Acosta'),
(113,1,'Tibás'),
(114,1,'Moravia'),
(115,1,'Montes de Oca'),
(116,1,'Turrubares'),
(117,1,'Dota'),
(118,1,'Curridabat'),
(119,1,'Pérez Zeledón'),
(120,1,'León Cortés Castro'),
(201,2,'Alajuela'),
(202,2,'San Ramón'),
(203,2,'Grecia'),
(204,2,'San Mateo'),
(205,2,'Atenas'),
(206,2,'Naranjo'),
(207,2,'Palmares'),
(208,2,'Poás'),
(209,2,'Orotina'),
(210,2,'San Carlos'),
(211,2,'Zarcero'),
(212,2,'Sarchí'),
(213,2,'Upala'),
(214,2,'Los Chiles'),
(215,2,'Guatuso'),
(216,2,'Río Cuarto'),
(301,3,'Cartago'),
(302,3,'Paraíso'),
(303,3,'La Unión'),
(304,3,'Jiménez'),
(305,3,'Turrialba'),
(306,3,'Alvarado'),
(307,3,'Oreamuno'),
(308,3,'El Guarco'),
(401,4,'Heredia'),
(402,4,'Barva'),
(403,4,'Santo Domingo'),
(404,4,'Santa Bárbara'),
(405,4,'San Rafael'),
(406,4,'San Isidro'),
(407,4,'Belén'),
(408,4,'Flores'),
(409,4,'San Pablo'),
(410,4,'Sarapiquí'),
(501,5,'Liberia'),
(502,5,'Nicoya'),
(503,5,'Santa Cruz'),
(504,5,'Bagaces'),
(505,5,'Carrillo'),
(506,5,'Cañas'),
(507,5,'Abangares'),
(508,5,'Tilarán'),
(509,5,'Nandayure'),
(510,5,'La Cruz'),
(511,5,'Hojancha'),
(601,6,'Puntarenas'),
(602,6,'Esparza'),
(603,6,'Buenos Aires'),
(604,6,'Montes de Oro'),
(605,6,'Osa'),
(606,6,'Quepos'),
(607,6,'Golfito'),
(608,6,'Coto Brus'),
(609,6,'Parrita'),
(610,6,'Corredores'),
(611,6,'Garabito'),
(612,6,'Monteverde'),
(613,6,'Puerto Jiménez'),
(701,7,'Limón'),
(702,7,'Pococí'),
(703,7,'Siquirres'),
(704,7,'Talamanca'),
(705,7,'Matina'),
(706,7,'Guácimo');
/*!40000 ALTER TABLE `cantons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `districts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `province` varchar(80) NOT NULL,
  `canton` varchar(80) NOT NULL,
  `name` varchar(80) NOT NULL,
  `official_code` int(10) unsigned DEFAULT NULL,
  `canton_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `province_canton_name` (`province`,`canton`,`name`),
  UNIQUE KEY `districts_official_code_unique` (`official_code`),
  KEY `districts_canton_id_index` (`canton_id`),
  CONSTRAINT `fk_districts_canton` FOREIGN KEY (`canton_id`) REFERENCES `cantons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=495 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES
(1,'San José','San José','Carmen',10101,101),
(2,'San José','San José','Catedral',10104,101),
(3,'San José','San José','Zapote',10105,101),
(4,'Puntarenas','Puntarenas','Chira',60113,601),
(5,'Alajuela','Grecia','Puente de Piedra',20307,203),
(6,'Guanacaste','Hojancha','Hojancha',51101,511),
(7,'Guanacaste','Nandayure','Santa Rita',50902,509),
(8,'Guanacaste','Nandayure','San Pablo',50904,509),
(9,'Guanacaste','Hojancha','Huacas',51104,511),
(10,'Guanacaste','Nicoya','Belén de Nosarita',50207,502),
(11,'Guanacaste','Nicoya','Nosara',50206,502),
(12,'Guanacaste','Nandayure','Carmona',50901,509),
(13,'Guanacaste','Hojancha','Monte Romo',51102,511),
(14,'Guanacaste','Nandayure','Zapotal',50903,509),
(15,'Puntarenas','Puntarenas','Lepanto',60104,601),
(16,'Guanacaste','Hojancha','Puerto Carrillo',51103,511),
(17,'Heredia','San Isidro','Concepción',40603,406),
(18,'Guanacaste','Nandayure','Porvenir',50905,509),
(19,'Guanacaste','Nandayure','Bejuco',50906,509),
(20,'Puntarenas','Puntarenas','Cóbano',60111,601),
(21,'Puntarenas','Puntarenas','Paquera',60105,601),
(22,'Guanacaste','Abangares','San Juan',50703,507),
(23,'Alajuela','Palmares','Palmares',20701,207),
(24,'Alajuela','Alajuela','Desamparados',20110,201),
(25,'Heredia','San Isidro','San José',40602,406),
(26,'Alajuela','Poás','Carrillos',20804,208),
(27,'Alajuela','Alajuela','Tambor',20112,201),
(28,'Alajuela','Palmares','Zaragoza',20702,207),
(29,'Alajuela','Alajuela','Alajuela',20101,201),
(30,'Puntarenas','Esparza','Macacona',60203,602),
(31,'Guanacaste','Nicoya','Sámara',50205,502),
(32,'San José','Moravia','San Jerónimo',11402,114),
(33,'Heredia','Barva','Puente Salas',40207,402),
(34,'Alajuela','Palmares','La Granja',20707,207),
(35,'Cartago','Turrialba','Santa Cruz',30504,305),
(36,'Heredia','San Rafael','Concepción',40505,405),
(37,'Heredia','Santa Bárbara','Jesús',40404,404),
(38,'Heredia','Barva','San Pablo',40203,402),
(39,'Alajuela','Grecia','Grecia',20301,203),
(40,'Alajuela','Palmares','Esquipulas',20706,207),
(41,'Guanacaste','Cañas','Cañas',50601,506),
(42,'Guanacaste','Carrillo','Belén',50504,505),
(43,'Guanacaste','Carrillo','Filadelfia',50501,505),
(44,'Guanacaste','Tilarán','Líbano',50805,508),
(45,'Guanacaste','Santa Cruz','Cabo Velas',50308,503),
(46,'Guanacaste','Cañas','Bebedero',50604,506),
(47,'Guanacaste','Cañas','San Miguel',50603,506),
(48,'Guanacaste','Santa Cruz','Bolsón',50302,503),
(49,'Guanacaste','Santa Cruz','Tamarindo',50309,503),
(50,'Guanacaste','Nicoya','Nicoya',50201,502),
(51,'Guanacaste','Abangares','Las Juntas',50701,507),
(52,'Guanacaste','Nicoya','San Antonio',50203,502),
(53,'Guanacaste','Santa Cruz','Diriá',50307,503),
(54,'Guanacaste','Cañas','Porozal',50605,506),
(55,'Guanacaste','Santa Cruz','Veintisiete de Abril',50303,503),
(56,'Guanacaste','Abangares','Colorado',50704,507),
(57,'Guanacaste','Nicoya','Quebrada Honda',50204,502),
(58,'Guanacaste','Nicoya','Mansión',50202,502),
(59,'Puntarenas','Puntarenas','Manzanillo',60106,601),
(60,'Guanacaste','Santa Cruz','Cuajiniquil',50306,503),
(61,'Alajuela','Naranjo','El Rosario',20607,206),
(62,'Heredia','Santa Bárbara','Santa Bárbara',40401,404),
(63,'Puntarenas','Puntarenas','Chomes',60103,601),
(64,'San José','Curridabat','Sánchez',11803,118),
(65,'San José','Curridabat','Curridabat',11801,118),
(66,'San José','Desamparados','San Juan de Dios',10303,103),
(67,'Puntarenas','Buenos Aires','Buenos Aires',60301,603),
(68,'Limón','Talamanca','Cahuita',70403,704),
(69,'Limón','Talamanca','Telire',70404,704),
(70,'Alajuela','Alajuela','San José',20102,201),
(71,'Puntarenas','Esparza','San Rafael',60204,602),
(72,'Heredia','San Isidro','San Isidro',40601,406),
(73,'Heredia','Barva','Barva',40201,402),
(74,'Limón','Talamanca','Bratsi',70401,704),
(75,'Limón','Talamanca','Sixaola',70402,704),
(76,'San José','Pérez Zeledón','San Pedro',11905,119),
(77,'San José','Pérez Zeledón','Cajón',11908,119),
(78,'Puntarenas','Buenos Aires','Potrero Grande',60303,603),
(79,'Puntarenas','Buenos Aires','Volcán',60302,603),
(80,'Puntarenas','Buenos Aires','Brunka',60309,603),
(81,'San José','Pérez Zeledón','La  Amistad',11912,119),
(82,'Puntarenas','Buenos Aires','Biolley',60308,603),
(83,'Puntarenas','Buenos Aires','Pilas',60305,603),
(84,'Puntarenas','Coto Brus','Pittier',60805,608),
(85,'Puntarenas','Coto Brus','Gutiérrez Braun',60806,608),
(86,'Puntarenas','Buenos Aires','Boruca',60304,603),
(87,'Puntarenas','Buenos Aires','Colinas',60306,603),
(88,'Puntarenas','Osa','Palmar',60502,605),
(89,'Puntarenas','Buenos Aires','Chánguena',60307,603),
(90,'Puntarenas','Coto Brus','Sabalito',60802,608),
(91,'Puntarenas','Coto Brus','Limoncito',60804,608),
(92,'Puntarenas','Coto Brus','San Vito',60801,608),
(93,'Cartago','Cartago','Carmen',30103,301),
(94,'Alajuela','San Ramón','San Rafael',20206,202),
(95,'Cartago','La Unión','Río Azul',30308,303),
(96,'San José','Desamparados','Gravilias',10312,103),
(97,'San José','Escazú','Escazú',10201,102),
(98,'San José','Turrubares','San Pablo',11601,116),
(99,'Cartago','La Unión','San Juan',30303,303),
(100,'Cartago','La Unión','San Rafael',30304,303),
(101,'Cartago','Alvarado','Cervantes',30602,306),
(102,'San José','San José','San Sebastián',10111,101),
(103,'San José','Mora','Piedras Negras',10704,107),
(104,'San José','San José','San Francisco de Dos Ríos',10106,101),
(105,'Cartago','La Unión','Tres Ríos',30301,303),
(106,'Heredia','Santa Bárbara','San Pedro',40402,404),
(107,'Puntarenas','Puntarenas','Barranca',60108,601),
(108,'Heredia','Barva','Santa Lucía',40205,402),
(109,'Alajuela','Palmares','Candelaria',20705,207),
(110,'Alajuela','Atenas','San José',20506,205),
(111,'Alajuela','Atenas','Santa Eulalia',20507,205),
(112,'Alajuela','Palmares','Santiago',20704,207),
(113,'Heredia','Santa Bárbara','San Juan',40403,404),
(114,'Cartago','Oreamuno','Cipreses',30704,307),
(115,'San José','Alajuelita','Alajuelita',11001,110),
(116,'San José','Curridabat','Tirrases',11804,118),
(117,'San José','Desamparados','Desamparados',10301,103),
(118,'Cartago','La Unión','San Diego',30302,303),
(119,'San José','Desamparados','San Rafael Abajo',10311,103),
(120,'San José','Desamparados','San Antonio',10305,103),
(121,'San José','Alajuelita','Concepción',11004,110),
(122,'San José','Alajuelita','San Josecito',11002,110),
(123,'San José','Desamparados','Damas',10310,103),
(124,'Alajuela','Palmares','Buenos Aires',20703,207),
(125,'Alajuela','Naranjo','San Miguel',20602,206),
(126,'Puntarenas','Montes de Oro','San Isidro',60403,604),
(127,'Limón','Guácimo','Pocora',70603,706),
(128,'Limón','Guácimo','Mercedes',70602,706),
(129,'Limón','Siquirres','Florida',70303,703),
(130,'Cartago','Turrialba','Peralta',30503,305),
(131,'Cartago','Turrialba','Pavones',30506,305),
(132,'Cartago','Turrialba','La Isabel',30511,305),
(133,'Cartago','Turrialba','Chirripó',30512,305),
(134,'Limón','Matina','Matina',70501,705),
(135,'Limón','Limón','Matama',70104,701),
(136,'Cartago','Turrialba','Tuis',30507,305),
(137,'Limón','Limón','Valle La Estrella',70102,701),
(138,'Cartago','Turrialba','Tayutic',30508,305),
(139,'Puntarenas','Garabito','Lagunillas',61103,611),
(140,'Cartago','Paraíso','Birrisito',30206,302),
(141,'San José','Mora','Quitirrisí',10707,107),
(142,'Puntarenas','Osa','Bahía Ballena',60504,605),
(143,'Puntarenas','Esparza','Caldera',60206,602),
(144,'Cartago','Jiménez','Juan Viñas',30401,304),
(145,'Alajuela','Orotina','La Ceiba',20905,209),
(146,'Cartago','Turrialba','Turrialba',30501,305),
(147,'Cartago','Turrialba','La Suiza',30502,305),
(148,'Cartago','Cartago','San Nicolás',30104,301),
(149,'San José','Santa Ana','Salitral',10902,109),
(150,'San José','Escazú','San Antonio',10202,102),
(151,'Cartago','Oreamuno','Cot',30702,307),
(152,'San José','Puriscal','Grifo Alto',10404,104),
(153,'Alajuela','Orotina','Coyolar',20904,209),
(154,'Limón','Guácimo','Guácimo',70601,706),
(155,'Cartago','Paraíso','Santiago',30202,302),
(156,'Limón','Guácimo','Río Jiménez',70604,706),
(157,'Limón','Pococí','Roxana',70204,702),
(158,'Puntarenas','Buenos Aires','Cabagra',60310,603),
(159,'Guanacaste','Bagaces','Bagaces',50401,504),
(160,'Alajuela','Upala','Delicias',21305,213),
(161,'Guanacaste','La Cruz','La Cruz',51001,510),
(162,'Guanacaste','La Cruz','La Garita',51003,510),
(163,'Guanacaste','La Cruz','Santa Cecilia',51002,510),
(164,'Alajuela','Upala','San José O Pizote',21303,213),
(165,'Alajuela','Upala','Yolillal',21307,213),
(166,'Alajuela','Los Chiles','Los Chiles',21401,214),
(167,'Alajuela','Los Chiles','Caño Negro',21402,214),
(168,'Alajuela','San Carlos','Pocosol',21013,210),
(169,'Alajuela','San Carlos','Cutris',21011,210),
(170,'Alajuela','San Carlos','Pital',21006,210),
(171,'Heredia','Sarapiquí','Cureña',41005,410),
(172,'Heredia','Sarapiquí','Puerto Viejo',41001,410),
(173,'Heredia','Sarapiquí','Llanuras del Gaspar',41004,410),
(174,'Limón','Pococí','Colorado',70206,702),
(175,'Guanacaste','Santa Cruz','Tempate',50304,503),
(176,'Guanacaste','Santa Cruz','Cartagena',50305,503),
(177,'Cartago','Cartago','Quebradilla',30111,301),
(178,'San José','Desamparados','San Miguel',10302,103),
(179,'Puntarenas','Puntarenas','Isla del Coco',60110,601),
(180,'Puntarenas','Puerto Jiménez','Puerto Jiménez',61301,613),
(181,'Heredia','Barva','San Pedro',40202,402),
(182,'Cartago','Jiménez','La Victoria',30404,304),
(183,'Limón','Pococí','Rita',70203,702),
(184,'Limón','Pococí','Cariari',70205,702),
(185,'Limón','Guácimo','Duacarí',70605,706),
(186,'Puntarenas','Osa','Piedras Blancas',60505,605),
(187,'San José','Turrubares','San Pedro',11602,116),
(188,'San José','Alajuelita','San Antonio',11003,110),
(189,'San José','Pérez Zeledón','Río Nuevo',11910,119),
(190,'San José','Pérez Zeledón','San Isidro de El General',11901,119),
(191,'Puntarenas','Quepos','Savegre',60602,606),
(192,'San José','Pérez Zeledón','Barú',11909,119),
(193,'Guanacaste','Santa Cruz','Santa Cruz',50301,503),
(194,'Alajuela','Upala','Dos Ríos',21306,213),
(195,'Guanacaste','Liberia','Nacascolo',50104,501),
(196,'Guanacaste','Liberia','Cañas Dulces',50102,501),
(197,'Guanacaste','Liberia','Curubandé',50105,501),
(198,'Alajuela','Guatuso','Katira',21504,215),
(199,'Alajuela','Upala','Bijagua',21304,213),
(200,'Guanacaste','Liberia','Liberia',50101,501),
(201,'Guanacaste','Bagaces','Mogote',50403,504),
(202,'Guanacaste','Bagaces','La Fortuna',50402,504),
(203,'Guanacaste','Bagaces','Río Naranjo',50404,504),
(204,'Guanacaste','Cañas','Palmira',50602,506),
(205,'Guanacaste','Tilarán','Tierras Morenas',50806,508),
(206,'Guanacaste','Carrillo','Sardinal',50503,505),
(207,'Guanacaste','Carrillo','Palmira',50502,505),
(208,'Guanacaste','Tilarán','Santa Rosa',50804,508),
(209,'Alajuela','Poás','San Pedro',20801,208),
(210,'Alajuela','Naranjo','Palmitos',20608,206),
(211,'Alajuela','San Ramón','Alfaro',20209,202),
(212,'Alajuela','San Ramón','San Isidro',20207,202),
(213,'Alajuela','Sarchí','Sarchí Sur',21202,212),
(214,'Heredia','Santa Bárbara','Purabá',40406,404),
(215,'Alajuela','San Ramón','San Ramón',20201,202),
(216,'Alajuela','San Ramón','San Juan',20203,202),
(217,'San José','Puriscal','Desamparaditos',10407,104),
(218,'Heredia','San Rafael','Ángeles',40504,405),
(219,'Puntarenas','Esparza','San Jerónimo',60205,602),
(220,'San José','Turrubares','San Juan de Mata',11603,116),
(221,'San José','Desamparados','San Rafael Arriba',10304,103),
(222,'Cartago','Oreamuno','San Rafael',30701,307),
(223,'San José','Puriscal','San Antonio',10408,104),
(224,'San José','Mora','Tabarcia',10703,107),
(225,'San José','Desamparados','Patarrá',10307,103),
(226,'San José','Mora','Jaris',10706,107),
(227,'Cartago','Cartago','Guadalupe o Arenilla',30106,301),
(228,'San José','Puriscal','Santiago',10401,104),
(229,'San José','Desamparados','Los Guido',10313,103),
(230,'San José','Puriscal','Barbacoas',10403,104),
(231,'San José','Mora','Guayabo',10702,107),
(232,'San José','Turrubares','San Luis',11604,116),
(233,'Cartago','Paraíso','Cachí',30204,302),
(234,'Cartago','Jiménez','Tucurrique',30402,304),
(235,'San José','Aserrí','Aserrí',10601,106),
(236,'Guanacaste','La Cruz','Santa Elena',51004,510),
(237,'Cartago','Cartago','Occidental',30102,301),
(238,'San José','Aserrí','Salitrillos',10607,106),
(239,'Cartago','Cartago','Oriental',30101,301),
(240,'Alajuela','Upala','Aguas Claras',21302,213),
(241,'Guanacaste','Liberia','Mayorga',50103,501),
(242,'Alajuela','Upala','Upala',21301,213),
(243,'Alajuela','Upala','Canalete',21308,213),
(244,'Alajuela','Poás','San Rafael',20803,208),
(245,'Alajuela','Naranjo','Naranjo',20601,206),
(246,'Alajuela','Naranjo','San Juan',20606,206),
(247,'Alajuela','Alajuela','Carrizal',20103,201),
(248,'Puntarenas','Golfito','Guaycará',60703,607),
(249,'Heredia','San Isidro','San Francisco',40604,406),
(250,'Heredia','San Rafael','San Rafael',40501,405),
(251,'San José','Goicoechea','Mata de Plátano',10804,108),
(252,'San José','San José','Pavas',10109,101),
(253,'San José','Tibás','León XIII',11304,113),
(254,'San José','Tibás','Anselmo Llorente',11303,113),
(255,'Alajuela','San Mateo','Labrador',20404,204),
(256,'Cartago','Turrialba','Santa Rosa',30509,305),
(257,'San José','Goicoechea','Guadalupe',10801,108),
(258,'San José','Montes de Oca','San Rafael',11504,115),
(259,'San José','Goicoechea','Calle Blancos',10803,108),
(260,'San José','Montes de Oca','Sabanilla',11502,115),
(261,'San José','Tibás','Cinco Esquinas',11302,113),
(262,'San José','Montes de Oca','Mercedes',11503,115),
(263,'Cartago','La Unión','Dulce Nombre',30306,303),
(264,'San José','Santa Ana','Brasil',10906,109),
(265,'San José','Santa Ana','Uruca',10904,109),
(266,'Alajuela','San Ramón','San Lorenzo',20214,202),
(267,'Limón','Pococí','Guápiles',70201,702),
(268,'Alajuela','San Carlos','Buenavista',21003,210),
(269,'Limón','Pococí','La Colonia',70207,702),
(270,'Limón','Pococí','Jiménez',70202,702),
(271,'Heredia','Heredia','Varablanca',40105,401),
(272,'Puntarenas','Montes de Oro','La Unión',60402,604),
(273,'Alajuela','Sarchí','Toro Amarillo',21203,212),
(274,'Puntarenas','Puntarenas','Arancibia',60116,601),
(275,'Alajuela','Zarcero','Zapote',21106,211),
(276,'Alajuela','Zarcero','Brisas',21107,211),
(277,'Alajuela','Zarcero','Laguna',21102,211),
(278,'San José','Tibás','Colima',11305,113),
(279,'Alajuela','Zarcero','Palmira',21105,211),
(280,'San José','Goicoechea','Purral',10807,108),
(281,'Alajuela','Alajuela','Turrúcares',20111,201),
(282,'San José','Escazú','San Rafael',10203,102),
(283,'Cartago','Oreamuno','Potrero Cerrado',30703,307),
(284,'San José','San José','Uruca',10107,101),
(285,'Limón','Limón','Río Blanco',70103,701),
(286,'Cartago','Turrialba','Tres Equis',30510,305),
(287,'Alajuela','Río Cuarto','Santa Rita',21602,216),
(288,'Alajuela','Los Chiles','El Amparo',21403,214),
(289,'Alajuela','Los Chiles','San Jorge',21404,214),
(290,'Alajuela','San Carlos','Monterrey',21012,210),
(291,'Alajuela','Río Cuarto','Santa Isabel',21603,216),
(292,'Alajuela','San Carlos','La Fortuna',21007,210),
(293,'Alajuela','Río Cuarto','Río Cuarto',21601,216),
(294,'Alajuela','San Ramón','Ángeles',20208,202),
(295,'Alajuela','Grecia','San José',20303,203),
(296,'Heredia','Sarapiquí','La Virgen',41002,410),
(297,'Alajuela','San Carlos','Aguas Zarcas',21004,210),
(298,'Alajuela','San Carlos','La Palmera',21009,210),
(299,'Alajuela','San Carlos','Florencia',21002,210),
(300,'Heredia','Sarapiquí','Las Horquetas',41003,410),
(301,'Alajuela','San Ramón','Peñas Blancas',20213,202),
(302,'Alajuela','San Carlos','Quesada',21001,210),
(303,'Alajuela','San Carlos','Venecia',21005,210),
(304,'Alajuela','Alajuela','Sarapiquí',20114,201),
(305,'Alajuela','San Carlos','La Tigra',21008,210),
(306,'Cartago','Cartago','Tierra Blanca',30108,301),
(307,'Cartago','Cartago','Llano Grande',30110,301),
(308,'San José','Goicoechea','Ipís',10805,108),
(309,'Alajuela','Atenas','Escobal',20508,205),
(310,'San José','Tibás','San Juan',11301,113),
(311,'Alajuela','Zarcero','Tapesco',21103,211),
(312,'Alajuela','Zarcero','Zarcero',21101,211),
(313,'Alajuela','Orotina','El Mastate',20902,209),
(314,'San José','Mora','Colón',10701,107),
(315,'Alajuela','Orotina','Orotina',20901,209),
(316,'San José','San José','Hatillo',10110,101),
(317,'San José','Alajuelita','San Felipe',11005,110),
(318,'San José','León Cortés Castro','Llano Bonito',12003,120),
(319,'Alajuela','San Ramón','Piedades Sur',20205,202),
(320,'Alajuela','Sarchí','Rodríguez',21205,212),
(321,'Alajuela','San Ramón','Concepción',20211,202),
(322,'Cartago','Oreamuno','Santa Rosa',30705,307),
(323,'San José','Vázquez de Coronado','Cascajal',11105,111),
(324,'Alajuela','Grecia','Tacares',20305,203),
(325,'Heredia','Barva','San José de la Montaña',40206,402),
(326,'San José','León Cortés Castro','San Pablo',12001,120),
(327,'San José','León Cortés Castro','San Isidro',12004,120),
(328,'Puntarenas','Garabito','Jacó',61101,611),
(329,'San José','Dota','Santa María',11701,117),
(330,'San José','Dota','Copey',11703,117),
(331,'San José','Tarrazú','San Carlos',10503,105),
(332,'San José','Tarrazú','San Lorenzo',10502,105),
(333,'Puntarenas','Parrita','Parrita',60901,609),
(334,'San José','Pérez Zeledón','Páramo',11911,119),
(335,'Puntarenas','Quepos','Naranjito',60603,606),
(336,'Guanacaste','Tilarán','Quebrada Grande',50802,508),
(337,'Guanacaste','Hojancha','Matambú',51105,511),
(338,'Puntarenas','Golfito','Pavón',60704,607),
(339,'Heredia','Santa Bárbara','Santo Domingo',40405,404),
(340,'Alajuela','Zarcero','Guadalupe',21104,211),
(341,'Alajuela','Alajuela','San Isidro',20106,201),
(342,'Alajuela','Naranjo','San José',20603,206),
(343,'Alajuela','San Ramón','Zapotal',20212,202),
(344,'Alajuela','Poás','Sabana Redonda',20805,208),
(345,'Alajuela','Poás','San Juan',20802,208),
(346,'Alajuela','Alajuela','Sabanilla',20107,201),
(347,'Alajuela','Naranjo','Cirrí Sur',20604,206),
(348,'San José','Vázquez de Coronado','Dulce Nombre de Jesús',11103,111),
(349,'Alajuela','Orotina','Hacienda Vieja',20903,209),
(350,'San José','San José','Merced',10102,101),
(351,'San José','San José','Mata Redonda',10108,101),
(352,'San José','Goicoechea','San Francisco',10802,108),
(353,'San José','Montes de Oca','San Pedro',11501,115),
(354,'San José','Santa Ana','Piedades',10905,109),
(355,'San José','Santa Ana','Santa Ana',10901,109),
(356,'Cartago','La Unión','San Ramón',30307,303),
(357,'San José','Curridabat','Granadilla',11802,118),
(358,'San José','Mora','Picagres',10705,107),
(359,'Cartago','La Unión','Concepción',30305,303),
(360,'San José','San José','Hospital',10103,101),
(361,'Alajuela','San Ramón','Volio',20210,202),
(362,'Alajuela','Sarchí','San Pedro',21204,212),
(363,'Alajuela','Grecia','Bolivar',20308,203),
(364,'Alajuela','San Ramón','Piedades Norte',20204,202),
(365,'Alajuela','Sarchí','Sarchí Norte',21201,212),
(366,'Alajuela','Grecia','San Isidro',20302,203),
(367,'Alajuela','Grecia','San Roque',20304,203),
(368,'Puntarenas','Montes de Oro','Miramar',60401,604),
(369,'Alajuela','Naranjo','San Jerónimo',20605,206),
(370,'Cartago','Turrialba','Santa Teresita',30505,305),
(371,'San José','Santa Ana','Pozos',10903,109),
(372,'San José','Moravia','San Vicente',11401,114),
(373,'San José','Acosta','Cangrejal',11204,112),
(374,'San José','Acosta','Sabanillas',11205,112),
(375,'San José','Desamparados','Frailes',10306,103),
(376,'San José','Aserrí','Monterrey',10606,106),
(377,'San José','Aserrí','Legua',10605,106),
(378,'San José','León Cortés Castro','San Andrés',12002,120),
(379,'San José','Puriscal','Chires',10409,104),
(380,'San José','León Cortés Castro','San Antonio',12006,120),
(381,'San José','León Cortés Castro','Santa Cruz',12005,120),
(382,'San José','Dota','Jardín',11702,117),
(383,'San José','Tarrazú','San Marcos',10501,105),
(384,'Puntarenas','Esparza','Espíritu Santo',60201,602),
(385,'Cartago','Alvarado','Capellades',30603,306),
(386,'Heredia','Heredia','Mercedes',40102,401),
(387,'Heredia','Santo Domingo','Pará',40308,403),
(388,'Alajuela','Alajuela','Garita',20113,201),
(389,'Alajuela','San Mateo','San Mateo',20401,204),
(390,'Heredia','Santo Domingo','Paracito',40304,403),
(391,'Alajuela','Alajuela','Río Segundo',20109,201),
(392,'Alajuela','Atenas','San Isidro',20504,205),
(393,'Heredia','San Rafael','Santiago',40503,405),
(394,'Heredia','San Pablo','San Pablo',40901,409),
(395,'Heredia','Flores','San Joaquín',40801,408),
(396,'Alajuela','Alajuela','San Antonio',20104,201),
(397,'Heredia','Heredia','Heredia',40101,401),
(398,'Heredia','Santo Domingo','Tures',40307,403),
(399,'Heredia','Belén','La Ribera',40702,407),
(400,'San José','Desamparados','San Cristobal',10308,103),
(401,'Heredia','Flores','Llorente',40803,408),
(402,'San José','Turrubares','Carara',11605,116),
(403,'San José','Aserrí','Vuelta de Jorco',10603,106),
(404,'Puntarenas','Coto Brus','Aguabuena',60803,608),
(405,'Puntarenas','Golfito','Golfito',60701,607),
(406,'Puntarenas','Corredores','Corredor',61001,610),
(407,'Puntarenas','Corredores','Canoas',61003,610),
(408,'Puntarenas','Corredores','La Cuesta',61002,610),
(409,'Cartago','El Guarco','San Isidro',30802,308),
(410,'Puntarenas','Quepos','Quepos',60601,606),
(411,'Puntarenas','Garabito','Tárcoles',61102,611),
(412,'Cartago','Paraíso','Paraíso',30201,302),
(413,'Cartago','Paraíso','Llanos de Santa Lucía',30205,302),
(414,'San José','Acosta','Palmichal',11203,112),
(415,'Cartago','Cartago','Dulce Nombre',30109,301),
(416,'Cartago','Cartago','Aguacaliente o San Francisco',30105,301),
(417,'Cartago','El Guarco','El Tejar',30801,308),
(418,'San José','Puriscal','San Rafael',10405,104),
(419,'San José','Puriscal','Mercedes Sur',10402,104),
(420,'San José','Aserrí','Tarbaca',10602,106),
(421,'Cartago','El Guarco','Tobosi',30803,308),
(422,'San José','Desamparados','Rosario',10309,103),
(423,'San José','Puriscal','Candelarita',10406,104),
(424,'San José','Acosta','San Ignacio',11201,112),
(425,'San José','Acosta','Guaitil',11202,112),
(426,'Heredia','Barva','San Roque',40204,402),
(427,'Heredia','Flores','Barrantes',40802,408),
(428,'Heredia','San Rafael','San Josecito',40502,405),
(429,'Cartago','Cartago','Corralillo',30107,301),
(430,'San José','Aserrí','San Gabriel',10604,106),
(431,'Cartago','El Guarco','Patio de Agua',30804,308),
(432,'San José','Goicoechea','Rancho Redondo',10806,108),
(433,'Heredia','Heredia','San Francisco',40103,401),
(434,'Alajuela','Alajuela','Guácima',20105,201),
(435,'Guanacaste','Tilarán','Cabeceras',50808,508),
(436,'Guanacaste','Abangares','Sierra',50702,507),
(437,'Puntarenas','Monteverde','Monteverde',61201,612),
(438,'Puntarenas','Puntarenas','Guacimal',60107,601),
(439,'Puntarenas','Puntarenas','Acapulco',60114,601),
(440,'Puntarenas','Puntarenas','Pitahaya',60102,601),
(441,'Puntarenas','Puntarenas','Puntarenas',60101,601),
(442,'Puntarenas','Corredores','Laurel',61004,610),
(443,'Limón','Siquirres','Siquirres',70301,703),
(444,'Limón','Matina','Batán',70502,705),
(445,'Limón','Siquirres','Reventazón',70307,703),
(446,'Limón','Siquirres','El Cairo',70305,703),
(447,'Limón','Siquirres','Pacuarito',70302,703),
(448,'Limón','Siquirres','Germania',70304,703),
(449,'Limón','Siquirres','Alegría',70306,703),
(450,'Limón','Matina','Carrandí',70503,705),
(451,'Limón','Limón','Limón',70101,701),
(452,'Heredia','Heredia','Ulloa',40104,401),
(453,'Heredia','Santo Domingo','Santo Tomás',40305,403),
(454,'Heredia','Belén','San Antonio',40701,407),
(455,'Alajuela','Atenas','Concepción',20505,205),
(456,'Alajuela','San Mateo','Jesús María',20403,204),
(457,'Heredia','Santo Domingo','Santa Rosa',40306,403),
(458,'San José','Vázquez de Coronado','Patalillo',11104,111),
(459,'Heredia','Santo Domingo','Santo Domingo',40301,403),
(460,'San José','Vázquez de Coronado','San Isidro',11101,111),
(461,'Cartago','Alvarado','Pacayas',30601,306),
(462,'Guanacaste','Tilarán','Tronadora',50803,508),
(463,'Alajuela','Atenas','Mercedes',20503,205),
(464,'Guanacaste','Tilarán','Tilarán',50801,508),
(465,'Alajuela','Alajuela','San Rafael',20108,201),
(466,'Heredia','Santo Domingo','San Miguel',40303,403),
(467,'Heredia','Santo Domingo','San Vicente',40302,403),
(468,'Alajuela','San Mateo','Desmonte',20402,204),
(469,'Cartago','Jiménez','Pejivalle',30403,304),
(470,'Cartago','Paraíso','Orosi',30203,302),
(471,'San José','Pérez Zeledón','Rivas',11904,119),
(472,'San José','Pérez Zeledón','El General',11902,119),
(473,'San José','Pérez Zeledón','Daniel Flores',11903,119),
(474,'San José','Pérez Zeledón','Platanares',11906,119),
(475,'San José','Pérez Zeledón','Pejibaye',11907,119),
(476,'Puntarenas','Osa','Puerto Cortés',60501,605),
(477,'Puntarenas','Osa','Sierpe',60503,605),
(478,'Puntarenas','Osa','Bahía Drake',60506,605),
(479,'Alajuela','Guatuso','Buenavista',21502,215),
(480,'Alajuela','Guatuso','San Rafael',21501,215),
(481,'Alajuela','Guatuso','Cote',21503,215),
(482,'Alajuela','San Carlos','Venado',21010,210),
(483,'Alajuela','Atenas','Atenas',20501,205),
(484,'Puntarenas','Puntarenas','Chacarita',60112,601),
(485,'Puntarenas','Puntarenas','El Roble',60115,601),
(486,'Puntarenas','Esparza','San Juan Grande',60202,602),
(487,'Alajuela','San Ramón','Santiago',20202,202),
(488,'Heredia','San Pablo','Rincón de Sabanilla',40902,409),
(489,'San José','Moravia','La Trinidad',11403,114),
(490,'Heredia','Belén','La Asunción',40703,407),
(491,'Alajuela','Atenas','Jesús',20502,205),
(492,'San José','Vázquez de Coronado','San Rafael',11102,111),
(493,'Guanacaste','Tilarán','Arenal',50807,508),
(494,'Guanacaste','Bagaces','Pijije',50405,504);
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `version` varchar(255) NOT NULL,
  `class` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `namespace` varchar(255) NOT NULL,
  `time` int(11) NOT NULL,
  `batch` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(4,'2026-11-06-000001','App\\Database\\Migrations\\CreateUsers','default','App',1794002797,1),
(5,'2026-11-06-000002','App\\Database\\Migrations\\CreateDistricts','default','App',1794002797,1),
(6,'2026-11-06-000003','App\\Database\\Migrations\\CreateAnimals','default','App',1794002797,1),
(7,'2026-11-06-000004','App\\Database\\Migrations\\CreateAnimalReports','default','App',1794003199,2),
(8,'2026-11-06-000005','App\\Database\\Migrations\\AddLostReportDetails','default','App',1794003488,3),
(9,'2026-11-06-000006','App\\Database\\Migrations\\CreateReportNotifications','default','App',1794003760,4),
(10,'2026-11-06-000007','App\\Database\\Migrations\\CreateAdoptions','default','App',1794004097,5),
(11,'2026-11-06-000008','App\\Database\\Migrations\\SeparateAnimalQrCodes','default','App',1794004292,6),
(12,'2026-11-06-000009','App\\Database\\Migrations\\AddPrivateReportReplies','default','App',1794004822,7),
(13,'2026-11-06-000010','App\\Database\\Migrations\\AddUserProfile','default','App',1794007499,8),
(14,'2026-11-06-000011','App\\Database\\Migrations\\CreateRememberTokens','default','App',1794007843,9),
(15,'2026-11-08-000001','App\\Database\\Migrations\\AddUserEmail','default','App',1794117816,10),
(16,'2026-11-08-000002','App\\Database\\Migrations\\CreateTerritoryCatalog','default','App',1794156919,11),
(17,'2026-11-09-000001','App\\Database\\Migrations\\CreateReportPhotos','default','App',1794238634,12),
(18,'2026-11-10-000001','App\\Database\\Migrations\\DogsOnlySpecies','default','App',1794359730,13);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provinces`
--

DROP TABLE IF EXISTS `provinces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `provinces` (
  `id` int(10) unsigned NOT NULL,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provinces`
--

LOCK TABLES `provinces` WRITE;
/*!40000 ALTER TABLE `provinces` DISABLE KEYS */;
INSERT INTO `provinces` VALUES
(1,'San José'),
(2,'Alajuela'),
(3,'Cartago'),
(4,'Heredia'),
(5,'Guanacaste'),
(6,'Puntarenas'),
(7,'Limón');
/*!40000 ALTER TABLE `provinces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `remember_tokens`
--

DROP TABLE IF EXISTS `remember_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `remember_tokens` (
  `selector` char(32) NOT NULL,
  `validator_hash` char(64) NOT NULL,
  `user_id` int(11) unsigned NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`selector`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `remember_tokens_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `remember_tokens`
--

LOCK TABLES `remember_tokens` WRITE;
/*!40000 ALTER TABLE `remember_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `remember_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_notifications`
--

DROP TABLE IF EXISTS `report_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_notifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `report_id` int(10) unsigned NOT NULL,
  `recipient_type` enum('owner','admin') NOT NULL,
  `recipient_email` varchar(254) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `reason` enum('owner','shelter','no_contact','bounce') NOT NULL,
  `bounced_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `reply_url` varchar(512) DEFAULT NULL,
  `reply_token_hash` char(64) DEFAULT NULL,
  `reply_expires_at` datetime DEFAULT NULL,
  `reply_body` text DEFAULT NULL,
  `replied_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_id_recipient_type` (`report_id`,`recipient_type`),
  UNIQUE KEY `uq_notification_reply_token` (`reply_token_hash`),
  CONSTRAINT `report_notifications_report_id_foreign` FOREIGN KEY (`report_id`) REFERENCES `animal_reports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_notifications`
--

LOCK TABLES `report_notifications` WRITE;
/*!40000 ALTER TABLE `report_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_photos`
--

DROP TABLE IF EXISTS `report_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_photos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `report_id` int(10) unsigned NOT NULL,
  `photo_path` varchar(255) NOT NULL,
  `sort_order` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_id_sort_order` (`report_id`,`sort_order`),
  CONSTRAINT `report_photos_report_id_foreign` FOREIGN KEY (`report_id`) REFERENCES `animal_reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_photos`
--

LOCK TABLES `report_photos` WRITE;
/*!40000 ALTER TABLE `report_photos` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `retired_qr_codes`
--

DROP TABLE IF EXISTS `retired_qr_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `retired_qr_codes` (
  `code` char(32) NOT NULL,
  `retired_at` datetime NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `retired_qr_codes`
--

LOCK TABLES `retired_qr_codes` WRITE;
/*!40000 ALTER TABLE `retired_qr_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `retired_qr_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(80) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('superusuario','administrador','colaborador','general') NOT NULL,
  `display_name` varchar(120) DEFAULT NULL,
  `avatar_path` varchar(64) DEFAULT NULL,
  `email` varchar(254) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'superusuario','$2y$12$PJcR3D0IV3M7WeCRRcS9Q.TjzoyajnG0/SBaD07/eLQ2gENZJ5N46','superusuario',NULL,NULL,NULL),
(2,'administrador','$2y$12$1rfzTrhERwV9HtewceUBfe19p85sZe.xkwkgaerI4dZgfkM6c1lZ6','administrador',NULL,NULL,NULL),
(3,'general1','$2y$12$DD4RkXQB98f7s6HWseKTzulc3VaSkE9XiTl6we2Y05vuoXNvTpbIy','general',NULL,NULL,NULL),
(5,'general2','$2y$12$MAxpeAXBe0Eg7i5JoURNIuX7SIDeVQ80SaBrKEk.ET5VgosltXNGa','general','General 2',NULL,'general2@gmail.com');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-16 14:31:00
