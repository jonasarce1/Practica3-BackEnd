//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { Cliente } from "../types.ts";
import {ClienteModel} from "../db/cliente.ts";
import { getClienteFromModel } from "../controllers/getClienteFromModel.ts";

const getClientes = async(_req:Request, res:Response<Cliente[] | {error:unknown}>) => {
    //Response<Cliente | {error:unknown}> es para tipar lo que devuelvo, en este caso un array de clientes o un objeto con error
    try{
        const clientes = await ClienteModel.find({}).exec(); //Buscamos todos los clientes

        const clientesResponse : Cliente[] = await Promise.all(clientes.map(async(cliente) => await getClienteFromModel(cliente))); //Convertimos los clientes de ClienteModelType a Cliente

        res.status(200).send(clientesResponse);
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default getClientes;