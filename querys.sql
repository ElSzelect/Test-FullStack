-- Escribe tus querys acá

SELECT c.email FROM client c
JOIN client_report cr ON c.client_id = cr.client_id
JOIN report r ON cr.report_id = r.report_id
JOIN payment p ON r.payment_id = p.payment_id

WHERE p.payment_gateway = 'transbank'
GROUP BY c.client_id
HAVING COUNT(r.report_id) > 1;

SELECT * FROM report r
WHERE r.report_id IN (SELECT cr.report_id
             FROM client_report cr
             WHERE cr.client_id = (SELECT c.client_id
                                 FROM client c
                                 WHERE c.email = 'juan_daniel@gmail.com')
                     );

--Se requiere el correo de todos los clientes que hayan comprado más de un informe a la vez mediante la pasarela de pago 'transbank'.
--Devuelve todos los informes comprados que han sido entregados al cliente juan_daniel@gmail.com sin utilizar JOIN.