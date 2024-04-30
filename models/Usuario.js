const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require("bcryptjs")

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    },
    eAdmin: {
        type: Number,
        default: 0
    }
})

Usuario.methods.matchPassword = async function(senha) {
    try {
        return await bcrypt.compare(senha, this.senha)
    } catch (err) {
        throw new Error(err)
    }
}

mongoose.model("usuarios", Usuario)