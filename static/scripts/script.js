/* ELEMENTOS HTML PRINCIPALES  */

const SelectFiatA = document.getElementById("select-fiat-c-a");
const SelectFiatB = document.getElementById("select-fiat-c-b");
const SelectFiatUsdt = document.getElementById('select-fiat-usdt-a');

const CardConvertidor = document.getElementById('convertidor');
const CardUsdt = document.getElementById('usdt');

const BtnNav1 = document.getElementById('btn-nav-1');
const BtnNav2 = document.getElementById('btn-nav-2');


const BtnCompra = document.getElementById('btn-usdt-compra');
const BtnVenta = document.getElementById('btn-usdt-venda');

const TituloUsdt = document.getElementById('title-usdt');

const BtnPorFiat = document.getElementById('btn-usdt-por-f');
const BtnPorUsdt = document.getElementById('btn-usdt-por-u');

const MontoUsdt = document.getElementById('monto-usdt');
const MontoConvertidor = document.getElementById("monto-convertidor");

const ResultadoUsdt = document.getElementById("result-usdt");
const resultadoConvertidor = document.getElementById("result-convertidor");

/* Desabilita el valor si ambos select tienen el mismo fiat */
function check() {
    const VFA = SelectFiatA.value;
    const VFB = SelectFiatB.value;
    for (let opt of SelectFiatB.options) {
        if (opt.value === VFA) {
            opt.disabled = true;
        } else {
            opt.disabled = false;
        }
    }
    for (let opt of SelectFiatA.options) {
        if (opt.value === VFB) {
            opt.disabled = true;
        } else {
            opt.disabled = false;
        }
    }
    TextoConvertir();
}

/* Eventos del DOM*/
document.addEventListener(
    "DOMContentLoaded", () => {
        SelectFiatA.addEventListener("change", check);
        SelectFiatB.addEventListener("change", check);
        SelectFiatUsdt.addEventListener("change", ActualizarBtnPorFiat);
        check();
        BtnNav('1');
        BtnUsdtPor('fiat');
    }
);

/*  Intercambia los valores de Select A - Select B */
function IntercambiarSelect() {
    const tmp = SelectFiatA.value;
    SelectFiatA.value = SelectFiatB.value;
    SelectFiatB.value = tmp;
    check()
    Convertidor();
}
/* Cambia las tarjetas del convertidor o usdt y los botones de nav*/
function BtnNav(v) {
    /* const CristalBtn = document.querySelector('.btn-usdt.on'); */
    if (v === '1') {
        CardConvertidor.classList.remove('off');
        CardUsdt.classList.add('off');
        BtnNav1.classList.add('on');
        BtnNav2.classList.remove('on');
        /* moverbtn(CristalBtn); */
    } else {
        CardUsdt.classList.remove('off');
        CardConvertidor.classList.add('off');
        BtnNav2.classList.add('on');
        BtnNav1.classList.remove('on');
        /* moverbtn(CristalBtn); */
        ActualizarBtnPorFiat();
    }
}

/* Cambia el titulo y los estados del btn compra y venta */
function BtnUsdt(a) {
    if (a === 'compra') {
        BtnCompra.classList.add('on');
        BtnVenta.classList.remove('on');
        TituloUsdt.textContent = 'Comprar USDT';
        TextoUsdt({ TIPO: a });
    } else {
        BtnVenta.classList.add('on');
        BtnCompra.classList.remove('on');
        TituloUsdt.textContent = 'Vender USDT';
        TextoUsdt({ TIPO: a });
    }
    usdt();
}

/* Actualiza el btn segun el fiat selecionado*/
function ActualizarBtnPorFiat() {
    let f = SelectFiatUsdt.value;
    BtnPorFiat.textContent = `Por ${f}`;
    TextoUsdt();
    usdt();
}
function BtnUsdtPor(v) {
    if (v === 'usdt') {
        BtnPorUsdt.classList.add('on');
        BtnPorFiat.classList.remove('on');
        TextoUsdt({ POR: v });
    } else {
        BtnPorFiat.classList.add('on');
        BtnPorUsdt.classList.remove('on');
        TextoUsdt({ POR: v });
    }
    usdt();
}


