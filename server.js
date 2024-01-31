const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const anasayfaIcerik = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Anasayfa</title>
    </head>
    <body>
        <div id="kullaniciDurumu"></div>

        <script src="https://cdn.socket.io/4.0.1/socket.io.min.js"></script>
        <script>
            const socket = io();

            socket.on('baglantiMesaji', function () {
                document.getElementById('kullaniciDurumu').innerHTML = 'Client bağlandı';
            });

            socket.on('ayrilmaMesaji', function () {
                document.getElementById('kullaniciDurumu').innerHTML = 'Client ayrıldı';
            });

            document.addEventListener('mousemove', function (event) {
                const koordinatlar = {
                    x: event.clientX,
                    y: event.clientY
                };

                socket.emit('mouseKoordinatlari', koordinatlar);
            });

            document.addEventListener('keypress', function (event) {
                const keyInfo = {
                    key: event.key,
                    code: event.code,
                };

                socket.emit('klavyeBilgisi', keyInfo);
            });
        </script>
    </body>
    </html>
`;

app.get('/', (req, res) => {
    res.send(anasayfaIcerik);
});

io.on('connection', (socket) => {
    console.log('Client bağlandı');
    socket.emit('baglantiMesaji');

    socket.on('disconnect', () => {
        console.log('Client ayrıldı');
        socket.emit('ayrilmaMesaji');
    });

    socket.on('mouseKoordinatlari', (koordinatlar) => {
        console.log('Mouse Koordinatları:', koordinatlar);
        socket.emit('Mouse Koordinatları:', koordinatlar);

        fs.appendFile('mouse_koordinatlari.txt', JSON.stringify(koordinatlar) + '\n', (err) => {
            if (err) throw err;
            console.log('Koordinatlar kaydedildi.');
        });
    });

    socket.on('klavyeBilgisi', (data) => {
        console.log('Klavye Bilgisi:', data);
        socket.emit('Klavye Bilgisi:', data);

        fs.appendFile('klavye_bilgisi.txt', `Tuş: ${data.key}, Kod: ${data.code}\n`, (err) => {
            if (err) throw err;
            console.log('Klavye bilgisi kaydedildi.');
        });
    });
});

const port = 2020;
server.listen(port, () => {
    console.log(` http://localhost:${port} adresinde çalışıyor`);
});
