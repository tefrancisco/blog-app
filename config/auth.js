const LocalStrategy = require("passport-local")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Model de usuário
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")


module.exports = function(passport){

  passport.use(
    "local-login",
    new LocalStrategy(
        {
      usernameField: 'email', 
      passwordField: 'senha',
    }, 
    async (email, senha, cb) => {
        try {
            const usuario = await Usuario.findOne({ email: email})
            if (!usuario) return cb(null, false)
            const senhasBatem = await usuario.matchPassword(senha)
            if(!senhasBatem) return cb(null, false)
            // Se as senhas batem, returnar usuário
            return cb(null, usuario);
        } catch(err) {
            console.log(err)
            return cb(err, false)
        }

  }))
passport.serializeUser((usuario, cb) => {

      return cb(null, usuario)

  })

  passport.deserializeUser((id, cb) => {
      Usuario.findById(id).then((usuario) => {
          return cb(null, usuario)
      }).catch((err) => {
          return cb(null, false, {message: "Algo deu errado!"})
      })
  })
}
