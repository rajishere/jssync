<?php
    include('dbBase.php');

  $data = json_decode($_GET["data"]);
  $object = $data->{'object'};
  if($object){
    
    $lastmodif = is_null($data->{'timestamp'}) ? time() : $data->{'timestamp'};

    connectToDB();
    $where = " lastModifiedDatetime >= " . $lastmodif;

    $count = fetchCountWithClause($object, $where);
    while ($count < 1) // check if the data file has been modified
    {
      usleep(10000); // sleep 10ms to unload the CPU
      clearstatcache();
      $count = fetchCountWithClause($object, $where);
    }
 
    // return a json array
    fetchObjectWithClause($object, $where);

    flush();
  }
  else{
    print_r(errorParsingJSON());
  }
?>