<?php
$input = file_get_contents('php://input');
$data = json_decode($input, true);
if (!$data || !is_array($data)) {
  $data = $_POST;
}
$target = getenv('WEBHOOK_URL');
if (!$target || !filter_var($target, FILTER_VALIDATE_URL)) {
  $target = 'https://hook.us1.make.com/j3f0pfymobfhtpsldmlw6hn3plmb9p5k';
}
$ch = curl_init($target);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json','User-Agent: CarInjuryClinic-Website/1.0']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
$resp = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
$ok = $http >= 200 && $http < 300;
http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['success'=>true,'webhook_status'=>$ok?'success':'warning','code'=>$http]);