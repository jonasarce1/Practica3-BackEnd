    //@ts-ignore //Para evitar que salga rojo lo del express
    import {Request, Response} from "npm:express@4.18.2";
    import { HipotecaModel } from "../db/hipoteca.ts";
    import { ClienteModel } from "../db/cliente.ts";
    import { getHipotecaFromModel } from "../controllers/getHipotecaFromModel.ts";
    import { getClienteFromModel } from "../controllers/getClienteFromModel.ts";

    const amortizarHipoteca = async(req:Request<{id:string, cantidad:number}>, res:Response<string | {error:unknown}>) => {
        try{
            const{id, cantidad} = req.body;

            if(!id || !cantidad){
                res.status(400).send("Faltan datos");
                return;
            }

            const hipoteca = await HipotecaModel.findById(id).exec();

            if(!hipoteca){
                res.status(404).send("No existe una hipoteca con ese id");
                return;
            }

            const {importe, cuota, amortizado} = hipoteca; //Cuota es el numero de cuotas que faltan por pagar, por defecto son 20

            const hipotecaResponse = await getHipotecaFromModel(hipoteca);

            const cliente = hipotecaResponse.cliente;

            const clienteModel = await ClienteModel.findById(cliente.id).exec();

            if(!clienteModel){
                res.status(404).send("Error al buscar el cliente de la hipoteca");
                return;
            }

            const clienteResponse = await getClienteFromModel(clienteModel);

            const carteraCliente = clienteResponse.cartera;

            if(carteraCliente < cantidad){
                res.status(400).send("El cliente no tiene suficiente dinero para amortizar la hipoteca");
                return;
            }

            const carteraClienteActualizada = carteraCliente - cantidad;

            const importeActualizado = importe - cantidad;

            const amortizadoActualizado:number = Number(amortizado) + Number(cantidad); //Number() para que no lo concatene como string

            const cuotaActualizada:number = Math.ceil((importeActualizado * cuota) / importe);

            console.log("importe actualizado", importeActualizado);

            if(importeActualizado <= 0){ //Si se ha pagado mas de lo que se debia, se devuelve el dinero sobrante
                const dineroSobrante = Math.abs(importeActualizado); //Devuelve el valor absoluto (porque es negativo)

                console.log("dinero sobrante", dineroSobrante);
                //Actualizamos la cartera del cliente
                await ClienteModel.findByIdAndUpdate(cliente.id, {cartera: carteraClienteActualizada + dineroSobrante}, {new: true, runValidators:true}).exec();

                //Borramos la hipoteca
                await HipotecaModel.findByIdAndDelete(id).exec();

                res.status(200).send("Hipoteca completamente amortizada, importe actualizado: " + importeActualizado + ", amortizado actualizado: " + amortizadoActualizado + ", cartera cliente actualizada: " + carteraClienteActualizada + "");
                return;
            }

            if(importeActualizado == 0){
                await HipotecaModel.findByIdAndDelete(id).exec();
                res.status(200).send("Hipoteca completamente amortizada");
                return;
            }

            //Actualizamos la cartera del cliente, evitando BSONError: Cannot update 'cartera' and 'cartera' at the same time
            await ClienteModel.findByIdAndUpdate(cliente.id, {cartera: carteraClienteActualizada}, {new: true, runValidators:true}).exec();

            //Borramos la hipoteca
            await HipotecaModel.findByIdAndUpdate(id, {importe: importeActualizado, amortizado: amortizadoActualizado, cuota: cuotaActualizada}, {new: true, runValidators:true}).exec();

            console.log("he amortizado esta cantidad y esta es mi cartera ahora mismo", carteraClienteActualizada);

            res.status(200).send("Hipoteca amortizada correctamente, importe actualizado: " + importeActualizado + ", amortizado actualizado: " + amortizadoActualizado + ", cuota actualizada: " + cuotaActualizada + "");
        }catch(error){
            res.status(500).send(error.message); //status 500 es error del servidor
            return;
        }
    }

    export default amortizarHipoteca;