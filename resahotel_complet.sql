CREATE DATABASE  IF NOT EXISTS `resahotel` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `resahotel`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: resahotel
-- ------------------------------------------------------
-- Server version	5.7.24

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
-- Table structure for table `avis`
--

DROP TABLE IF EXISTS `avis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avis` (
  `avis` varchar(50) NOT NULL,
  `note` int(11) DEFAULT NULL,
  `commentaire` varchar(100) DEFAULT NULL,
  `date_avis` date DEFAULT NULL,
  `hotel` varchar(50) NOT NULL,
  `utilisateurs` varchar(50) NOT NULL,
  PRIMARY KEY (`avis`),
  KEY `hotel` (`hotel`),
  KEY `utilisateurs` (`utilisateurs`),
  CONSTRAINT `avis_ibfk_1` FOREIGN KEY (`hotel`) REFERENCES `hotel` (`hotel`),
  CONSTRAINT `avis_ibfk_2` FOREIGN KEY (`utilisateurs`) REFERENCES `utilisateur` (`utilisateurs`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avis`
--

LOCK TABLES `avis` WRITE;
/*!40000 ALTER TABLE `avis` DISABLE KEYS */;
INSERT INTO `avis` VALUES ('A001',1,'Séjour excellent, hôtel tres propre','2026-09-29','H006','U002'),('A002',1,'Hôtel Fantastique et merveilleux, personnel au TOP!','2026-09-30','H016','U001'),('A003',1,'Hôtel idéalement bien placé, accueil au top mais un peu bruyant','2026-09-28','H008','U003'),('A004',1,'Hôtel trés bien situé, proche Montparnass et des commerces, je recommande !','2026-09-29','H001','U002');
/*!40000 ALTER TABLE `avis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chambre`
--

DROP TABLE IF EXISTS `chambre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chambre` (
  `chambre` varchar(50) NOT NULL,
  `hotel` varchar(50) NOT NULL,
  `numero` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `capacite` int(11) DEFAULT NULL,
  `tarif` decimal(15,2) DEFAULT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`chambre`,`hotel`),
  KEY `fk_chambre_hotel` (`hotel`),
  CONSTRAINT `fk_chambre_hotel` FOREIGN KEY (`hotel`) REFERENCES `hotel` (`hotel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chambre`
--

LOCK TABLES `chambre` WRITE;
/*!40000 ALTER TABLE `chambre` DISABLE KEYS */;
INSERT INTO `chambre` VALUES ('C001','H001','101','Double',2,120.00,'Profitez d\'un séjour placé sous le signe du confort et de la convivialité dans la\n                chambre\n                double de la Villa Modigliani. Spacieuse et élégamment décorée, elle est idéale pour un voyage en\n                couple, entre\n                amis ou pour un déplacement professionnel à deux. Elle dispose d\'un lit double confortable ou de deux\n                lits\n                simples selon vos préférences, d\'une salle de bains privative, d\'une connexion Wi-Fi gratuite, d\'une\n                télévision\n                à écran plat, d\'un espace de travail et de nombreux équipements pensés pour votre bien-être. Grâce à son\n                ambiance paisible et à son emplacement privilégié au cœur de Paris, vous pourrez découvrir facilement\n                les plus\n                beaux quartiers de la capitale tout en profitant d\'un cadre reposant. La Villa Modigliani vous garantit\n                un\n                séjour alliant charme, confort et qualité de service.','assets/Images/chambres/villa-modigliani/chambre-privilege-2pax-wep.webp'),('C001','H004','101','double',2,450.00,'Élégante et lumineuse, cette chambre double offre un cadre confortable avec un lit queen ou king size, \n    une salle de bains en marbre et un espace de travail. Sa décoration raffinée et \n    ses équipements modernes permettent de profiter d\'un séjour agréable au cœur de Paris.','assets/Images/chambres/le-grand-voyageurchambre.double.grand.voyageur.webp'),('C001','H005','101','double',2,450.00,'Élégante et lumineuse, cette chambre double offre un cadre confortable avec un lit queen ou king size, \n    une salle de bains en marbre et un espace de travail. Sa décoration raffinée et \n    ses équipements modernes permettent de profiter d\'un séjour agréable au cœur de Paris.','assets/Images/chambres/intercontinental/chambre.double.intercon.webp'),('C001','H006','101','double',2,450.00,'Élégante et lumineuse, cette chambre double offre un cadre confortable avec un lit queen ou king size, \n    une salle de bains en marbre et un espace de travail. Sa décoration raffinée et \n    ses équipements modernes permettent de profiter d\'un séjour agréable au cœur de Paris.',NULL),('C001','H008','101','double',2,220.00,'Moderne et confortable, cette chambre double dispose d\'un lit double ou queen size et\n    offre un espace agréable pour se détendre après une journée dans Paris. \n    Elle bénéficie notamment de la climatisation, du Wi-Fi, d\'une télévision et d\'un espace de travail.',NULL),('C001','H010','101','double',2,500.00,'Cette chambre double associe élégance parisienne et confort contemporain. Elle offre un espace chaleureux avec une literie confortable, une salle de bains soignée et \n    les équipements nécessaires pour profiter pleinement d\'un séjour au cœur de Paris.','assets/Images/chambres/le-scribe/chambre.double.le.scribe.webp'),('C001','H016','101','double',2,1200.00,'Élégante et raffinée, cette chambre double offre un espace confortable et lumineux,\n    avec un lit king size ou deux lits jumeaux. Son décor parisien soigné, sa salle de bains en marbre \n    et ses équipements haut de gamme assurent un séjour placé sous le signe du confort et de l\'élégance.','assets/Images/chambres/georges-V/chambre.double.georges.webp'),('C002','H001','102','Triple',3,180.00,'Offrez-vous une expérience encore plus raffinée avec la Chambre Double Deluxe de la\n                Villa\n                Modigliani. Plus spacieuse et élégamment aménagée, elle est idéale pour les voyageurs en quête de\n                confort, de\n                sérénité et de prestations de qualité. Dotée d\'un grand lit double confortable, d\'une salle de bains\n                privative\n                moderne, d\'une connexion Wi-Fi gratuite, d\'une télévision à écran plat, d\'un espace de travail et\n                d\'équipements\n                soigneusement sélectionnés, elle vous garantit un séjour des plus agréables. Son atmosphère chaleureuse\n                et son\n                décor soigné créent un véritable cocon de détente après une journée passée à découvrir les trésors de\n                Paris ou à\n                honorer vos rendez-vous professionnels. Située dans un quartier calme et proche des principaux sites\n                touristiques ainsi que des transports en commun, la Villa Modigliani vous invite à profiter d\'un séjour\n                alliant\n                élégance, confort et qualité de service.','assets/Images/chambres/villa-modigliani/chambre-privilege-3pax-wep.webp'),('C002','H004','102','Triple',3,580.00,'Cette chambre triple propose un espace confortable pouvant accueillir jusqu\'à trois personnes grâce à une literie adaptée et, selon la catégorie, un couchage supplémentaire. \n    Elle combine le charme parisien, une salle de bains en marbre et des équipements modernes.','assets/Images/chambres/le-grand-voyageur/chambre.triple.grand.voyageur.webp'),('C002','H005','102','Triple',3,580.00,'Cette chambre triple propose un espace confortable pouvant accueillir jusqu\'à trois personnes grâce à une literie adaptée et, selon la catégorie, un couchage supplémentaire. \n    Elle combine le charme parisien, une salle de bains en marbre et des équipements modernes.','assets/Images/chambres/intercontinental/chambre.triple.intercon.webp'),('C002','H006','102','Triple',3,580.00,'Cette chambre triple propose un espace confortable pouvant accueillir jusqu\'à trois personnes grâce à une literie adaptée et, selon la catégorie, un couchage supplémentaire. \n    Elle combine le charme parisien, une salle de bains en marbre et des équipements modernes.',NULL),('C002','H008','102','Triple',3,280.00,'Cette chambre triple associe confort et fonctionnalité avec un lit queen size accompagné d\'un couchage supplémentaire. \n    Son aménagement moderne et ses équipements pratiques conviennent aussi bien aux familles qu\'aux petits groupes souhaitant séjourner au cœur de Paris..',NULL),('C002','H010','102','Triple',3,650.00,'Pensée pour accueillir jusqu\'à trois personnes, cette chambre offre un espace confortable et élégant avec une literie adaptée aux séjours en famille \n    ou entre amis. Son atmosphère raffinée s\'inscrit dans l\'esprit historique et parisien de l\'établissement.','assets/Images/chambres/le-scribe/chambre.triple.scribe.webp'),('C002','H016','102','Triple',3,1500.00,'Spacieuse et luxueuse, cette chambre triple peut accueillir jusqu\'à trois personnes grâce à un lit king size \n    ou deux lits jumeaux accompagnés d\'une solution de couchage supplémentaire. \n    Elle offre un cadre raffiné, une salle de bains en marbre et un espace généreux idéal pour un séjour parisien en famille ou entre amis.','assets/Images/chambres/georges-V/chambre.triple.georges.webp'),('C003','H001','103','Quadruple',4,210.00,'Idéale pour les familles ou les groupes d\'amis, la chambre quadruple de la Villa\n	Modigliani\n                offre un espace spacieux et confortable pour partager un agréable séjour au cœur de Paris. Élégamment\n                décorée et\n                parfaitement équipée, elle dispose de quatre couchages confortables, d\'une salle de bains privative,\n                d\'une\n                connexion Wi-Fi gratuite, d\'une télévision à écran plat, d\'un espace de travail ainsi que de nombreux\n                équipements pensés pour votre bien-être. Son ambiance chaleureuse et son cadre calme vous permettront de\n                vous\n                détendre pleinement après une journée de découvertes dans la capitale. Grâce à son emplacement\n                privilégié, à\n                proximité des transports en commun, des restaurants et des principaux sites touristiques, la Villa\n                Modigliani\n                constitue un excellent choix pour profiter de Paris en toute sérénité, tout en bénéficiant d\'un confort\n                optimal\n                et d\'un service de qualité.','assets/Images/chambres/villa-modigliani/chambre-privilege-4pax-wep.webp'),('C003','H004','103','Quadruple',4,700.00,'Idéale pour les familles, cette configuration quadruple peut être aménagée à partir de chambres communicantes ou d\'une suite permettant d\'accueillir plusieurs voyageurs. \n    Elle offre davantage d\'espace, plusieurs couchages et des salles de bains en marbre pour un séjour confortable à Paris.','assets/Images/chambres/le-grand-voyageur/chambre.quadruple.grand.voyageur.webp'),('C003','H005','103','Quadruple',4,700.00,'Idéale pour les familles, cette configuration quadruple peut être aménagée à partir de chambres communicantes ou d\'une suite permettant d\'accueillir plusieurs voyageurs. \n    Elle offre davantage d\'espace, plusieurs couchages et des salles de bains en marbre pour un séjour confortable à Paris.','assets/Images/chambres/intercontinental/chambre.quadruple.intercon.webp'),('C003','H006','103','Quadruple',4,700.00,'Idéale pour les familles, cette configuration quadruple peut être aménagée à partir de chambres communicantes ou d\'une suite permettant d\'accueillir plusieurs voyageurs. \n    Elle offre davantage d\'espace, plusieurs couchages et des salles de bains en marbre pour un séjour confortable à Paris.',NULL),('C003','H008','103','Quadruple',4,340.00,'Spacieuse et fonctionnelle, cette chambre quadruple peut accueillir jusqu\'à quatre personnes grâce à deux lits queen size ou à une combinaison de lit\n    et canapé-lit selon la catégorie. Elle offre un environnement confortable et pratique pour un séjour familial à Paris.',NULL),('C003','H010','103','Quadruple',4,800.00,'Cette chambre spacieuse est adaptée aux séjours jusqu\'à quatre personnes. Elle associe confort, élégance et équipements modernes dans une atmosphère parisienne raffinée, \n    idéale pour une escapade familiale ou un séjour entre amis.','assets/Images/chambres/le-scribe/chambre.quadruple.scribe.webp'),('C003','H016','103','Quadruple',4,1800.00,'Cette chambre familiale offre un cadre luxueux et particulièrement spacieux pour accueillir jusqu\'à quatre personnes. \n    Son aménagement confortable, ses prestations haut de gamme et son élégante décoration parisienne\n    en font un espace adapté aux séjours en famille ou aux petits groupes.','assets/Images/chambres/georges-V/chambre.quadruple.georges.webp');
/*!40000 ALTER TABLE `chambre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel`
--

DROP TABLE IF EXISTS `hotel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel` (
  `hotel` varchar(50) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `nombre_etoiles` int(11) NOT NULL,
  `description` text,
  `adresse` varchar(50) NOT NULL,
  `code_postale` varchar(50) DEFAULT NULL,
  `ville` varchar(50) DEFAULT NULL,
  `pays` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`hotel`),
  UNIQUE KEY `nom` (`nom`),
  UNIQUE KEY `adresse` (`adresse`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel`
--

LOCK TABLES `hotel` WRITE;
/*!40000 ALTER TABLE `hotel` DISABLE KEYS */;
INSERT INTO `hotel` VALUES ('H001','Villa Modigliani',4,'Située dans le quartier animé et culturel de Montparnasse, dans le 14e arrondissement de Paris, la Villa Modigliani\n                est un hôtel 4 étoiles qui séduit par son charme, son confort et son atmosphère paisible. Véritable havre de\n                tranquillité en plein cœur de la capitale, l’établissement offre un cadre idéal pour les voyageurs en quête d’une\n                expérience parisienne à la fois authentique et raffinée.\n            \n                Dès votre arrivée, vous serez accueilli dans un environnement élégant et chaleureux, pensé pour allier esthétique\n                contemporaine et bien-être. L’hôtel se distingue notamment par son magnifique jardin intérieur arboré, un espace\n                rare à Paris où il est agréable de se détendre après une journée de visites, de travail ou de découvertes dans les\n                rues animées de la ville.\n            \n                Récemment rénovée, la Villa Modigliani propose des chambres modernes, lumineuses et parfaitement équipées. Chaque\n                chambre a été conçue pour offrir un confort optimal : literie de qualité, climatisation, connexion Wi-Fi gratuite,\n                télévision à écran plat, espace de travail et salle de bains privative. Les différentes catégories de chambres\n                permettent de répondre aux besoins des voyageurs en solo, des couples, des familles ou des professionnels en\n                déplacement.\n            \n                L’établissement met également à disposition plusieurs services appréciés : un petit-déjeuner buffet varié servi\n                chaque matin, un bar convivial avec terrasse, une réception ouverte 24h/24 ainsi qu’un personnel attentif et\n                disponible pour accompagner les clients tout au long de leur séjour.\n            \n                L’emplacement de la Villa Modigliani constitue l’un de ses principaux atouts. À quelques minutes à pied de la\n                gare Montparnasse\n                , l’hôtel bénéficie d’un accès facile aux transports en commun et aux principaux sites touristiques de Paris. Les\n                visiteurs peuvent rejoindre rapidement le\n                Jardin du Luxembourg, les Catacombes de Paris, le musée Rodin, le Quartier Latin \n                ou encore les nombreux cafés, théâtres et galeries qui font la renommée du quartier de Montparnasse.','13 rue Delambre','75014','Paris','France','assets/Images/Nos-Offres-du-moment/villa-modigliani-wep.webp'),('H002','Le Collectionneur',5,'hôtel 5 étoiles situé près du parc Monceau et des Champs-Élysées. Inspiré du style Art déco, il se\n                    distingue par\n                    son architecture élégante, ses espaces prestigieux et ses prestations haut de gamme, offrant une\n                    expérience\n                    luxueuse au cœur de la capitale parisienne.','51-57 Rue de Courcelles','75008','Paris','France','assets/Images/Nos-Offres-du-moment/le-collectionneur-wep.webp'),('H003','Hyatt Regency Paris Etoile',4,'Un hôtel 4 étoiles emblématique situé près de la Porte Maillot. Reconnaissable à sa tour moderne, il\n                    offre\n                    des vues panoramiques exceptionnelles sur Paris, des chambres contemporaines et des services adaptés\n                    aux\n                    voyageurs d’affaires comme de loisirs.','3 Place du General Koenig','75017','Paris','France','assets/Images/Nos-Offres-du-moment/hyatt-regency-paris-etoile-wep.webp'),('H004','Hôtel des Grands Voyageur',4,'Un hôtel 4 étoiles emblématique situé près de la Porte Maillot. Reconnaissable à sa tour moderne, il\n                    offre\n                    des vues panoramiques exceptionnelles sur Paris, des chambres contemporaines et des services adaptés\n                    aux\n                    voyageurs d’affaires comme de loisirs.','34 Rue de l\'Abbè Gregoire','75006','Paris','France','assets/Images/Nos-Offres-du-moment/hôtel-des-grands-voyageurs-wep.webp'),('H005','Intercontinental Paris Le Grand',5,'Un hôtel de luxe emblématique situé près de l’Opéra Garnier. Réputé pour son architecture\n                        haussmannienne, son\n                        élégance historique et ses services haut de gamme, il offre une expérience raffinée au cœur de\n                        Paris, mêlant\n                        prestige, confort et art de vivre à la française.','2 rue Scribe','75009','Paris','France','assets/Images/intercontinental-paris-le-grand-wep.webp'),('H006','Hyatt Paris Madeleine',5,'Le Hyatt Paris Madeleine est un hôtel 5 étoiles élégant situé dans le 8ᵉ arrondissement de Paris,\n                        à proximité\n                        des Champs-Élysées et de la Madeleine. Il se distingue par son atmosphère intimiste, son design\n                        raffiné et\n                        ses prestations haut de gamme, offrant un cadre luxueux et confortable au cœur de la capitale.','24 Boulevard Malesherbes','75008','Paris','France','assets/Images/hyatt-paris-madeleine-wep.webp'),('H007','Pullman Paris Tour Eiffel',4,'Le Pullman Paris Tour Eiffel est un hôtel contemporain 4 étoiles situé au pied de la Tour Eiffel.\n                        Apprécié\n                        pour son emplacement exceptionnel, ses chambres modernes et ses vues panoramiques sur le\n                        monument, il offre\n                        un cadre confortable et dynamique, idéal pour les séjours touristiques et professionnels à\n                        Paris.','18 Avenue de Suffren','75015','Paris','France','assets/Images/pullman-paris-tour-eiffel-wep.webp'),('H008','Novotel Paris les Halles',4,'Un hôtel 4 étoiles situé au cœur de Paris, à proximité du quartier des Halles et du Louvre.\n                        Moderne et convivial,\n                        il offre des chambres confortables, des espaces adaptés aux séjours professionnels et\n                        touristiques, ainsi qu’un\n                        emplacement idéal pour découvrir les principaux sites de la capitale.','8 Places Marguerite de Navarre','75001','Paris','France','assets/Images/novotel-paris-les-halles-wep.webp'),('H009','Le Paris Marriott Rive Gauche',4,'Un hôtel 4 étoiles situé sur la rive gauche de Paris, près de Montparnasse. Réputé pour ses\n                        vastes espaces de\n                        conférence, son confort moderne et son accessibilité, il constitue un choix privilégié pour les\n                        voyageurs\n                        d’affaires et les visiteurs souhaitant découvrir la capitale.','17 Boulevard Saint-Jacques','75014','Paris','France','assets/Images/marriott-paris-rive-gauche-wep.webp'),('H010','Sofitel Le Scribe Paris Opéra',5,'Un hôtel 5 étoiles situé à deux pas de l’Opéra Garnier. Alliant élégance haussmannienne et\n                        confort contemporain,\n                        il offre une atmosphère raffinée, des prestations haut de gamme et une expérience parisienne\n                        prestigieuse au\n                        cœur du quartier de l’Opéra.','1 Rue Scribe','75009','Paris','France','assets/Images/le-scribe-wep.webp'),('H011','Le Meridien',4,'Un hôtel 4 étoiles situé dans le 17ᵉ arrondissement de Paris, près de la Porte Maillot. Moderne\n                        et\n                        fonctionnel, il est particulièrement apprécié pour ses grandes capacités d’accueil, son ambiance\n                        contemporaine et sa proximité avec le Palais des Congrès, en faisant un lieu adapté aux séjours\n                        professionnels et aux événements.','81 Boulevard Gouvion-Saint-Cyr','75017','Paris','France','assets/Images/le-meridien-wep.webp'),('H012','Le Renaissance Paris Nobel Tour Eiffel',5,'Un hôtel 5 étoiles situé dans le 16ᵉ arrondissement de Paris, à proximité du Trocadéro. Installé\n                        dans un ancien\n                        hôtel particulier entouré d’un jardin, il combine charme historique et design contemporain,\n                        offrant un cadre\n                        élégant et paisible au cœur de la capitale.','55-57 Avenue Raymont Poincarré','75116','Paris','France','assets/Images/paris-nobel-wep.webp'),('H013','Le Crowne Plaza Paris Republique',4,'Un hôtel 4 étoiles situé sur la place de la République, au cœur de Paris. Installé dans un\n                        bâtiment historique,\n                        il propose des chambres modernes et confortables, ainsi qu’un accès facile aux principaux\n                        quartiers touristiques\n                        et d’affaires de la capitale.','10 Place de la Republique','75011','Paris','France','assets/Images/crowne-plaza-wep.webp'),('H014','Drawing House',4,'Un hôtel 4 étoiles situé dans le quartier de Montparnasse. Moderne et créatif, il se distingue\n                        par son concept\n                        artistique autour du dessin, ses espaces design et son ambiance contemporaine, offrant une\n                        expérience originale\n                        et confortable au cœur de Paris.','21 rue Vercingétorix','75014','Paris','France','assets/Images/drawing-house-wep.webp'),('H015','Le Jardins du Marais',4,'Un hôtel 4 étoiles situé dans le quartier du Marais à Paris. Organisé autour d’un vaste\n                        patio-jardin, il propose\n                        des suites et chambres élégantes dans un cadre calme et raffiné, tout en restant au cœur d’un\n                        des quartiers les\n                        plus animés et historiques de la capitale.','74 Rue Amelot','75011','Paris','France','assets/Images/les-jardins-du-marais-wep.webp'),('H016','Four Seasons Hôtel Geaorge V',5,'Un palace 5 étoiles situé à deux pas des Champs-Élysées. Célèbre pour son luxe exceptionnel, son\n                        service\n                        irréprochable et ses restaurants étoilés, il incarne l’excellence de l’hôtellerie parisienne\n                        dans un cadre\n                        somptueux et raffiné.','31 Avenue Georges V','75008','Paris','France','assets/Images/four-seasons-wep.webp');
/*!40000 ALTER TABLE `hotel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paiement`
--

DROP TABLE IF EXISTS `paiement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paiement` (
  `paiement` varchar(50) NOT NULL,
  `montant` decimal(15,2) NOT NULL,
  `date_paiement` date DEFAULT NULL,
  `statut` varchar(50) NOT NULL,
  `moyen_paiement` varchar(50) NOT NULL,
  `reservation` varchar(50) NOT NULL,
  PRIMARY KEY (`paiement`),
  UNIQUE KEY `reservation` (`reservation`),
  UNIQUE KEY `montant` (`montant`),
  CONSTRAINT `paiement_ibfk_1` FOREIGN KEY (`reservation`) REFERENCES `reservation` (`reservation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paiement`
--

LOCK TABLES `paiement` WRITE;
/*!40000 ALTER TABLE `paiement` DISABLE KEYS */;
INSERT INTO `paiement` VALUES ('P001',1200.00,'2026-10-01','en cours','CB','R001'),('P002',240.00,'2026-09-29','accepté','CB','R002'),('P003',450.00,'2026-09-30','en cours','CB','R003'),('P004',360.00,'2026-09-28','accepté','CB','R005'),('P005',280.00,'2026-09-29','refusé','CB','R004');
/*!40000 ALTER TABLE `paiement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservation` (
  `reservation` varchar(50) NOT NULL,
  `date_arrivee` date NOT NULL,
  `date_depart` date NOT NULL,
  `nombre_adulte` int(11) NOT NULL,
  `nombre_enfant` int(11) NOT NULL,
  `montant_total` decimal(15,2) NOT NULL,
  `statut` varchar(50) NOT NULL,
  `chambre` varchar(50) NOT NULL,
  `hotel` varchar(50) NOT NULL,
  `utilisateurs` varchar(50) NOT NULL,
  PRIMARY KEY (`reservation`),
  UNIQUE KEY `date_arrivee` (`date_arrivee`),
  UNIQUE KEY `date_depart` (`date_depart`),
  KEY `chambre` (`chambre`,`hotel`),
  KEY `utilisateurs` (`utilisateurs`),
  CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`chambre`, `hotel`) REFERENCES `chambre` (`chambre`, `hotel`),
  CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`utilisateurs`) REFERENCES `utilisateur` (`utilisateurs`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservation`
--

LOCK TABLES `reservation` WRITE;
/*!40000 ALTER TABLE `reservation` DISABLE KEYS */;
INSERT INTO `reservation` VALUES ('R001','2027-01-12','2027-01-13',2,0,1200.00,'reserver','C001','H016','U001'),('R002','2026-12-10','2026-12-12',2,0,240.00,'reserver','C002','H001','U002'),('R003','2026-12-13','2026-12-14',2,0,450.00,'reserver','C002','H006','U002'),('R004','2026-11-01','2026-11-02',2,1,280.00,'reserver','C003','H008','U003'),('R005','2026-10-28','2026-10-29',2,0,360.00,'reserver','C001','H008','U004'),('R006','2026-10-25','2026-10-26',2,1,500.00,'en cours de traitement','C001','H010','U005'),('R007','2026-11-14','2026-11-15',2,0,360.00,'en cours de traitement','C001','H008','U006');
/*!40000 ALTER TABLE `reservation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utilisateur` (
  `utilisateurs` varchar(50) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mot_de_passe` varchar(50) NOT NULL,
  `telephone` varchar(50) NOT NULL,
  PRIMARY KEY (`utilisateurs`),
  UNIQUE KEY `mot_de_passe` (`mot_de_passe`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utilisateur`
--

LOCK TABLES `utilisateur` WRITE;
/*!40000 ALTER TABLE `utilisateur` DISABLE KEYS */;
INSERT INTO `utilisateur` VALUES ('U001','Dupont','Jean','jean.dupont@gmail.com','MotDePasse123','0612345678'),('U002','Martin','Sophie','sophie.martin@gmail.com','Sophie2026','0623456789'),('U003','Bernard','Thomas','thomas.bernard@gmail.com','Thomas2026','0678901234'),('U004','Corentin','Verheyde','corentin.v@gmail.com','coco2026','0615874965'),('U005','Marie','Monte','marie.monte@gmail.com','Marie5946','0656849578'),('U006','Damiens','François','damien.f@gmail.com','toto1234','0632857469');
/*!40000 ALTER TABLE `utilisateur` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-06 19:12:49
