//@ts-ignore //Para evitar que salga rojo lo del express
import {Request, Response} from "npm:express@4.18.2";
import {ClienteModel} from "../db/cliente.ts";

const ingresarDinero = async(req:Request<{id:string, cantidad:number}>, res:Response<string | {error:unknown}>) => {
    try{
        //Al indicar que el body es de tipo {id:string, cantidad:number} ya no hace falta comprobar que existan los campos
        const {id, cantidad} = req.body;

        const cliente = await ClienteModel.findById(id).exec();

        if(!cliente){
            res.status(404).send("No se pudo encontrar el cliente");
            return;
        }

        cliente.cartera += Number(cantidad);

        await cliente.save();

        res.status(200).send("Dinero ingresado correctamente");
    }catch(error){
        res.status(500).send(error.message); //status 500 es error del servidor
        return;
    }
}

export default ingresarDinero;