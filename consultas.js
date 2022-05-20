const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "",
  database: "congreso",
  port: ,
});

//consulta para registrar un nuevo participante//
async function nuevoParticipante(email, nombre, password, anos_experiencia, especialidad, foto) {
  //console.log("desde consultas:", email, nombre, password, anos_experiencia, especialidad, foto)
  try {
    const result = await pool.query(
      `INSERT INTO participantes (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ('${email}','${nombre}','${password}', ${anos_experiencia} ,'${especialidad}','${foto}', false) RETURNING *;`
    );
    //console.log(result.rows[0])
    const participantes = result.rows[0];
    return participantes;
  } catch (e) {
    console.log("error consulta:", e);
    return e;
  }
}

async function fotoParticipante(name) {
  try {
    const result1 = await pool.query(
      " SELECT email FROM participantes ORDER BY Id DESC LIMIT 1 ;"
    );
    let email = result1.rows[0].email;
    const result2 = await pool.query(
      `UPDATE participantes SET foto='${name}' where email='${email}' RETURNING *;`
    );
    //console.log(result2.rows[0])
    const foto = result2.rows[0];
    return foto;
  } catch (e) {
    console.log("error consulta:", e);
    return e;
  }
}

async function participantesInscritos() {
  try {
    const result = await pool.query("SELECT * FROM participantes;");
    //console.log("consultas:",result.rows)
    return result.rows;
  } catch (e) {
    console.log("error consulta:", e);
    return e;
  }
}


async function getParticipante(email, password) {
  //esta consulta es para confirmar que el usuario existe en la DB
  try {
    const result = await pool.query(
      `SELECT * FROM participantes where email='${email}' AND password='${password}';`
    );
    //console.log("consultas:",result.rows)
    return result.rows[0];
  } catch (e) {
    console.log("error consulta:", e);
    return e;
  }
}

async function setParticipanteStatus(id, estado) {

  try {
    //console.log(auth)
    const result = await pool.query(
      `UPDATE participantes SET estado ='${estado}' WHERE id ='${id}' RETURNING *`
    );
    const usuario = result.rows[0];
    return usuario;
  } catch (e) {
    console.log("error consulta:", e);
    return e;
  }
}

async function actualizarDatos(email, nombre, password, anos_experiencia, especialidad) {
  
    try {
    //console.log("consulta",email, nombre, password, anos_experiencia, especialidad)
        const result = await pool.query(
            `UPDATE participantes SET 
            nombre ='${nombre}', password ='${password}',
            anos_experiencia ='${anos_experiencia}', especialidad ='${especialidad}' 
            WHERE email ='${email}' RETURNING *`
        );
        const usuario = result.rows[0];
        return usuario;
  } catch (e) {
        console.log("error consulta:", e);
        return e;
  }
}

async function eliminarDatos(email) {
  
    try {
    //console.log("desde consulta", email)
        const result = await pool.query(
            `DELETE FROM participantes WHERE email ='${email}' RETURNING *`
        );
        const usuario = result.rows[0];
        return usuario;
  } catch (e) {
        console.log("error consulta:", e);
        return e;
  }
}
module.exports = {
  nuevoParticipante,
  fotoParticipante,
  participantesInscritos,
  getParticipante,
  setParticipanteStatus,
  actualizarDatos,
  eliminarDatos
};
