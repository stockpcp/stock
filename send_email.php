<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nome = htmlspecialchars($_POST['nome']);
    $email = htmlspecialchars($_POST['email']);
    $mensagem = htmlspecialchars($_POST['mensagem']);

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'sender.skymail.net.br'; // ou sender.emailemnuvem.com.br
        $mail->SMTPAuth   = true;
        $mail->Username   = 'notreturn@repinho.ind.br';
        $mail->Password   = 'Qs3Nk6Xp';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Para porta 465
        $mail->Port       = 465;

        $mail->setFrom('notreturn@repinho.ind.br', $nome);
        $mail->addAddress('t.rogato@gmail.com', 'Comercial Repinho');

        $mail->isHTML(true);
        $mail->Subject = 'Novo Pedido de Orçamento';
        $mail->Body    = "<h2>Detalhes do Pedido</h2>
                         <p><b>Nome:</b> $nome</p>
                         <p><b>E-mail:</b> $email</p>
                         <p><b>Mensagem:</b><br>$mensagem</p>";

        $mail->send();
        echo 'Mensagem enviada com sucesso!';
    } catch (Exception $e) {
        echo "A mensagem não pôde ser enviada. Erro: {$mail->ErrorInfo}";
    }
}
?>
