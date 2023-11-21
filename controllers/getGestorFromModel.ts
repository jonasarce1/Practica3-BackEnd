import { Gestor } from "../types.ts"
import { ClienteModel } from "../db/cliente.ts"
import { GestorModelType } from "../db/gestor.ts"

//Funcion que devuelve un gestor a partir de un gestorModelType
export const getGestorFromModel = async(gestor:GestorModelType) : Promise<Gestor> => {
    const {_id, nombre, clientes} = gestor;

    const clientesMod = await ClienteModel.find({_id:{$in:clientes}}); //Buscamos los clientes que esten en la lista de clientes del gestor

    const gestorResponse = {
        id:_id.toString(),
        nombre,
        clientes:clientesMod.map((cliente) => ({
            id:cliente._id.toString(),
            nombre:cliente.nombre,
            cartera:cliente.cartera,
        }))
    }

    return gestorResponse;
}