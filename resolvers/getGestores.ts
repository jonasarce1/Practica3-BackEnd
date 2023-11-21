//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { GestorModel } from "../db/gestor.ts";
import { Gestor } from "../types.ts";
import { getGestorFromModel } from "../controllers/getGestorFromModel.ts";

const getGestores = async(_req:Request, res:Response<Gestor[] | {error:unknown}>) => {
    try{
        const gestores = await GestorModel.find({}).exec();

        const gestoresResponse = await Promise.all(gestores.map(async gestor => await getGestorFromModel(gestor))); //Convertimos todos los gestores de GestorModelType a Gestor

        res.status(200).send(gestoresResponse); 
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return; 
    }
}

export default getGestores;
