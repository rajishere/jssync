<?php
    include('dbBase.php');
    
    $sufficientValuesWereNotSupplied = "{\"error\":{\"code\": 3, \"message\": \"Sufficient parameters were not supplied\"}}";
    $loginRequired = "{\"error\":{\"code\": 4, \"message\": \"Login needed\"}}";

    session_start();
    if (!isset($_SESSION['user'])) {
   		// not logged in
   		echo $loginRequired;
        exit();
 	}

    $userId = $_SESSION['userId'];

    $data = json_decode($_GET["data"]);
    if($data){
        $action = $data->{'action'};
        if($action){
            if($action == "fetch"){
                $object = $data->{'object'};
                $where = $data->{'where'};
                $includeDeleted = is_null($data->{'includeDeleted'})? false: (($data->{'includeDeleted'} == "true")? true: false);
                if($object){
                    connectToDB();

                    if($where){
                        fetchObjectWithClause($object, $where, $includeDeleted);
                    }
                    else{
                        fetchObject($object, $includeDeleted);
                    }
                }
                else{
                    echo $sufficientValuesWereNotSupplied;
                }
            }
            else if($action == "insert"){
                $object = $data->{'object'};
                $values = $data->{'values'};
                if($object && $values){
                    connectToDB();
                    insertObject($userId, $object, $values);
                }
                else{
                    echo $sufficientValuesWereNotSupplied;
                }
            }
            else if($action == "update"){
                $object = $data->{'object'};
                $values = $data->{'values'};
                $where = $data->{'where'};
                if($object && $values && $where){
                    connectToDB();
                    updateObject($userId, $object, $values, $where);
                }
                else{
                    echo $sufficientValuesWereNotSupplied;
                }
            }
            else if($action == "delete"){
                $object = $data->{'object'};
                $guid = $data->{'guid'};
                if($object && $guid){
                    connectToDB();
                    deleteObject($object, $guid);
                }
                else{
                    echo $sufficientValuesWereNotSupplied;
                }
            }
        }
    }
    else{
        print_r(errorParsingJSON());
    }
?>