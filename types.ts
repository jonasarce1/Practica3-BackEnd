export type Cliente = {
    id:string,
    nombre:string,
    cartera:number,
    gestor:Omit<Gestor, "clientes">,
    hipotecas:Array<Omit<Hipoteca, "cliente" | "gestor">>
}

export type Gestor = {
    id:string,
    nombre:string,
    clientes:Array<Omit<Cliente, "gestor" | "hipotecas">>,
}

export type Hipoteca = {
    id:string,
    nombre:string,
    importe:number,
    amortizado:number, //Sera 0 por defecto
    cuota:number, //Sera 20 por defecto
    cliente:Omit<Cliente, "gestor" | "hipotecas">,
    gestor:Omit<Gestor, "clientes">,
}