const express = require('express')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const app = express()
const PORT = 3000

app.use(express.json())

// Função auxiliar para ler o arquivo de dados
function lerArquivo(callback) {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      callback([])
    } else {
      callback(JSON.parse(data))
    }
  })
}

// Função auxiliar para salvar os dados no arquivo
function salvarArquivo(data, callback) {
  fs.writeFile('data.json', JSON.stringify(data), (err) => {
    if (err) {
      console.error(err)
      callback(false)
    } else {
      callback(true)
    }
  })
}

app.get('/api/data', (req, res) => {
  lerArquivo((data) => {
    res.json(data)
  })
})

app.get('/api/data/:id', (req, res) => {
  const id = req.params.id
  lerArquivo((data) => {
    const registro = data.find((item) => item.id === id)
    if (registro) {
      res.json(registro)
    } else {
      res.status(404).send('Registro não encontrado.')
    }
  })
})


app.post('/api/data', (req, res) => {
  const { nome, descricao, preco } = req.body
  const novoRegistro = {
    id: uuidv4(),
    nome,
    descricao,
    preco,
  }
  lerArquivo((data) => {
    data.push(novoRegistro)
    salvarArquivo(data, (success) => {
      if (success) {
        res.json(novoRegistro)
      } else {
        res.status(500).send('Erro ao salvar o registro.')
      }
    })
  })
})


app.put('/api/data/:id', (req, res) => {
  const id = req.params.id
  const { nome, descricao, preco } = req.body
  lerArquivo((data) => {
    const registro = data.find((item) => item.id === id)
    if (registro) {
      registro.nome = nome
      registro.descricao = descricao
      registro.preco = preco
      salvarArquivo(data, (success) => {
        if (success) {
          res.json(registro)
        } else {
          res.status(500).send('Erro ao atualizar o registro.')
        }
      })
    } else {
      res.status(404).send('Registro não encontrado.')
    }
  })
})


app.delete('/api/data/:id', (req, res) => {
  const id = req.params.id
  lerArquivo((data) => {
    const index = data.findIndex((item) => item.id === id)
    if (index !== -1) {
      const registroRemovido = data.splice(index, 1)[0]
      salvarArquivo(data, (success) => {
        if (success) {
          res.json(registroRemovido)
        } else {
          res.status(500).send('Erro ao remover o registro.')
        }
      })
    } else {
      res.status(404).send('Registro não encontrado.')
    }
  })
})

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`)
})
