//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { GestorModel } from "../db/gestor.ts";


const deleteGestor = async (req:Request<{id:string}>, res:Response<{message:string} | {error:unknown}>) => {
    try{
        const id = req.params.id;

        const gestorDelete = await GestorModel.findByIdAndDelete(id).exec();

        if(!gestorDelete){
            res.status(404).send("No existe un gestor con ese id");
            return;
        }

        res.status(200).send("Gestor borrado correctamente");
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default deleteGestor;