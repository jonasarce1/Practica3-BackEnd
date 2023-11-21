//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import {ClienteModel} from "../db/cliente.ts";

const deleteCliente = async(req:Request<{id:string}>, res:Response<string | {error:unknown}>) => {
    try{
        const id = req.params.id;

        const clienteDelete = await ClienteModel.findOneAndDelete(id).exec(); 

        if(!clienteDelete){
            res.status(404).send("No existe un cliente con ese id");
            return;
        }

        res.status(200).send("Cliente borrado correctamente");
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default deleteCliente;