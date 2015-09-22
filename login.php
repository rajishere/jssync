<?php
            session_start();
            $errorMessage = "";
            if (isset($_SESSION['errorMessage'])) {
	           // not logged in
                $errorMessage = $_SESSION['errorMessage'];
                unset($_SESSION['errorMessage']);
            }
?>
<!DOCTYPE html>
<html>
    <head>
        <script src='https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'></script>
        <script>
            // Read a page's GET URL variables and return them as an associative array.
            function getUrlVars()
            {
                var vars = [], hash;
                var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
                for(var i = 0; i < hashes.length; i++)
                {
                    hash = hashes[i].split('=');
                    vars.push(hash[0]);
                    vars[hash[0]] = hash[1];
                }
                return vars;
            }
            var redirectURL = getUrlVars()["redirect"];
            if(!redirectURL){
                redirectURL = "purchasebill.php";
            }

            
            $(document).ready(function(){
                $('#redirectInput').val(redirectURL);
            });
        </script>
    </head>
    <body>
        <table width="300" border="0" align="center" cellpadding="0" cellspacing="1" bgcolor="#CCCCCC">
            <tr>
                <form name="form1" method="post" action="checklogin.php">
                    <input type="hidden" name="redirect" id="redirectInput" value="purchasebill.php">
                    <td>
                        <table width="100%" border="0" cellpadding="3" cellspacing="1" bgcolor="#FFFFFF">
                            <tr>
                                <td colspan="3"><strong>Member Login </strong></td>
                            </tr>
                            <tr>
                                <td width="78">Username</td>
                                <td width="6">:</td>
                                <td width="294"><input name="myusername" type="text" id="myusername"></td>
                            </tr>
                            <tr>
                                <td>Password</td>
                                <td>:</td>
                                <td><input name="mypassword" type="text" id="mypassword"></td>
                            </tr>
                            <tr>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td><input type="submit" name="Submit" value="Login"></td>
                            </tr>
                            <tr style="line-height:1.4em">
                                <?php
                                    echo $errorMessage;
                                ?>
                            </tr>
                        </table>
                    </td>
                </form>
            </tr>
        </table>
    </body>
</html>