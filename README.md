# Convertidor P2P

#### Video Demo: [Ver Video](https://youtu.be/Fg7LUde0xG4)

## Descripción

Convertidor P2P es una aplicación web desarrollada como proyecto final de CS50x. El objetivo es facilitar los cálculos de conversión entre diferentes monedas fíat utilizando precios obtenidos del mercado P2P de binance.

La aplicación está pensada para personas que realizan operaciones de conversión entre monedas y necesitan conocer rápidamente cuánto podrían obtener al convertir un monto de una moneda a otra. Normalmente, para realizar esta estimación sería necesario consultar el mercado P2P, seleccionar una moneda, revisar un precio, realizar una primera operación, anotar el resultado y posteriormente volver a consultar el mercado para realizar la siguiente operación. La aplicación busca simplificar este proceso realizando los cálculos automáticamente a partir de los precios obtenidos del Mercado P2P de binance.

La aplicación no ejecuta operaciones de compra o venta, no mueve dinero real y tampoco se conecta con una cuenta de binance.  Lo que hace es consultar los precios del mercado P2P y utilizar para realizar una estimación del resultado de una conversión.

Además de la conversión entre monedas fiat, la aplicación también incluye una sección para realizar los cálculos de compra o venta con USDT.

## Funcionamiento

### Convertir

En la sección de Convertir, el usuario puede seleccionar una moneda de origen mediante el Selector **DE** y una moneda de destino mediante el Selector **A**, después introducir el mondo que desea convertir.

Actualmente, la aplicación tiene las siguientes divisas disponibles, ARS, PEN, BOB, USD, EUR, COP y VES.
Una ves introducido el monto valido, JavaScript envía una solicitud al backend. El servidor comprueba si tiene disponible el precio reciente en la base de datos o si necita ser actualizada. Posteriormente realiza los cálculos aplicando las comisiones correspondientes y devuelve el resultado.

La aplicación también evita que el usuario seleccione la misma moneda como origen y destino. Además, existe un botón que permite intercambiar las monedas seleccionadas.

El campo de monto tiene un límite de caracteres para evitar que el usuario ingrese entradas largas. Cuando el usuario supera el límite establecido, la aplicación muestra un mensaje indicando que se ha superado el límite.

### USDT

La segunda sección esta dedicada a las operaciones con USDT. El usuario puede seleccionar si desea realizar un calculo de compra o venta, elegir la moneda y determinar si el monto sea expresado en fiat o USDT.

Dependiendo de estas opciones, la aplicación realiza operaciones diferentes para obtener el resultado. Los precios utilizados son obtenidos de los anunciantes de USDT del mercado P2P de binance para la moneda seleccionada.

## Obtención de los precios desde Binance P2P

### ApiBinance()

La función ApiBinance() se encarga de realizar las consultas necesarias para obtener los datos del marcado P2P de binance.

Para realizar la solicitud utiliza los datos como la moneda fiat seleccionada y el tipo de operación. Con esos datos se construye la petición y consulta a la Api de binance.

De la respuesta obtenida, la función obtiene los datos como el nombre del anunciante, el precio, la cantidad disponible, y los límites de mínimo y máximo de la operación. Finalmente, devuelve los datos en una lista de diccionarios para el backend.

Cuando binance no proporciona datos utilizables, la aplicación puede utilizar los precios almacenados previamente en la base de datos, siempre que exista.

## Cache de precios

Una parte importante del proyecto es el sistema de almacenamiento temporal de los precios.

Realizar una nueva petición a Binance cada vez que un usuario interactúa con ala aplicación podría generar solicitudes innecesarias, especialmente si existen varias peticiones simultaneas en poco tiempo. Para evitar esto, los datos obtenidos se almacenan temporalmente en el SQLite junto con la hora en el que fueron actualizados.

Cada moneda almacenada tiene un periodo de tiempo de validez de 20 segundos. Cuando llega una nueva solicitud, el backend comprueba cuanto tiempo ha pasado desde la última actualización. Si el precio todavía se encuentra dentro de esos 20s segundos, se reutiliza el valor almacenado. Si el precio ya expiro, se realiza una nueva consulta a binance y se actualizan los datos.

