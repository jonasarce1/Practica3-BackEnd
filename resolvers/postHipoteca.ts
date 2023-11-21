//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { Gestor } from "../types.ts";
import { Cliente } from "../types.ts";
import { Hipoteca } from "../types.ts";
import { HipotecaModel } from "../db/hipoteca.ts";
import { getHipotecaFromModel } from "../controllers/getHipotecaFromModel.ts";

const postHipoteca = async (req:Request<{nombre:string, importe:number, cliente:Cliente, gestor:Gestor}>, res:Response<Hipoteca | {error:unknown}>) => {
    try{
        const {nombre, importe, cliente, gestor} = req.body;

        const hipoteca = new HipotecaModel({
            nombre,
            importe,
            cliente,
            gestor
        });

        await hipoteca.save();

        const hipotecaResponse = await getHipotecaFromModel(hipoteca);

        res.status(201).send(hipotecaResponse); //status 201 es creado
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default postHipoteca;