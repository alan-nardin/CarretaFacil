var sqlite3 = require('sqlite3').verbose();
var path = require('path');
var express = require('express');

var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');

var dbPath = path.resolve(__dirname, 'database.db');
var db = new sqlite3.Database(dbPath);
var app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

db.serialize(function(){

    var comando = `
        CREATE TABLE IF NOT EXISTS Transmissor(
            Placa TEXT NOT NULL UNIQUE,
            Bateria INTEGER,
            Latitude REAL,
            Longitude REAL,
            DataHora DATETIME
        );
    `;

    db.run(comando);
});

app.post('/api/registrar', function(req, res){

    var comando = `
        REPLACE INTO Transmissor (Placa, Bateria, Latitude, Longitude, DataHora)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    var resultado = function(err, row){
        if(err) throw err;

        res.status(200)
           .json({mensagem: 'Transmissor atualizado com sucesso'})
           .end();
    };

    db.run(
        comando,         
        req.body.placa,
        req.body.bateria,
        req.body.latitude,
        req.body.longitude, 
        resultado);
});

app.get('/api/listar', function(req, res){

    db.all('SELECT * FROM Transmissor', function(err, rows){
        if(err) throw err;

        res.json(rows);
        res.end();
    });
});

app.delete('/api/:placa', function(req, res){

    var placa = req.param("placa");
    
    var resultado = function(err, row){
        if(err) throw err;

        res.status(200)
           .json({mensagem: 'Transmissor removido com sucesso'})
           .end();
    };

    db.run('DELETE FROM Transmissor WHERE Placa = ?', placa, resultado);

})

app.listen(3000, function(){
    console.log('Access http://localhost:3000/api-docs');
});

