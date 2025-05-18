<?php
header('Content-Type: application/json');

$data = [
    'ip' => $_SERVER['REMOTE_ADDR'],
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
    'language' => $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? 'Unknown',
    'protocol' => $_SERVER['SERVER_PROTOCOL'],
    'method' => $_SERVER['REQUEST_METHOD'],
    'random_fact' => getRandomFact(),
    'timestamp' => date('Y-m-d H:i:s')
];

function getRandomFact() {
    $facts = [
        "Ваш IP состоит из 4 чисел от 0 до 255",
        "Средняя скорость интернета в мире - 32 Мбит/с",
        "Первый сайт создан в 1991 году",
        "Ваш браузер: " . ($_SERVER['HTTP_SEC_CH_UA'] ?? 'Unknown'),
        "Сегодня " . date('d.m.Y'),
        "Вы используете " . ($_SERVER['REQUEST_METHOD'] === 'GET' ? 'GET' : 'другой метод')
    ];
    return $facts[array_rand($facts)];
}

echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>