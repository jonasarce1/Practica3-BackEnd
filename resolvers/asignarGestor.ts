//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import {GestorModel} from "../db/gestor.ts";
import {ClienteModel} from "../db/cliente.ts";

const asignarGestor = async(req:Request<{idCliente:string, idGestor:string}>, res:Response<string | {error:unknown}>) => {
    try{
        const {idCliente, idGestor} = req.body;

        const cliente = await ClienteModel.findById(idCliente).exec();

        if(!cliente){
            res.status(404).send("No existe un cliente con ese id");
            return;
        }

        const gestor = await GestorModel.findById(idGestor).exec();

        if(!gestor){
            res.status(404).send("No existe un gestor con ese id");
            return;
        }

        if(cliente.gestor){
            res.status(400).send("El cliente ya tiene un gestor asignado");
            return;
        }

        await ClienteModel.findByIdAndUpdate(idCliente, {gestor: idGestor}, {new: true, runValidators:true}).exec(); 
        //new:true es para que devuelva el cliente actualizado y runValidators:true es para que valide los datos que le pasamos
        //La lista de gestores del cliente se actualiza automaticamente mediante un hook en el modelo de cliente

        res.status(200).send("Gestor asignado correctamente");
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default asignarGestor;