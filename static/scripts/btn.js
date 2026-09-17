/* Codigo desarrollado con apoyo de IA (ChatGPT).
Utilizado para desarrollar la funcion de crearSliderBotones();
esta funcion se encarga de mover y posicionar el 
boton para que tenga un fecto de movimiento sobre el boton avtivo,
ademas gestiona el desplazamiento por raton y tactil */


function crearSliderBotones(
    selectorContenedor,
    selectorBotones,
    selectorIndicador,
    idBotonInicial,
    escalaNormal = 1.1,
    escalaPresionado = 1.27
) {
    const contenedor = document.querySelector(selectorContenedor);

    if (!contenedor) return;

    const indicador = contenedor.querySelector(selectorIndicador);
    const botones = contenedor.querySelectorAll(selectorBotones);

    if (!indicador || botones.length === 0) return;

    let botonActivoActual = null;
    let arrastrando = false;
    let seMovio = false;


    // --------------------------------------------------
    // MOVER INDICADOR
    // --------------------------------------------------

    function moverIndicadorA(boton, escala = escalaNormal) {
        if (!boton) return;

        const ancho = boton.offsetWidth;
        const izquierda = boton.offsetLeft;

        indicador.style.width = `${ancho}px`;
        indicador.style.transform =
            `translateX(${izquierda}px) scale(${escala})`;
    }


    // --------------------------------------------------
    // BOTÓN INICIAL
    // --------------------------------------------------

    const primerBoton =
        contenedor.querySelector(idBotonInicial) || botones[0];

    if (primerBoton) {
        botonActivoActual = primerBoton;

        // Esperamos a que el navegador termine de calcular
        // el layout antes de obtener offsetWidth.
        requestAnimationFrame(() => {
            moverIndicadorA(primerBoton);
        });
    }


    // --------------------------------------------------
    // REACCIONAR A CAMBIOS DE TAMAÑO
    // --------------------------------------------------

    const actualizarIndicador = () => {
        if (botonActivoActual && !arrastrando) {
            moverIndicadorA(botonActivoActual);
        }
    };

    window.addEventListener('resize', actualizarIndicador);
    window.addEventListener('load', actualizarIndicador);

    if (window.ResizeObserver) {
        const observer = new ResizeObserver(() => {
            actualizarIndicador();
        });

        botones.forEach(boton => {
            observer.observe(boton);
        });
    }


    // --------------------------------------------------
    // EVENTOS DE LOS BOTONES
    // --------------------------------------------------

    botones.forEach(boton => {

        boton.addEventListener('click', () => {

            // Un click normal selecciona el botón.
            botonActivoActual = boton;

            moverIndicadorA(
                boton,
                escalaNormal
            );
        });


        const iniciarArrastre = () => {

            arrastrando = true;
            seMovio = false;

            botonActivoActual = boton;

            moverIndicadorA(
                boton,
                escalaPresionado
            );
        };


        boton.addEventListener(
            'mousedown',
            iniciarArrastre
        );

        boton.addEventListener(
            'touchstart',
            iniciarArrastre,
            { passive: true }
        );
    });


    // --------------------------------------------------
    // DETECTAR BOTÓN DEBAJO DEL CURSOR
    // --------------------------------------------------

    const manejarMovimiento = (clientX) => {

        if (!arrastrando) return;

        botones.forEach(boton => {

            const rect = boton.getBoundingClientRect();

            if (
                clientX >= rect.left &&
                clientX <= rect.right
            ) {

                if (botonActivoActual !== boton) {
                    seMovio = true;
                }

                botonActivoActual = boton;

                moverIndicadorA(
                    boton,
                    escalaPresionado
                );
            }
        });
    };


    window.addEventListener(
        'mousemove',
        e => {
            manejarMovimiento(e.clientX);
        }
    );


    window.addEventListener(
        'touchmove',
        e => {

            if (e.touches.length > 0) {
                manejarMovimiento(
                    e.touches[0].clientX
                );
            }

        },
        { passive: true }
    );


    // --------------------------------------------------
    // FINALIZAR ARRASTRE
    // --------------------------------------------------

    const finalizarArrastre = () => {

        if (!arrastrando) return;

        arrastrando = false;

        if (!botonActivoActual) return;


        // Volvemos a escala normal
        moverIndicadorA(
            botonActivoActual,
            escalaNormal
        );

        if (seMovio) {

            const boton = botonActivoActual;

            // Ejecutamos el onclick del botón.
            if (typeof boton.onclick === 'function') {
                boton.onclick();
            }
        }

        seMovio = false;
    };


    window.addEventListener(
        'mouseup',
        finalizarArrastre
    );

    window.addEventListener(
        'touchend',
        finalizarArrastre
    );
}

/* Parametros para el boton de compra o venta */

crearSliderBotones(
    '.ustd-btns-compra-venta',
    '.btn-usdt',
    '.btn-on',
    '#btn-usdt-compra',
    1.1,
    1.25
);

/* Parametros para el boton de navegacion*/
crearSliderBotones(
    '.nav-btns',
    '.btn-nav',
    '.btn-on',
    '#btn-nav-1',
    1.1,
    1.25
);