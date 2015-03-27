<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
"http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns='http://www.w3.org/1999/xhtml'>
<HEAD>
<TITLE> VoI Survey </TITLE>
</HEAD>
<BODY style="background-color:#FAEBD7">

<?php  
$filename = "F:\\VOI Results\\".uniqid("voi_");
$filename .= ".txt";
$result = fopen($filename, "x");
 
if (!$result) {
    print("<br>Could not create file.");
    exit;
}

fputs($result,"Name: ");
fputs($result, $_POST['name']);
fputs($result,PHP_EOL);
fputs($result,"Email: ");
fputs($result, $_POST['email']);
fputs($result, PHP_EOL);
fputs($result,"MOS: ");
fputs($result, $_POST['mos']);
fputs($result, PHP_EOL);
fputs($result,"Years of Service: ");
fputs($result, $_POST['YoS']);
fputs($result, PHP_EOL);
fputs($result,"Number of Deployments: ");
fputs($result, $_POST['NoD']);
fputs($result, PHP_EOL);
fputs($result,"Date(ZULU): ".Date("r"));
fputs($result, PHP_EOL);
fputs($result, PHP_EOL);
fputs($result, $_POST['data']);

print("Thanks you for completing our VoI survey.");
fclose($result);

?>


</BODY>
</html>
