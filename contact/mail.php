<?php
$to = "m7jbftk7@robot.zapier.com"; // емайл получателя данных из формы
$tema = "Заявка с сайта wisdomsolutions.online"; // тема полученного емайла
$message = "Имя: ".$_POST['Name']."<br>";//присвоить переменной значение, полученное из формы name=name
$message .= "Сообщение: ".$_POST['Message']."<br>"; //полученное из формы name=message
$message .= "Контакты для связи: ".$_POST['Contact']."<br>"; //полученное из формы name=email
$headers  = 'MIME-Version: 1.0' . "\r\n"; // заголовок соответствует формату плюс символ перевода строки
$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n"; // указывает на тип посылаемого контента
mail($to, $tema, $message, $headers); //отправляет получателю на емайл значения переменных
?>
