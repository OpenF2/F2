<?php 
    //http://stocktwits.com/developers/docs/api#streams-symbol-docs

    header('Content-type: application/json');

    echo file_get_contents('https://api.stocktwits.com/api/2/streams/symbol/' .$_GET['symbol']. '.json');
?>