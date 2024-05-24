// Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require('./routes/usuario') 
const {eAdmin} = require("./helpers/eAdmin")
const passport = require("passport")
const initializePassport = require('./config/auth')
initializePassport(passport)


// Configurações
    // Sessão
        app.use(session({
            secret: "tempra",
            resave: true,
            saveUnintialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.user = req.user
            next()
        })
    // Body parser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json())
    // Handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
        app.use(express.static(path.join(__dirname, 'public')))
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb+srv://Francisco:tempra@mycluster.rskefox.mongodb.net/?retryWrites=true&w=majority&appName=myCluster", {
            dbName: 'blogapp'
        }).then(() => {
            console.log('Banco de dados conectado com sucesso.')
        }).catch((err) => {
            console.log(`Erro ao se conectar com o banco de dados: ${err}.`)
        })
    // Public
        app.use(express.static(path.join(__dirname, "public")))

        app.use((req, res, next) => {
            console.log("Oi, eu sou um middleware.")
            next()
        })

// Rotas
    app.get('/', (req, res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno.")
            res.redirect("/404")
        })
    })

    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem) {
                res.render("postagem/index", {postagem: postagem})
            }else {
                req.flash("error_msg", "Esta postagem não existe.")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno.")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req,res) => {
        Categoria.find().then((categorias) => {
            res.render("categorias/index", {categorias: categorias.map(Categoria=> Categoria.toJSON())  })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar as categorias.")
            res.redirect("/")   
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria) {

                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {

                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})

                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts.")
                    res.redirect("/")
                })

            }else {
                req.flash("error_msg", "Esta categoria não existe.")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
            res.redirect("/")
        })
    })

    app.get("/404", (req, res) => {
        res.send('Erro 404!')
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
    // Prefixo do grupo de rotas 'admin', para acessar a rota do outro arquivo é preciso colocar essa rota aqui na frente, como /admin/posts.

// Outros
const port = 3333
app.listen(port, () => {
    console.log('Servidor rodando!')
})
