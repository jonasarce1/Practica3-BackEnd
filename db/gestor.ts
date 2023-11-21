import mongoose from "npm:mongoose@7.6.3"; 
import { Gestor } from "../types.ts";
import { ClienteModel } from "./cliente.ts";
import { HipotecaModel } from "./hipoteca.ts";

const Schema = mongoose.Schema;

const gestorSchema = new Schema({
    nombre:{type:String, required:true},
    clientes:[{type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required:false, max:10, default:[]}] //Maximo 10 clientes por gestor
},{timestamps:true} //Para que se cree el campo createdAt y updatedAt
)

//Validate clientes
gestorSchema.path("clientes").validate(function(clientes:Array<mongoose.Schema.Types.ObjectId>){
    try{
        return clientes.length <= 10; //El gestor no puede tener mas de 10 clientes
    }catch(_e){
        return false;
    }
})

//Middleware hook
//Cuando se crea un gestor asociado a un cliente se añade el id del gestor al cliente
gestorSchema.post("save", async function(gestor:GestorModelType){
    try{
        const clientes = await mongoose.model("Cliente").find({gestor:gestor._id});
        clientes.forEach(async (cliente) => {
            if(cliente.gestor.toString() != gestor._id.toString()){
                cliente.gestor = gestor._id;
                await cliente.save();
            }
        })
    }catch(e){
        console.log(e.error);
    }
})

//Middleware hook
//Cuando se asocia un gestor a un cliente se añade el id del cliente a la lista de clientes del gestor
gestorSchema.post("findOneAndUpdate", async function(gestor:GestorModelType){
    try {
        const clientes = await ClienteModel.find({ gestor: gestor._id });
        clientes.forEach(async (cliente) => {
            if(cliente.gestor !== null){
                if (cliente.gestor.toString() != gestor._id.toString()) {
                    cliente.gestor = gestor._id;
                    await cliente.save();
                }
            }
        });
    } catch (e) {
        console.log(e.error);
    }
})

//Middleware hook
//Cuando se borra un gestor se borra el id del gestor de los clientes asociados a el y se borran las hipotecas de los clientes
gestorSchema.post("findOneAndDelete", async function(gestor:GestorModelType){
    try {
        const clientes = await ClienteModel.find({ gestor: gestor._id });
        clientes.forEach(async (cliente) => {
            if (cliente.gestor !== null) {
                cliente.gestor = null;
                await cliente.save();
            }
        });
        const hipotecas = await HipotecaModel.find({ gestor: gestor._id });
        hipotecas.forEach(async (hipoteca) => {
            await HipotecaModel.findByIdAndDelete(hipoteca._id);
        });
    } catch (e) {
        console.log(e.error);
    }
})

export type GestorModelType = mongoose.Document & Omit<Gestor, "id" | "clientes"> & {
    clientes : Array<mongoose.Schema.Types.ObjectId>;
};

export const GestorModel = mongoose.model<GestorModelType>("Gestor", gestorSchema)
