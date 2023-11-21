//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { HipotecaModel } from "../db/hipoteca.ts";
import { Hipoteca } from "../types.ts";
import { getHipotecaFromModel } from "../controllers/getHipotecaFromModel.ts";

const getHipotecas = async (_req:Request, res:Response<Hipoteca[] | {error:unknown}>) => {
    try{
        const hipotecas = await HipotecaModel.find({}).exec();

        const hipotecasResponse = await Promise.all(hipotecas.map(async hipoteca => await getHipotecaFromModel(hipoteca))); //Convertimos todas las hipotecas de HipotecaModelType a Hipoteca

        res.status(200).send(hipotecasResponse);
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default getHipotecas;