const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const Lutadores = require('../model/lutador');
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

router.get('/:id', async (req, res) => {
  try {
    const lutador = await Lutadores.findByPk(req.params.id);

    if (!lutador) {
      return res.status(404).send('Lutador não encontrado');
    }

    res.render('editaLutadores', { lutador });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro interno do servidor');
  }
});

router.post('/:id', async (req, res) => {
    var form = new formidable.IncomingForm({
      allowEmptyFiles: true, // Adicione esta opção para permitir arquivos vazios
    });
  
    form.parse(req, async (err, fields, files) => {
      try {
        if (err) throw err;
    

      // Atualize os campos do lutador com os dados do formulário
      const updateValues = {
        nome: fields['nome'][0],
        nome_luta: fields['nome_luta'][0],
        idade: fields['idade'][0],
        peso: fields['peso'][0],
      };

      // Verifique se uma nova imagem foi fornecida
      if (files.imagem && files.imagem[0]) {
        // Se uma nova imagem for fornecida, atualize a imagem
        nomeimg = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        var ext = path.extname(files.imagem[0].originalFilename);
        nomeimg += ext;

        const newpath = path.join(__dirname, "../public/imagens", nomeimg);
        await fs.promises.rename(files.imagem[0].filepath, newpath);

        updateValues.imagem = nomeimg;
      } else {
        // Se nenhuma nova imagem for fornecida, mantenha a imagem existente
        const lutadorExistente = await Lutadores.findByPk(req.params.id);
        updateValues.imagem = lutadorExistente.imagem;
      }

      console.log(updateValues);
      console.log(nomeimg);

      // Atualize o lutador no banco de dados
      await Lutadores.update(updateValues, {
        where: { id: req.params.id },
      });

      res.redirect('/lutador'); // Altere o redirecionamento conforme necessário
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro interno do servidor');
    }
  });
});

module.exports = router;
