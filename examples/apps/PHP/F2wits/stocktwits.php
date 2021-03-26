<?php 
    //http://stocktwits.com/developers/docs/api#streams-symbol-docs

    header('Content-type: application/json');

    $arrContextOptions=array(
        "ssl"=>array(
            "verify_peer"=>false,
            "verify_peer_name"=>false,
        ),
    );  

    //Looks like the below URL is now looking for token based authentication.
    echo file_get_contents('https://api.stocktwits.com/api/2/streams/symbol/' .$_GET['symbol']. '.json', false, stream_context_create($arrContextOptions));
?>