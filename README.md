# ATM Express – Sistema de Cajero Automático

## 1. Descripción del proyecto

ATM Express es un proyecto desarrollado con Node.js y Express.js que busca simular el funcionamiento de un cajero automático. Su objetivo es contar con una interfaz para los usuarios y un panel de administración que permita consultar el estado del cajero y gestionar el efectivo disponible.

El proyecto se desarrolla por etapas con el propósito de aplicar conocimientos de programación, creación de interfaces, desarrollo de servidores y comunicación entre aplicaciones mediante API.

## 2. Objetivo general

Desarrollar una aplicación de cajero automático que permita gestionar operaciones básicas, consultar información y administrar el efectivo disponible, con la intención de integrarla con el sistema Banco Central.

## 3. Tecnologías utilizadas

- **Node.js:** entorno utilizado para ejecutar JavaScript en el servidor.
- **Express.js:** framework utilizado para crear el servidor y definir las rutas.
- **HTML:** utilizado para crear la estructura de las interfaces.
- **CSS:** utilizado para el diseño y la presentación de las páginas.
- **JavaScript:** utilizado para agregar funcionalidad e interacción a las interfaces.
- **Variables de entorno:** utilizadas para configurar el puerto, la dirección de la API y las credenciales de comunicación.

## 4. Trabajo realizado hasta el momento

### 4.1. Servidor

Se desarrolló la estructura principal del servidor en `server.js`, utilizando Express. Se configuró para recibir solicitudes en formato JSON, servir los archivos estáticos de la carpeta `public` y utilizar el puerto definido mediante variables de entorno.

Actualmente, el puerto configurado para el servidor es `3000`.

### 4.2. Interfaz del cajero automático

Se trabajó en la interfaz principal del cajero, donde se muestran diferentes opciones para el usuario:

- Consultar saldo.
- Retirar efectivo.
- Depositar efectivo.
- Consultar movimientos.


### 4.3. Panel de administración

Se desarrolló una interfaz independiente para el administrador. En ella se muestran elementos como el estado del cajero y el efectivo disponible.

También se trabajó en una sección para abastecer el cajero y otra para visualizar movimientos bancarios. La información que se muestra depende de los datos disponibles y de las solicitudes realizadas al servicio correspondiente.

### 4.4. Servicio para administrar el efectivo

Se creó el archivo `src/services/efectivo.js`, encargado de administrar el efectivo local del cajero.

Entre las funciones desarrolladas se encuentran:

- Consultar el efectivo disponible.
- Agregar efectivo al cajero.
- Retirar efectivo del monto disponible.
- Validar que las cantidades sean numéricas, finitas y mayores que cero.
- Evitar que se retire una cantidad superior al efectivo disponible.

Para las pruebas locales, el servicio utiliza un monto inicial de $10,000. Este valor corresponde al efectivo simulado del cajero y no al saldo de una cuenta bancaria.

### 4.5. Rutas del cajero

Se trabajó en el archivo `src/routes/cajero_atm.js`, donde se definen las rutas relacionadas con las funciones del cajero.

Entre las rutas desarrolladas se encuentran:

- `GET /api/atm/status`: permite consultar el estado del cajero.
- `GET /api/atm/efectivo`: permite consultar el efectivo disponible.
- `POST /api/atm/agregar`: permite solicitar que se agregue efectivo al cajero.

Estas rutas forman parte de la API local del proyecto. Las demás operaciones deben verificarse para determinar si ya están implementadas y funcionando correctamente.

### 4.6. Configuración para la conexión con Banco Central

Se configuraron variables de entorno para preparar la comunicación con la API de Banco Central, alojada en Render.

Las variables utilizadas son:

- `PORT`: define el puerto del servidor ATM.
- `CENTRAL_API_URL`: contiene la dirección base de la API de Banco Central.
- `CENTRAL_CREATE_ACCOUNT_PATH`: define la ruta configurada para la operación de creación de cuentas.
- `SUCURSAL_API_KEY`: contiene la clave utilizada para la comunicación con el servicio correspondiente.

