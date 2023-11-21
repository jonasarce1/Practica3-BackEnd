//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { Cliente } from "../types.ts";
import {ClienteModel} from "../db/cliente.ts";
import { getClienteFromModel } from "../controllers/getClienteFromModel.ts";

const getCliente = async(req:Request<{id:string}>, res:Response<Cliente | {error:unknown}>) => {
    //Request<{ id: string }> es para tipar los parametros que recibo, en este caso solo id
    //Response<Cliente | {error:unknown}> es para tipar lo que devuelvo, en este caso Cliente o un objeto con error
    try{
        const id = req.params.id; //Podemos omitir la comprobacion del id porque ya lo hace el Request<{id:string}>

        const cliente = await ClienteModel.findById(id).exec();
        
        if(!cliente){
            res.status(404).send("No se pudo encontrar el cliente");
            return;
        }

        const clienteResponse = await getClienteFromModel(cliente);

        res.status(200).send(clienteResponse);
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return; 
    }
}

export default getCliente;