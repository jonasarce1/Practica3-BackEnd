//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import { ClienteModel } from "../db/cliente.ts";
import { GestorModel } from "../db/gestor.ts";
import { Gestor } from "../types.ts";
import { Cliente } from "../types.ts";
import { getGestorFromModel } from "../controllers/getGestorFromModel.ts";

const postGestor = async(req:Request<{nombre:string, clientes:Cliente[] | null}>, res:Response<Gestor | {error:unknown}>) => {
    try{
        const {nombre, clientes} = req.body;

        const gestor = new GestorModel({
            nombre,
            clientes
        });

        await gestor.save();

        if (clientes) {
            await Promise.all(clientes.map(async (clienteId: string) => { //Proise all para que se ejecuten todas las promesas
                const cliente = await ClienteModel.findById(clienteId).exec();
        
                if (cliente) {
                    if (cliente.gestor) {
                        res.status(400).send("El cliente ya tiene un gestor");
                        throw new Error("El cliente ya tiene un gestor"); // Lanzar un error para detener la ejecución
                    }
                    cliente.gestor = gestor._id;
                    await cliente.save();
                }
            }));
        }

        const gestorResponse = await getGestorFromModel(gestor);

        res.status(201).send(gestorResponse); //status 201 es creado
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default postGestor;