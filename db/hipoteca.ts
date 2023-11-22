import mongoose from "npm:mongoose@7.6.3"; 
import { Hipoteca } from "../types.ts";
import { ClienteModel } from "./cliente.ts";
import { GestorModel } from "./gestor.ts";

const Schema = mongoose.Schema;

const hipotecaSchema = new Schema({
    nombre:{type:String, required:true},
    importe:{type:Number, required:true}, //El importe es el dinero que se pide prestado
    cuota:{type:Number, required:false, default:20}, //Las cuotas seran 20 por defecto
    amortizado:{type:Number, required:false, default:0}, //El amortizado es el dinero que se ha pagado de la hipoteca
    cliente:{type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required:true}, //La hipoteca ha de tener siempre un cliente
    gestor:{type: mongoose.Schema.Types.ObjectId, ref: "Gestor", required:true} //La hipoteca ha de tener siempre un gestor
}, {timestamps:true} //Para que se cree el campo createdAt y updatedAt
)

//Cuando se crea una hipoteca se añade a la lista de hipotecas del cliente
hipotecaSchema.post("save", async function(hipoteca:HipotecaModelType){
    try{
        const cliente = await ClienteModel.findById(hipoteca.cliente);
        if(cliente){
            cliente.hipotecas.push(hipoteca._id);
            await cliente.save();
        }
    }catch(e){
        console.log(e.error);
    }
})

//Si el importe de una nueva hipoteca que se va a guardar en un cliente hace que el importe total de las hipotecas del cliente sea superior a 1000000 no se guarda la hipoteca
hipotecaSchema.pre("save", async function(next){
    try{
        const hipoteca = this as HipotecaModelType;
        const cliente = await ClienteModel.findById(hipoteca.cliente);
        if(cliente){
            let total = 0;
            for(let i = 0; i < cliente.hipotecas.length; i++){
                const hipoteca = await HipotecaModel.findById(cliente.hipotecas[i]);
                if(hipoteca){
                    total += hipoteca.importe;
                }
            }
            if(total + hipoteca.importe > 1000000){
                throw new Error("El importe total de las hipotecas del cliente no puede ser superior a 1000000");
            }
        }
        return next();
    }catch(e){
        console.log(e.error);
        return next(e);
    }
})

//Middleware hook 
//Cuando se borra una hipoteca se borra de la lista de hipotecas del cliente
hipotecaSchema.post("findOneAndDelete", async function(hipoteca:HipotecaModelType){
    try{
        const cliente = await ClienteModel.findById(hipoteca.cliente);
        if(cliente){
            const index = cliente.hipotecas.indexOf(hipoteca._id);
            if(index != -1){
                cliente.hipotecas.splice(index, 1); //Borramos la hipoteca de la lista de hipotecas del cliente, splice borra el elemento en la posicion index
                await cliente.save();
            }
        }
    }catch(e){
        console.log(e.error);
    }
})

//Middleware hook
//Si en la BBDD hay hipotecas asociadas a un cliente que no existe se borran
hipotecaSchema.post("findOneAndUpdate", async function(hipoteca:HipotecaModelType){
    try{
        const cliente = await ClienteModel.findById(hipoteca.cliente);
        if(!cliente){
            await HipotecaModel.findByIdAndDelete(hipoteca._id);
        }
    }catch(e){
        console.log(e.error);
    }
})

//Middleware hook
//Si en la BBDD hay hipotecas asociadas a un gestor que no existe se borran
hipotecaSchema.post("findOneAndUpdate", async function(hipoteca:HipotecaModelType){
    try{
        const gestor = await GestorModel.findById(hipoteca.gestor);
        if(!gestor){
            await HipotecaModel.findByIdAndDelete(hipoteca._id);
        }
    }catch(e){
        console.log(e.error);
    }
})

export type HipotecaModelType = mongoose.Document & Omit<Hipoteca, "id" | "cliente" | "gestor"> & {
    cliente : mongoose.Schema.Types.ObjectId;
    gestor : mongoose.Schema.Types.ObjectId;
};

export const HipotecaModel = mongoose.model<HipotecaModelType>("Hipoteca", hipotecaSchema)

