//@ts-ignore //Para evitar que salga rojo lo del express
import express from "npm:express@4.18.2";
import mongoose from "npm:mongoose@7.6.3";
import {CronJob} from "npm:cron@3.1.6";

import { ClienteModel } from "./db/cliente.ts";
import { HipotecaModel } from "./db/hipoteca.ts";

import getCliente from "./resolvers/getCliente.ts";
import postCliente from "./resolvers/postCliente.ts";
import getClientes from "./resolvers/getClientes.ts";
import deleteCliente from "./resolvers/deleteCliente.ts";
import mandarDinero from "./resolvers/mandarDinero.ts";
import ingresarDinero from "./resolvers/ingresarDinero.ts";

import getGestor from "./resolvers/getGestor.ts";
import postGestor from "./resolvers/postGestor.ts";
import getGestores from "./resolvers/getGestores.ts";
import asignarGestor from "./resolvers/asignarGestor.ts";
import deleteGestor from "./resolvers/deleteGestor.ts";

import postHipoteca from "./resolvers/postHipoteca.ts";
import getHipotecas from "./resolvers/getHipotecas.ts";
import getHipoteca from "./resolvers/getHipoteca.ts";
import amortizarHipoteca from "./resolvers/amortizarHipoteca.ts";

import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";
const env = await load();

const MONGO_URL = env.MONGO_URL || Deno.env.get("MONGO_URL"); //Obtenemos la variable de entorno MONGO_URL ya sea de .env o de las variables de entorno del sistema

if(!MONGO_URL){
  console.log("No se ha encontrado la variable de entorno MONGO_URL");
  Deno.exit(1);
}

await mongoose.connect(MONGO_URL);

const app = express();

app.use(express.json());

app.post("/api/cliente", postCliente); //Crea un cliente

app.get("/api/cliente", getClientes); //Muestra todos los clientes

app.get("/api/cliente/:id", getCliente); //Muestra un cliente por su id

app.delete("/api/cliente/:id", deleteCliente); //Borra un cliente

app.put("/api/mandarDinero", mandarDinero); //Manda dinero de un cliente a otro (actualiza, por eso es put)

app.put("/api/ingresarDinero", ingresarDinero); //Ingresa dinero a un cliente

app.post("/api/gestor", postGestor); //Crea un gestor

app.put("/api/asignarGestor", asignarGestor); //Asigna un gestor a un cliente

app.get("/api/gestor", getGestores); //Muestra todos los gestores

app.get("/api/gestor/:id", getGestor); //Muestra un gestor por su id

app.delete("/api/gestor/:id", deleteGestor); //Borra un gestor

app.post("/api/hipoteca", postHipoteca); //Crea una hipoteca

app.get("/api/hipoteca", getHipotecas); //Muestra todas las hipotecas

app.get("/api/hipoteca/:id", getHipoteca); //Muestra una hipoteca por su id

app.put("/api/amortizarHipoteca", amortizarHipoteca); //Amortiza una hipoteca

const fakeResponse = () => ({ //Funcion para simular una respuesta (Para poder usar la funcion amortizarHipoteca y no tener que crear otra funcion)
  status: (code: number) => ({ send: (data: string) => console.log(`Status ${code}: ${data}`) }),
});

// Crea una tarea programada (CronJob) para ejecutar cada 5 minutos
const cronJob = new CronJob('*/5 * * * *', async () => {
  try {
    const clientes = await ClienteModel.find({});
    for (const cliente of clientes) { //He usado bucles for ya que con for each se ejecutaban las iteraciones a la vez y se actualizaba erroneamente la cartera de los clientes
      //Ingresamos 5000 euros a cada cliente
      cliente.cartera += 5000;
      await cliente.save();
      // Si tiene hipotecas, amortiza una cuota de cada hipoteca
      if (cliente.hipotecas.length > 0) {
        const hipotecas = await HipotecaModel.find({ _id: { $in: cliente.hipotecas } });
        for (const hipoteca of hipotecas) {
          //Llamamos a la funcion amortizarHipoteca para amortizar una cuota de la hipoteca
          await amortizarHipoteca({ body: { id: hipoteca._id.toString(), cantidad: hipoteca.importe / hipoteca.cuota } }, fakeResponse());
        }
      }
    }
    console.log("Se han ingresado 5000 euros a todos los clientes");
  } catch (error) {
    console.log("Error al ingresar dinero cada 5 minutos", error);
  }
});

cronJob.start(); //Iniciamos la tarea programada

app.listen(3000, () => { console.log("Funcionando en puerto 3000") });