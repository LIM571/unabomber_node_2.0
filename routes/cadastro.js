const express = require('express');
const app = express();
const router = express.Router();
const Usuario = require("../model/Usuario");
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const crypto = require("crypto");
const bcrypt = require('bcryptjs');

var saltRounds = 10;

// Rota GET para /cadastro

router.get('/', (req, res) => {
    res.render('cadastro');
});

router.post("/", async function (req, res) {
    try {
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error(err);
                return res.redirect("/cadastro");
            }

            const senha = fields["senha"][0];

            if (
                senha.length == 0 &&
                fields.email[0].length == 0 &&
                fields.nome[0].length == 0
            ) {
                return res.redirect("/cadastro");
            }


            const existeUser = await Usuario.findOne({
                where: { email: fields["email"][0] },
            });
            if (existeUser) {
                return res.redirect("/cadastro");
            }

            const senhacripto = await bcrypt.hash(senha, saltRounds);

            if (files.imagem[0] && files.imagem[0].size > 0) {
                const file = files.imagem[0];

                const hash = crypto
                    .createHash("md5")
                    .update(Date.now().toString())
                    .digest("hex");

                var oldpath = files.imagem[0].filepath;
                var hash1 = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
                var ext = path.extname(files.imagem[0].originalFilename)
                var nomeimg = hash1 + ext
                var newpath = path.join(__dirname, '../public/imagens/', nomeimg);

                fs.rename(files.imagem[0].filepath, newpath, function (err) {
                    if (err) {
                        console.error(err);
                        return res.redirect("/cadastro");
                    }
                    console.log("Arquivo de imagem enviado com sucesso");
                    Usuario.create({
                        nome: fields["nome"][0],
                        senha: senhacripto,
                        email: fields["email"][0],
                        imagem: nomeimg,
                    });

                    return res.redirect("/login");
                });
            }
        });
    } catch (err) {
        console.error(err);
        res.redirect("/cadastro");
    }
});



module.exports = router;