La configuración permite establecer la dirección del servicio central y los parámetros necesarios para las solicitudes. El funcionamiento completo de cada operación depende de cómo se utilicen estas variables en el código y de la respuesta que proporcione Banco Central.

Por seguridad, los valores reales de las claves se mantienen en el archivo `.env` y no deben publicarse en el repositorio.

## 5. Estructura del proyecto

La estructura de archivos trabajada hasta el momento es la siguiente:

```text
cajero_ATM/
├── server.js
├── package.json
├── public/
│   ├── index.html
│   ├── administrador.html
│   ├── administrador.js
│   ├── funcionalidades.js
│   └── styles.css
└── src/
    ├── routes/
    │   └── cajero_atm.js
    └── services/
        ├── efectivo.js
        └── bancoCentral.js
```

Cada archivo tiene una responsabilidad específica. Los archivos HTML contienen las interfaces, los archivos JavaScript del directorio `public` controlan parte de su interacción, las rutas reciben las solicitudes y los servicios contienen la lógica de las operaciones.

## 6. Funciones que se planea agregar

### 6.1. Inicio de sesión y perfiles

Se planea contar con un inicio de sesión que permita identificar si la persona desea ingresar como cliente o como administrador.

Según el tipo de usuario, el sistema deberá mostrar la interfaz correspondiente. También será necesario implementar una validación adecuada de las credenciales y proteger las funciones administrativas.

### 6.2. Integración completa con Banco Central

Se busca completar y comprobar la comunicación entre ATM Express y el servidor Banco Central para que las operaciones bancarias no dependan únicamente de los datos locales del cajero.

Esto incluye verificar las rutas, las credenciales utilizadas y el formato de las solicitudes y respuestas.

### 6.3. Retiros y consultas de saldo

Se planea completar el retiro de efectivo y la consulta de saldo mediante la conexión bancaria. Antes de entregar efectivo, el sistema deberá verificar la cuenta y comprobar que existan fondos suficientes.

### 6.4. Administración del efectivo

Se busca conectar el abastecimiento del cajero con la información registrada en Banco Central, de manera que el efectivo local corresponda al nodo adecuado.

### 6.5. Movimientos y reportes

Se planea mejorar la consulta de movimientos para mostrar información clara sobre las operaciones realizadas, como el tipo de operación, el monto, la fecha y el nodo relacionado.

### 6.6. Identificación del nodo ATM

Se busca que cada cajero utilice el identificador que le corresponda en Banco Central. De esta manera, las consultas y operaciones estarán relacionadas con el nodo correcto, sin depender de un identificador fijo.

### 6.7. Validaciones y seguridad

Se planea reforzar las validaciones de las solicitudes, proteger las operaciones administrativas y manejar adecuadamente los errores de comunicación con Banco Central.

También se busca evitar que las claves de acceso y otros datos de configuración queden expuestos en las interfaces públicas o en el repositorio.

## 7. Estado actual del proyecto

ATM Express cuenta con una estructura inicial del servidor, una interfaz para el cajero, un panel de administración, un servicio para gestionar efectivo local y rutas básicas para consultar el estado y el efectivo disponible.

Además, se cuenta con variables de entorno para configurar el puerto y preparar la comunicación con Banco Central. Sin embargo, todavía es necesario comprobar el funcionamiento de las operaciones que dependen de dicha conexión.

## 8. Conclusión

El desarrollo de ATM Express ha permitido aplicar conocimientos de JavaScript, Node.js, Express.js, creación de interfaces y organización de una aplicación mediante rutas y servicios.

El siguiente paso es completar las funciones pendientes y verificar la integración con Banco Central. Con ello, se busca avanzar de una simulación local hacia un sistema de cajero automático conectado con un servicio bancario centralizado.