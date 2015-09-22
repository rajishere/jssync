<?php
    
    include('api/dbBase.php');
    $con = connectToDB();
    $tbl_name="users";

    // username and password sent from form 
    $myusername = $_POST['myusername']; 
    $mypassword = $_POST['mypassword']; 
    $redirect = $_POST['redirect']; 
    
    // To protect MySQL injection (more detail about MySQL injection)
    $myusername = stripslashes($myusername);
    $mypassword = stripslashes($mypassword);
    $myusername = $con->real_escape_string($myusername);
    $mypassword = $con->real_escape_string($mypassword);
    
    $count = fetchCountWithClause($tbl_name, " email='$myusername' and pword='$mypassword'");
    
    // If result matched $myusername and $mypassword, table row must be 1 row
    session_start(); 
    if($count==1){
        
        // Register $myusername
        $_SESSION['user'] = $myusername; 

        // Load user id and register
        $rows = queryData('Select guid from '. $tbl_name . " where email='$myusername' and pword='$mypassword'");
        $guid = $rows[0]['guid'];
        $_SESSION['userId'] = $guid;
         
        header("location:" . $redirect);
        exit();
    }
    else {
        $_SESSION['errorMessage'] = "Wrong Username or Password"; 
        header("location:login.php");
        exit();
    }
?>