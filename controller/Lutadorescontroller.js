const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const LutadorModel = require("../model/Lutador");

router.get('/lutadores', async function(req, res) {
    try {
        const dados = await LutadorModel.findAll();
        res.render('lutadores/mostraLutadores', { dadosLutador: dados });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro interno do servidor');
    }
});

router.get('/inscricao', function(req, res) {
    res.render('lutadores/formLutadores');
});

router.post('/inscricao', function(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                throw new Error('Erro ao fazer o upload da imagem.');
            }

            // Verificar se o campo 'imagem' está presente
            if (!files || !files.imagem) {
                throw new Error('Campo de imagem ausente.');
            }

            const oldpath = files.imagem.path;
            const hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
            const ext = path.extname(files.imagem.name);
            const nomeimg = hash + ext;
            const newpath = path.join(__dirname, '../public/imagens/', nomeimg);

            fs.renameSync(oldpath, newpath);

            const resultadoCadastro = await LutadorModel.create({
                nome: fields['nome'][0],
                nomeLuta: fields['nome_luta'][0],
                idade: fields['idade'][0],
                peso: fields['peso'][0],
                imagem: nomeimg
            });

            res.redirect('/lutadores');
        } catch (error) {
            console.error(error);
            res.status(500).send('Erro interno do servidor');
        }
    });
});

// Outras rotas para edição, exclusão, etc.

module.exports = router;