Esta decisión permite reducir solicitudes innecesarias a la API de binance y al mismo tiempo mantener los precios suficientemente recientes para el propósito de la aplicación.

## Cálculos monetarios

### calcular()

La función calcular() contine la lógica principal de la sección de Convertir.

Recibe como parámetros los precios correspondientes a la moneda de origen y a la moneda de destino, el monto que se desea convertir y la comisión.

Con esos valores realiza la operación matemática necesaria para obtener el resultado de la conversión. Durante el proceso utiliza la función Formatear() para controlar la representación de los valores. Finalmente, devuelve el resultado de la operación.

### CalcularUsdt()

La función CalcularUsdt() contine la lógica de cálculo de la sección USDT.

Recibe le precio de USDT, el monto que se desea convertir, el tipo de entrada seleccionado por el usuario fiat o USDT, y el tipo de operación compra o venta.

La lógica se mantiene separada de calcular() por que las operaciones con USDT tienen diferentes combinaciones de entrada.

### Formatear()

La función Formatear() contine la lógica para dar formato a los valores monetarios.
El proyecto utiliza decimal para trabajar con los valores durante el cálculo y aplica un formato de dos decimales, también utiliza ROUN_DOWN para mantener un comportamiento consistente al limitar los resultados.

## Comisiones

La aplicación incorpora comisiones en los cálculos para aproximar el resultado de las operaciones.

Se utiliza una comisión de 0,07 para las operaciones en la sesión de USDT y la comisión 0,14 en el convertidor, el 0.14 representa una suma de dos operaciones considerando que una conversión entre dos monedas puede implicar una compra y venta.

## Backend

### app.py

El backend está desarrollado con Python y Flask.

app.py contine la configuración principal de Flask, las rutas del servidor, la conexión con SQLite, la lógica relacionada con la actualización de precios y el procesamiento general de las solicitudes del frontend.

### Rutas

La ruta principal se utiliza para mostrar la aplicación y procesar las conversiones de monedas fiat mediante solicitudes POST.

La ruta /USDT se utiliza para las los solicitudes de la sección de USDT.

El backend utiliza JSON para recibir y devolver información entre el frontend y el servidor.
También valida si los datos recibidos y genera respuestas que indican si la operación se realizó correctamente.

## Comunicación entre frontend y backend

La comunicación entre el frontend y el backend se realiza mediante JavaScript.

El archivo script.js utiliza fetch() para enviar las solicitudes POST al servidor. Flask recibe estas solicitudes, procesa los datos, realiza los cálculos y devuelve la respuesta en formato JSON.

Posteriormente JavaScript usa estas respuestas para actualizar la interfaz y mostrar el resultado al usuario sin necesidad de recargar toda la página.

## Validaciones y manejo de errores

La aplicación realiza validaciones tanto en el frontend como en el backend.

En el frontend se valida principalmente el monto ingresado por el usuario. La aplicación espera valores numéricos y estable un limite de caracteres. Cuando el usuario supera ese límite, se muestra un mensaje de Limite Superado.

El backend vuelve a validar la información recibida. Comprueba que los datos enviados tengan el formato esperado que los campos necesarios no estén vacíos y que las opciones seleccionadas correspondan a valores válidos.

Si binance no devuelve información disponible, la aplicación puede utilizar los datos previamente almacenados en la base de datos.

Cuando ocurre un error durante una operación, el backend devuelve una respuesta apropiada al frontend procesa esa respuesta para mostrar el problema al usuario.

## Base de datos

### SQLite

SQLite se utiliza para almacenar temporalmente los datos obtenidos del mercado P2P de binance.
Entre los datos almacenados se encuentran usuario del anunciante, precio, cantidad disponible, límite mínimo y máximo, moneda fiat y la hora de actualización.

Los datos se utilizan como cache y pueden actualizarse cuando expire el perdió de 20 segundos.

SQLite resulta suficiente para este proyecto por que la base de datos no se utiliza como un sistema de almacenamiento permanente de usuarios o transacciones, sino principalmente como almacenamiento temporal de los datos necesarios.

## Estructura del proyecto

### -app.py-

app.py contiene la configuración de Flask, las rutas del servidor, las conexiones con la base de datos, la actualización de precios y el procesamiento general de la aplicación,

### confi.py

