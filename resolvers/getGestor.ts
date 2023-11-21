//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { GestorModel } from "../db/gestor.ts";
import { Gestor } from "../types.ts";
import { getGestorFromModel } from "../controllers/getGestorFromModel.ts";

const getGestor = async(req:Request<{id:string}>, res:Response<Gestor | {error:unknown}>) => {
    //Request<{ id: string }> es para tipar los parametros que recibo, en este caso solo id
    //Response<Cliente | {error:unknown}> es para tipar lo que devuelvo, en este caso Cliente o un objeto con error
    try{
        const id = req.params.id;

        if(!id){
            res.status(400).send("Falta el id");
            return;
        }

        const gestor = await GestorModel.findById(id).exec();
        
        if(!gestor){
            res.status(404).send("No se pudo encontrar el gestor");
            return;
        }

        const gestorResponse = await getGestorFromModel(gestor);

        res.status(200).send(gestorResponse);
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return; 
    }
}

export default getGestor;