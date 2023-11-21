//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { HipotecaModel } from "../db/hipoteca.ts";
import { Hipoteca } from "../types.ts";

const getHipoteca = async (req:Request<{id:string}>, res:Response<Hipoteca | {error:unknown}>) => {
    try{
        const id = req.params.id;

        const hipoteca = await HipotecaModel.findById(id).exec();

        if(!hipoteca){
            res.status(404).send("No existe una hipoteca con ese id");
            return;
        }

        res.status(200).send(hipoteca);
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default getHipoteca;