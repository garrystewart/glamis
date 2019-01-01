<?php
$myfile = fopen("../data/dvd.json", "w") or die("Unable to open file!");
$txt = $_POST["json"];
echo var_dump($_POST);
fwrite($myfile, $txt);
fclose($myfile);
?>