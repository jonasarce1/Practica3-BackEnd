import mongoose from "npm:mongoose@7.6.3"; 
import { Cliente } from "../types.ts";
import { HipotecaModel } from "./hipoteca.ts";
import { GestorModel } from "./gestor.ts";

const Schema = mongoose.Schema;

const clienteSchema = new Schema({
    nombre:{type:String, required:true},
    cartera:{type:Number, required:false, default:0}, //En caso de no haber introducido cartera poner a 0
    gestor:{type: mongoose.Schema.Types.ObjectId, ref: "Gestor", required:false},
    hipotecas:[{type: mongoose.Schema.Types.ObjectId, ref: "Hipoteca", required:false, default:[]}] //Maximo 10 clientes por gestor
},{timestamps:true} //Para que se cree el campo createdAt y updatedAt
)

//Validate hipotecas, al final no se usa, se suele entrar antes en el pre save de hipoteca que he creado
clienteSchema.path("hipotecas").validate(async function(hipotecas:Array<mongoose.Schema.Types.ObjectId>){
    try{
        let total = 0;
        for(let i = 0; i < hipotecas.length; i++){
            const hipoteca = await HipotecaModel.findById(hipotecas[i]);
            if(hipoteca){
                total += hipoteca.importe;
            }
        }
        return total <= 1000000; //El cliente no puede tener en total el precio de todas sus hipotecas superior a 1000000
    }catch(_e){
        return false;
    }
})

// Middleware hook
// Si ya hay un gestor asignado al cliente no permitimos cambiarlo
clienteSchema.pre("save", async function (next) {
    try {
        const cliente = this as ClienteModelType;

        // Verificamos si ya hay un gestor asignado al cliente
        if (cliente.gestor) {
            const clienteBeforeUpdate = await ClienteModel.findById(cliente._id);
            
            // Verificamos si el gestor se está actualizando
            if (clienteBeforeUpdate && 
                clienteBeforeUpdate.gestor && 
                clienteBeforeUpdate.gestor.toString() !== cliente.gestor.toString()) { //Si el gestor del cliente antes de actualizar es el mismo que el gestor que se quiere actualizar lanzamos error
                throw new Error("No se puede cambiar el gestor asignado a un cliente");
            }
        }

        return next(); // Si no hay error, continuamos
    } catch (error) {
        console.error("Error en el middleware pre-save:", error);
    }
});

/*
//NO FUNCIONA
//Middleware hook
//Si al actualizar un cliente se actualiza el gestor y este cliente ya tiene asignado un gestor salta error
clienteSchema.pre("findOneAndUpdate", async function(next){
    try{
        
        const cliente = this as unknown as ClienteModelType; //convertimos a unknown si no no deja acceder a los campos

        // Verificamos si ya hay un gestor asignado al cliente
        if (cliente.gestor) {
            const clienteBeforeUpdate = await ClienteModel.findById(cliente._id);

            // Verificamos si el gestor se está actualizando
            if (clienteBeforeUpdate && clienteBeforeUpdate.gestor !== cliente.gestor) {
                throw new Error("No se puede cambiar el gestor asignado a un cliente");
            }
        }

        return next(); // Si no hay error, continuamos
    }catch(error){
        console.error("Error en el middleware pre-save:", error);
    }
})
*/

//Middleware hook
//Cuando se borra un cliente se borran sus hipotecas, usar findOneAndDelete
clienteSchema.post("findOneAndDelete", async function(cliente:ClienteModelType){
    try{
        await HipotecaModel.deleteMany({cliente:cliente._id});
    }catch(e){
        console.log(e.error);
    }
})

//Middleware hook
//Cuando se borra un cliente se borra de la lista de clientes del gestor
clienteSchema.post("findOneAndDelete", async function(cliente:ClienteModelType){
    try{
        const gestor = await GestorModel.findById(cliente.gestor);
        if(gestor){
            const index = gestor.clientes.indexOf(cliente._id);
            if(index != -1){
                gestor.clientes.splice(index, 1); //Borramos el cliente de la lista de clientes del gestor, splice borra el elemento en la posicion index
                await gestor.save();
            }
        }
    }catch(e){
        console.log(e.error);
    }
})


export type ClienteModelType = mongoose.Document & Omit<Cliente, "id" | "gestor" | "hipotecas"> & {
    gestor : mongoose.Schema.Types.ObjectId | null;
    hipotecas : Array<mongoose.Schema.Types.ObjectId>;
};

//type ClienteModelType = mongoose.Document & Omit<Cliente, "id">

export const ClienteModel = mongoose.model<ClienteModelType>("Cliente", clienteSchema)