Confi.py contine funciones relacionadas con la consulta al API y con los cálculos monetarios, incluyendo ApiBinance(), Calcular(), CalcularUsdt() y Formatear().

### DB.db

DB.db es la base de datos de SQLite utilizada por la aplicación para almacenar temporalmente los precios y la información necesaria para el cache.

### requirements.txt

requirements.txt contiene las dependencias externas necesarias para ejecutar la aplicación.

### templates/

La carpeta contine las plantillas HTML utilizadas por Flask.
Index.html contiene la interfaz principal de la aplicación y reúne las secciones de Convertir Y USDT.

### static/

La carpeta contine los archivos utilizados por el frontend incluyendo JavaScript, CSS, favicon y otros recursos estáticos.

## JavaScript

### script.js

script.js contine la mayor parte de la lógica de interacción de usuario en el frontend.

Se encarga de obtener los elementos del Dom, realizar validaciones, controlar los selectores de monedas, gestionar, las secciones de Convertir y USDT, realizar las solicitudes al backend, actualizar resultados y manejar determinados mensajes de error.

### btn.js

btn.js controla principalmente la interacción de los botones y si indicadores visuales.

Entre sus funciones se encuentra el comportamiento de los controles de compra y venta y determinados elementos de navegación. También maneja interacciones mediante clic, y desplazamiento o deslizamiento en dispositivos compatibles.

La lógica de estos controles se mantiene separada de script.js para dividir la lógica funcional de la aplicación y el comportamiento especifico de los elementos interactivos.

## Interfaz y diseño

La interfaz esta organizada de dos secciones principales Convertir y USDT.

La navegación permite cambiar entre ambas secciones y los controles de compra y venta utilizan indicadores visuales para mostrar cual opción esta activa.

El diseño de la interfaz toma como referencia algunos patrones de interacción conocidos en las plataformas de intercambio, con el objetivo de que los controles resulten familiares para usuarios que ya están costumbrados a ese tipo de aplicaciones.

### HTML/CSSS

HTML se utiliza para estructurar la interfaz y CSS para definir su apariencia, distribución. Tamaños, botones, tarjetas y demás elementos visuales.

### Responsive design

La aplicación también utiliza un diseño responsive para adaptarse a di referentes tamaños de pantalla, incluyendo teléfonos, tabes, y pantallas de escritorio.

### Decisiones de diseño

Una decisión importante fue separar app.py y confi.py para mantener organizado el backend y separar la lógica general del servidor de las funciones relacionadas con la API y los cálculos.

También se decidió utilizar una cache de 20 segundos para reducir solicitudes innecesarias a binance sin mantener durante demasiado tiempo información que podría quedar desactualiza.

La separación entre script.js y btn.js permite mantener independientemente la lógica principal de la aplicación y la lógica especifica de determinados controles interactivos.

## Limitaciones

* No realiza realmente operaciones de compra o venta.
* No mueve dinero real.
* No se conecta a la cuenta de un usuario en binance.
* El precio mostrado puede cambiar después realizar la consulta.
* El resultado es una estimación y no garantiza que una operación real produzca exactamente el mismo resultado.
* La aplicación depende de que la API de binance proporcione datos.
* Actualmente no cuenta con un historial permanente de conversiones.

## Tecnologías usadas

* Python
* Flask
* SQLite
* JavaScript
* HTML
* CSS
* Requests
* Decimal
* Threading

Flask y requests son dependencias externas utilizadas por el proyecto, mientras que módulos como sqlite3, time ,threading y decimal forman parte de la biblioteca estándar de Python.

## Uso de herramientas de IA

Durante el desarrollo del proyecto se utilizaron Gemini y ChatGPT como herramientas de apoyo.

Principalmente se utilizaron para resolver dudas de programación, comprender propiedades y funciones de CSS, revisar posibles errores.

Estas herramientas se utilizaron como apoyo durante el proceso de desarrollo y aprendizaje del proyecto.

## Conclusión

Convertidor P2P es una aplicación web para facilitar las consultas y cálculos relacionados con las conversiones entre monedas del mercado P2P de Binance.

El proyecto combina frontend dinámico desarrollado con HTML, CSS y JavaScript con un backend desarrollado en Python y Flask, además SQLite para almacenar temporalmente los precios.
