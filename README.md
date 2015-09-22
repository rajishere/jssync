# jssync

JS Sync is a simple Java script framework that syncs data between an HTML app and an PHP + MySQL based server system both. It is aimed to work both online or offline.

Steps to start working

Prerequesites
1. Server with PHP + MySQL
2. Browsers that support HTML 5 (local storage and Offline Manifests)
3. All tables are expected to have following fields as a minimum
    a. guid - VARCHAR (45)
    b. lastModifiedDatetime - VARCHAR (12)
    c. lastModifiedById - VARCHAR (45)
    d. isDeleted - VARCHAR (5)
4. Create a table users with following statement
	CREATE TABLE `users` (
	  `guid` varchar(45) DEFAULT NULL,
	  `email` varchar(255) DEFAULT NULL,
	  `pword` varchar(255) DEFAULT NULL,
	  `lastModifiedDatetime` varchar(12) DEFAULT NULL,
	  `lastModifiedById` varchar(45) DEFAULT NULL,
	  `isDeleted` varchar(5) DEFAULT 'false'
	) ENGINE=InnoDB DEFAULT CHARSET=latin1;
5. For test purpose, you can create a sample table
	CREATE TABLE `test` (
	  `guid` varchar(45) DEFAULT NULL,
	  `dataOne` varchar(255) DEFAULT NULL,
	  `dataTwo` varchar(255) DEFAULT NULL,
	  `lastModifiedDatetime` varchar(12) DEFAULT NULL,
	  `lastModifiedById` varchar(45) DEFAULT NULL,
	  `isDeleted` varchar(5) DEFAULT 'false'
	) ENGINE=InnoDB DEFAULT CHARSET=latin1;

Get Started
1. Place files in framework folder at you website root. Brief description of various files
    a. checkLogin.php, login.php, logout.php: Used for login, logout and to set tge session variables
    b. api/db.php: Handles the db interactions at higher level
    c. api/dbBase.php: Handles the db interactions at lower level. Modify the user connection details in this file
2. api/notify.php: Used by client to know about db changes
3. js/jquery.checknet-1.6.min.js: Used by client to know about internet status.
4. sync/sync.js: Used for client CRUD actions
