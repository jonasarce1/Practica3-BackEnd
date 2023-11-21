//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import {ClienteModel} from "../db/cliente.ts";

const mandarDinero = async(req:Request<{idOrigen:string, idDestino:string, cantidad:number}>, res:Response<string | {error:unknown}>) => {
    try{
        //Al indicar que el body es de tipo {id:string, cantidad:number} ya no hace falta comprobar que existan los campos
        const {idOrigen, idDestino, cantidad} = req.body;

        const clienteOrigen = await ClienteModel.findById(idOrigen).exec();
        const clienteDestino = await ClienteModel.findById(idDestino).exec();

        if(!clienteOrigen){
            res.status(404).send("No existe el cliente origen");
            return;
        }

        if(!clienteDestino){
            res.status(404).send("No existe el cliente destino");
            return;
        }

        if(clienteOrigen.cartera < cantidad){
            res.status(400).send("No tiene suficiente dinero");
            return;
        }

        clienteOrigen.cartera -= cantidad;
        clienteDestino.cartera += cantidad;

        await clienteOrigen.save();
        await clienteDestino.save();

        res.status(200).send("Dinero enviado correctamente");
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default mandarDinero;