const express = require("express");
const app = express(); //instancia de express ejecutad
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const secretKey = "silence";

const {
  nuevoParticipante,
  participantesInscritos,
  getParticipante,
  setParticipanteStatus,
  actualizarDatos,
  eliminarDatos,
} = require("./consultas");

app.listen(3000, () => console.log("Servidor encendido en el puerto 3000!"));
//configuraciones de los paquetes
app.use(bodyParser.urlencoded({ extended: false })); //recibir la carga de imagenes a través de "html form format"
app.use(bodyParser.json()); //recibir el payload de la consultas put y post
app.use(express.static(__dirname + "/public")); //declarar estatico el contenido dentro de la carpeta public
app.use(
  expressFileUpload({
    limits: 5000000,
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen supera el limite permitido",
  })
);

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
//hanldebars
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/mainLayout`,
  })
);

app.set("view engine", "handlebars");

//rutas

app.get("/", async (req, res) => {
  try {
    const lista1 = await participantesInscritos();
    //console.log("44:",lista1)
    res.render("index", { lista1 });
  } catch (e) {
    res.status("500").send({
      error: `Algo salió mal...${e}`,
      code: 500,
    });
  }
});

app.get("/registro", (req, res) => {
  res.render("Registro");
});

app.get("/login", (req, res) => {
  res.render("Login");
});

//ruta para registrar un nuevo participante
app.post("/participantes", async (req, res) => {  
  const { email, nombre, password, passwordRepeat, anos_experiencia, especialidad } = req.body;  

  if (email === '' || nombre=== '' || password === ''|| passwordRepeat === '' || anos_experiencia=== '' || especialidad=== ''){
    //falta evaluar que el input de foto no esté vacío || foto === null
    res.send('<script>alert("debe completar todos los campos");window.location.href = "/registro"; </script>')
  }
  const { foto } = req.files;
  const { name } = foto;
  console.log(email, nombre, password, passwordRepeat, anos_experiencia, especialidad)  
  if( password !== passwordRepeat){ 
    res.send('<script>alert("Las contraseñas no coinciden."); window.location.href = "/registro"; </script>');
  }else{
    try {
    await nuevoParticipante( email, nombre, password, anos_experiencia, especialidad, name) //const participanteNuevo = 
    .then(() => {
      foto.mv(`${__dirname}/public/perfiles/${name}`,(err) => {
          res.send('<script>alert("Usuario registrado con éxito."); window.location.href = "/"; </script>');
      });
  })
    //res.status(201).send(participanteNuevo); //  
  }catch (e) {
      res.status(500).send({
        error: `Algo salió mal...${e}`,
        code: 500,
      });
    }
  }
});


app.get("/admin", async (req, res) => {
  try {
    const lista = await participantesInscritos();
    res.render("Admin", { lista });
  } catch (e) {
    res.status("500").send({
      error: `Algo salió mal...${e}`,
      code: 500,
    });
  }
});


app.post("/verify", async function (req, res) {
  const { email,password } = req.body;
  const user = await getParticipante(email,password)

    if(user == undefined){
      res.status(401).send({
        error:'algún dato ingresado está incorrecto',
        code: 401,
      })
    }else if ( user.estado === true) {
      const token = jwt.sign(              
        {                
          exp: Math.floor(Date.now() / 1000) + 180,                
          data: user,              
        }, secretKey);
        res.send(token);

    }else {
      res.status(401).send({
          error:'El registro de este usuario no ha sido aprobado',
          code: 401,
      })      
    } 
  }) ;



app.get("/datos", (req, res) => {
  const { token } = req.query;
  //console.log("token", token);
  jwt.verify(token, secretKey, (err, decoded) => {
    //console.log(decoded);
    const { data } = decoded;
    //console.log("data71:", data);
    //const { nombre, email, anos_experiencia, especialidad } = data;
        const email = data.email;
        const nombre = data.nombre;
        const password = data.password;
        const anos_experiencia = data.anos_experiencia;
        const especialidad = data.especialidad;
    err
      ? res.status(401).send(
          res.send({
            error: "401 Unauthorized",
            message: "Usted no está autorizado para estar aquí",
            token_error: err.message,
          })
        )
      : res.render("Datos", { nombre, email, password, anos_experiencia, especialidad });
  });
});


app.put("/participantesAdmin", async (req, res) => {
  const { id, estado } = req.body;
  //console.log(auth);
  try {
    const estadoParticipante = await setParticipanteStatus(id, estado);
    res.status(200).send(estadoParticipante);
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal...${e}`,
      code: 500,
    });
  }
});


app.put("/actualizarDatos", async (req, res) => {
  const { email, nombre, password, anos_experiencia, especialidad } = req.body;
  //console.log("183", email, nombre, password, anos_experiencia, especialidad );

  try {
    const participanteActualizado = await actualizarDatos( email, nombre, password, anos_experiencia, especialidad);
    //console.log("datos actualizados",participanteNuevo)
    res.status(200).send(participanteActualizado);

  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal...${e}`,
      code: 500,
    });
  }
});

app.delete("/eliminarDatos/:email", async (req, res) => {
  try {
    const  {email}  = req.params;
    const participanteEliminado = await eliminarDatos(email);
    res.status(200).send(participanteEliminado);
  } catch (e) {
    res.status(500).send({
      error: `Algo salió mal...${e}`,
      code: 500,
    });
  }
});
