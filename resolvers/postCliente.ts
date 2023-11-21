//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { Cliente } from "../types.ts";
import {ClienteModel, ClienteModelType} from "../db/cliente.ts";
import { getClienteFromModel } from "../controllers/getClienteFromModel.ts";

const postCliente = async(req:Request<ClienteModelType>, res:Response<Cliente | {error:unknown}>) => {
    try{
        const {nombre, cartera, gestor, hipotecas} = req.body;

        const cliente = new ClienteModel({
            nombre,
            cartera,
            gestor,
            hipotecas
        });

        await cliente.save();

        const clienteResponse = await getClienteFromModel(cliente);

        res.status(201).send(clienteResponse); //status 201 es creado
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default postCliente;