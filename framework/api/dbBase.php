<?php
    // Util functions
    function getGUID(){
        if (function_exists('com_create_guid')){
            return com_create_guid();
        }else{
            mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
            $charid = strtoupper(md5(uniqid(rand(), true)));
            $hyphen = chr(45);// "-"
            //chr(123)// "{"//chr(125);// "}"
            $uuid = ""
                .substr($charid, 0, 8).$hyphen
                .substr($charid, 8, 4).$hyphen
                .substr($charid,12, 4).$hyphen
                .substr($charid,16, 4).$hyphen
                .substr($charid,20,12)
                ."" ;
            return $uuid;
        }
    }


    $errorConnectingDB = "{\"error\":{\"code\": 1, \"message\": \"error connecting to DB\"}}";
//     $errorParsingJSON = "{\"error\":{\"code\": 2, \"message\": \"error parsing data JSON\"}}";
    
    function errorParsingJSON(){
        switch (json_last_error()) {
            case JSON_ERROR_NONE:
                return "{\"error\":{\"code\": 2, \"message\": \"error parsing data JSON\", \"detail\": \" - No errors\"}}";
            break;
            case JSON_ERROR_DEPTH:
                return "{\"error\":{\"code\": 2, \"message\": \"error parsing data JSON\", \"detail\": \" - Maximum stack depth exceeded\"}}";
            break;
            case JSON_ERROR_STATE_MISMATCH:
                return "{\"error\":{\"code\": 2, \"message\": \"error parsing data JSON\", \"detail\": \" - Underflow or the modes mismatch\"}}";
            break;
            case JSON_ERROR_CTRL_CHAR:
                return "{\"error\":{\"code\": 2, \"message\": \"error parsing data JSON\", \"detail\": \" - Unexpected control character found\"}}";
            break;
            case JSON_ERROR_SYNTAX:
                return "{\"error\":{\"code\": 2, \"message\": \"error parsing data JSON\", \"detail\": \" - Syntax error, malformed JSON\"}}";
            break;
            case JSON_ERROR_UTF8:
                return "{\"error\":{\"code\": 2, \"message\": \"error parsing data JSON\", \"detail\": \" - Malformed UTF-8 characters, possibly incorrectly encoded\"}}";
            break;
            default:
                return "{\"error\":{\"code\": 2, \"message\": \"error parsing data JSON\", \"detail\": \" - Unknown error\"}}";
            break;
        }
    }

    $con;
    
    // These columns make the system tick
    $systemColumns = ["guid", "lastModifiedById", "lastModifiedDatetime", "isDeleted"];
    
    function connectToDB(){
        global $con;
        $server = 'localhost';
        $user = 'MySQL username here';
        $pass = 'MySQL password here';
        $dbname = 'MySQL database to select';
        $con = mysqli_connect($server, $user, $pass) or die("Can't connect");
        mysqli_select_db($con, $dbname);
        return $con;
    }

    function printJSONData($rows){
        print json_encode($rows);
    }
    
    function runQuery($query){
        global $con;
        if($sth = mysqli_query($con, $query)){
            return true;
        }
        else{
            var_dump($con->error);
        }
    }

    function queryData($query){
        global $con;
        if($sth = mysqli_query($con, $query)){
            $rows = array();
            while($r = mysqli_fetch_assoc($sth)) {
                $rows[] = $r;
            }
            return $rows;
        }
        else{
            var_dump($con->error);
        }
    }

    function fetchCountWithClause($tableName, $where){
        global $con;
        if(strcmp($tableName, "users") == 0){
            $query = "select count(guid) as count from users where " . $where . " and isDeleted='false';"; 
        }
        else{
            $query = "select count(guid) as count from " . $tableName . " where " . $where . " and isDeleted='false';"; 
        }

        $rows = queryData($query);
        $count = $rows[0]['count'];

        if(!$con->error){
            return $count;
        }
        else{
            return 0;
        }
    }

    function fetchObjectWithClause($tableName, $where, $includeDeleted = false){
        global $con;
        if(strcmp($tableName, "users") == 0){
            $query = "select guid, email, lastModifiedDatetime, lastModifiedById from users where " . $where . (($includeDeleted) ? ";" : " and isDeleted='false';");
        }
        else{
            $query = "select * from " . $tableName . " where " . $where . (($includeDeleted) ? ";" : " and isDeleted='false';"); 
        }

        $rows = queryData($query);
        if(!$con->error){
            printJSONData($rows);
        }
    }

    function fetchObject($tableName, $includeDeleted = false){
        global $con;
        if(strcmp($tableName, "users") == 0){
            $query = "select guid, email, lastModifiedDatetime, lastModifiedById from users " . (($includeDeleted) ? ";" : " where isDeleted='false';"); 
        }
        else{
            $query = "select * from " . $tableName . (($includeDeleted) ? ";" : " where isDeleted='false';"); 
        }

        $rows = queryData($query);
        if(!$con->error){
            printJSONData($rows);
        }
    }

    function insertObject($userId, $tableName, $values){
        global $con;
        global $systemColumns;

        $values_array = json_decode($values, true);
        
        foreach ($systemColumns as $systemColumn){
            unset($values_array[$systemColumn]);
        }
        foreach($values_array as $key => $value){
            $sql[] = (is_numeric($value)) ? "$key = $value" : "$key = '" . $con->real_escape_string($value) . "'"; 
        }
        $guid = getGUID();
        $lastModifiedDatetime = time();
        $lastModifiedById = $userId;
        $isDeleted = "false";
        array_push($sql, "guid = '$guid'", "lastModifiedDatetime = '$lastModifiedDatetime'", "lastModifiedById = '$lastModifiedById'", "isDeleted = '$isDeleted'");
        $sqlclause = implode(",",$sql);

        $query = "INSERT INTO $tableName SET $sqlclause;";
        if(runQuery($query)){
            fetchObjectWithClause($tableName, "guid = '" . $guid . "'");
        }
    }

    function updateObject($userId, $tableName, $values, $where){
        global $con;
        global $systemColumns;

        $values_array = json_decode($values, true);
        
        foreach ($systemColumns as $systemColumn){
            unset($values_array[$systemColumn]);
        }
        foreach($values_array as $key => $value){
            $sql[] = (is_numeric($value)) ? "$key = $value" : "$key = '" . $con->real_escape_string($value) . "'"; 
        }
        
        $lastModifiedDatetime = time();
        $lastModifiedById = $userId;
        
        array_push($sql, "lastModifiedDatetime = '$lastModifiedDatetime'", "lastModifiedById = '$lastModifiedById'");
        $sqlclause = implode(",",$sql);
        
        $query = "UPDATE $tableName SET $sqlclause Where " . $where . " AND isDeleted = 'false';";
//         echo $query;
        if(runQuery($query)){
            fetchObjectWithClause($tableName, $where);
        }
    }

    function deleteObject($tableName, $guid){
        global $con;
        
        $query = "UPDATE $tableName SET isDeleted = 'true' WHERE guid = '$guid' ;";

        if(runQuery($query)){
            echo '{"status":{"code":1, "message":"success"}}';
        }
    }
?>