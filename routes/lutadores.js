const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const con = require('../db'); // Substitua pelo caminho correto

// Rota para a página de lutadores
router.get('/', async (req, res) => {
    try {
        const [rows, fields] = await con.query('SELECT * FROM lutadores');
        res.render('GerenciadorLutadores', { lutadores: rows });
    } catch (error) {
        console.error('Erro ao obter lutadores do banco de dados:', error);
        res.status(500).send('Erro interno do servidor: ' + error.message);
    }
});

router.post('/', (req, res) => {
    // Lógica para lidar com o formulário de postagem, se necessário
    res.render('GerenciadorLutadores');
});

module.exports = router;
