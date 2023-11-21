//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { HipotecaModel } from "../db/hipoteca.ts";


const deleteHipoteca = async (req:Request<{id:string}>, res:Response<string | {error:unknown}>) => {
    try{
        const id = req.params.id;

        const hipotecaDelete = await HipotecaModel.findOneAndDelete(id).exec(); 

        if(!hipotecaDelete){
            res.status(404).send("No existe una hipoteca con ese id");
            return;
        }

        res.status(200).send("Hipoteca borrada correctamente");
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default deleteHipoteca;