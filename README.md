-Anotación: Mi programa al final tiene complejidad añadida ya que he decicido usar esta práctica para poder adquirir conocimientos en base a lo que nos ha enseñado Alberto en clase (Middleware hooks, validates, referencias a otras colecciones...).

-Endpoints:

app.post("/api/cliente", postCliente); //Crea un cliente

    Se crea un cliente pasándole nombre y cartera.



app.get("/api/cliente", getClientes); //Muestra todos los clientes



app.get("/api/cliente/:id", getCliente); //Muestra un cliente por su id



app.delete("/api/cliente/:id", deleteCliente); //Borra un cliente



app.put("/api/mandarDinero", mandarDinero); //Manda dinero de un cliente a otro (actualiza, por eso es put)

    Manda dinero de un cliente a otro usando idOrigen, idDestino y la cantidad a mandar. (Son ids de mongo)



app.put("/api/ingresarDinero", ingresarDinero); //Ingresa dinero a un cliente

    Ingresa dinero a la cartera de un cliente usando id (del cliente) y cantidad de dinero a ingresar.



app.post("/api/gestor", postGestor); //Crea un gestor

    Crea un gestor usando nombre y clientes (array de ids de clientes), puedes no pasarle clientes y se crea un gestor sin asociaciones a clientes



app.put("/api/asignarGestor", asignarGestor); //Asigna un gestor a un cliente

    Asigna un gestor a un cliente usando idGestor e idCliente.



app.get("/api/gestor", getGestores); //Muestra todos los gestores



app.get("/api/gestor/:id", getGestor); //Muestra un gestor por su id



app.delete("/api/gestor/:id", deleteGestor); //Borra un gestor



app.post("/api/hipoteca", postHipoteca); //Crea una hipoteca

    Crea una hipoteca pasándole nombre, importe, cliente (id del Cliente) y gestor (id del gestor)



app.put("/api/amortizarHipoteca", amortizarHipoteca); //Amortiza una hipoteca

    Amortiza una hipoteca pasándole id (id de la hipoteca) y cantidad de dinero a amortizar, si te pasas de dinero se amortiza la hipoteca y se le devuelve el dinero sobrante al cliente que tiene esa hipoteca



-CronJob: Mediante el paquete cron he creado un cronjob que cada cinco minutos añade 10000 euros a todos los clientes y además amortiza una cuota de cada hipoteca de la BBDD, usando la función amortizarHipoteca que también uso en el endpoint con el mismo nombre (las cuotas, importe y el amortizado se recalcula cada vez que se amortiza una hipoteca).