/* Inserta los resultados de la pagina usdt */
function TextoUsdt({ TIPO, POR, FIAT, MONTO = "0" } = {}) {
    if (!TIPO) {
        let b = document.getElementById("btn-usdt-compra").classList.contains("on");
        TIPO = b ? 'compra' : 'venta';
    }
    if (!POR) {
        let p = document.getElementById("btn-usdt-por-f").classList.contains("on");
        POR = p ? 'fiat' : 'usdt';
    }
    if (!FIAT) {
        FIAT = SelectFiatUsdt.value;
    }

    let recibo;
    let ope;

    if (TIPO === 'compra') {
        if (POR === 'fiat') {
            recibo = 'USDT';
            ope = 'Recibes';
        } else {
            recibo = FIAT;
            ope = 'Pagas';
        }
    } else {
        if (POR === 'fiat') {
            recibo = 'USDT';
            ope = 'Venderás';
        } else {
            recibo = FIAT;
            ope = 'Recibes';
        }
    }
    ResultadoUsdt.innerHTML = `<p>${ope}</p>
                                <div class="monto-fiat">
                                <p>${MONTO}</p>
                                <p>${recibo}</p>
                                </div>`;
}
let time;
function usdt() {
    clearTimeout(time);
    const v = MontoUsdt.value;
    let error = alerta(v, '2');
    if (error) { return };
    const monto = MontoUsdt?.value;
    const m = monto ? String(monto) : '';
    if (!m || m.trim() === "") {
        TextoUsdt();
        return;
    }
    time = setTimeout(async () => {
        const vM = MontoUsdt?.value;
        if (!vM || isNaN(vM) || vM.trim() === "" || Number(vM) <= 0) {
            TextoUsdt();
            return;
        }
        const b = BtnCompra.classList.contains("on");
        const tipo = b ? 'compra' : 'venta';
        const f = SelectFiatUsdt.value;
        const m = MontoUsdt.value;
        const p = BtnPorFiat.classList.contains("on");
        const por = p ? 'fiat' : 'usdt';

        try {
            const datos = await fetch("/USDT", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ Tipo: tipo, Fiat: f, Monto: m, Por: por })
            });
            const resul = await datos.json();
            if (resul.success) {
                TextoUsdt({ MONTO: resul.ResultadoUsdt, TIPO: tipo, FIAT: f, POR: por });
            } else {
                ResultadoUsdt.innerHTML = `<p>Error: ${resul.Error}</p>`;
            }

        } catch (e) {
            console.error("Error:", e);
            ResultadoUsdt.innerHTML = `<p>${e}</p>`;
        }
    }, 500);
}
let time2;
function Convertidor() {
    clearTimeout(time2);
    const v = MontoConvertidor.value;
    let error = alerta(v, '1');
    if (error) { return };
    const monto = MontoConvertidor?.value;
    const m = monto ? String(monto) : '';
    if (!m || m.trim() === "") {
        TextoConvertir();
        return;
    }
    time2 = setTimeout(async () => {
        const vM = MontoConvertidor?.value;
        if (!vM || isNaN(vM) || vM.trim() === "" || Number(vM) <= 0) {
            TextoConvertir();
            return;
        }
        const fa = SelectFiatA.value;
        const fb = SelectFiatB.value;
        const monto = MontoConvertidor.value;
        try {
            const datos = await fetch("/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ FA: fa, FB: fb, monto: monto })
            });
            const resul = await datos.json();
            if (resul.success) {
                TextoConvertir({ FIATB: fb, MONTO: resul.resultado });
            } else {
                resultadoConvertidor.innerHTML = `<p>Error: ${resul.Error}</p>`;
            }
        } catch (e) {
            console.error("Error:", e);
            resultadoConvertidor.innerHTML = `<p>${e}</p>`;
        }
    }, 500);
}

/* Inserta los resultados de la pagina principal */
function TextoConvertir({ FIATB, MONTO = "0" } = {}) {
    if (!FIATB) {
        FIATB = SelectFiatB.value;
    }
    resultadoConvertidor.innerHTML = `<p>Recibes</p>
                        <div class="monto-fiat">
                            <p>${MONTO}</p>
                            <p>${FIATB}</p>
                        </div>`;
}
function alerta(a, b) {
    const c = document.getElementById('input-convertidor');
    const t = document.getElementById('p-alerta');
    const c2 = document.getElementById('input-usdt-alert');
    const t2 = document.getElementById('p-alerta-usdt');
    if (String(a).length > 11) {
        if (b === '1') {
            t.classList.add('on');
            c.classList.add('alertas');
            t.textContent = 'Limite Superado';
            return true;
        } else {
            t2.classList.add('on');
            c2.classList.add('alertas');
            t2.textContent = 'Limite Superado';
            return true;
        }
    }
    if (b === '1') {
        t.classList.remove('on');
        c.classList.remove('alertas');
        t.textContent = 'Min - Max';
    } else {
        t2.classList.remove('on');
        c2.classList.remove('alertas');
        t2.textContent = 'Min - Max';
    }
    return false;
}
/* function moverbtn(boton) {
    const indicador = boton.parentElement.querySelector('.btn-on');
    if (!indicador) return;
    const ancho = boton.offsetWidth;
    const izquierda = boton.offsetLeft;
    indicador.style.width = `${ancho}px`;
    indicador.style.transform = `translateX(${izquierda}px) scale(1.1)`;
}
 */