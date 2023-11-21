import { Hipoteca } from "../types.ts";
import { HipotecaModelType } from "../db/hipoteca.ts";
import { ClienteModel } from "../db/cliente.ts";
import { GestorModel } from "../db/gestor.ts";

//Funcion que devuelve una hipoteca a partir de un hipotecaModelType
export const getHipotecaFromModel = async(hipoteca:HipotecaModelType) : Promise<Hipoteca> => {
    const {_id, nombre, importe, cuota, amortizado, cliente, gestor} = hipoteca;

    const clienteMod = await ClienteModel.findById(cliente);
    if(!clienteMod){
        throw new Error("No existe el cliente");
    }

    const gestorMod = await GestorModel.findById(gestor);
    if(!gestorMod){
        throw new Error("No existe el gestor");
    }

    if(!clienteMod.gestor || clienteMod.gestor.toString() != gestorMod._id.toString()){  //Si el gestor del cliente no es el mismo que el gestor de la hipoteca lanzamos un error
        throw new Error("El gestor de la hipoteca no es el mismo que el gestor del cliente");
    }
    
    const hipotecaResponse = {
        id:_id.toString(),
        nombre,
        importe,
        cuota,
        amortizado,
        cliente:{
            id:clienteMod._id.toString(),
            nombre:clienteMod.nombre,
            cartera:clienteMod.cartera
        },
        gestor:{
            id:gestorMod._id.toString(),
            nombre:gestorMod.nombre,
        }
    }
    return hipotecaResponse;
}