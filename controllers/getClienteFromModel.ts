import {Cliente} from "../types.ts"
import { ClienteModelType } from "../db/cliente.ts"
import { GestorModel } from "../db/gestor.ts"
import { HipotecaModel } from "../db/hipoteca.ts"

//Funcion que devuelve un cliente a partir de un clienteModelType
export const getClienteFromModel = async(cliente:ClienteModelType) : Promise<Cliente> => {
    const {_id, nombre, cartera, gestor, hipotecas} = cliente;
    
    const gestorMod = await GestorModel.findById(gestor);

    if(!gestorMod){ //Si no existe el gestor devolvemos un cliente sin gestor y sin hipotecas
        console.log("No existe el gestor");
        const clienteResponse = {
            id:_id.toString(),
            nombre,
            cartera,
            gestor:{
                id:"",
                nombre:""
            },
            hipotecas:[]
        }
        return clienteResponse;
    }

    const hipotecasMod = await HipotecaModel.find({_id:{$in:hipotecas}}); //Buscamos las hipotecas que esten en el array de hipotecas del cliente

    const clienteResponse = {
        id:_id.toString(),
        nombre,
        cartera,
        gestor:{
            id:gestorMod._id.toString(),
            nombre:gestorMod.nombre
        },
        hipotecas:hipotecasMod.map((hipoteca) => ({
            id:hipoteca._id.toString(),
            nombre:hipoteca.nombre,
            importe:hipoteca.importe,
            cuota:hipoteca.cuota,
            amortizado:hipoteca.amortizado
        }))
    }

    return clienteResponse;
}