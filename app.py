import sqlite3
import time
import threading
from flask import Flask, jsonify, render_template, request, g
from confi import ApiBinance, Calcular, Formatear, CalcularUsdt

# Configuracion App
app = Flask(__name__)

# Evita varias peticiones
lock = threading.Lock()


# Actualiza los precios en la base de datos
def ActualizarPrecios(fiat, tipo):
    TiempoActual = time.time()
    fiat = fiat.upper()

    with lock:
        db = GetDb()

        # Obtiene el timepo de db
        TiempoDB = db.execute(
            f"SELECT MAX(tiempo) as ultimo_tiempo FROM {tipo} WHERE fiat = ?", (fiat,)
        ).fetchone()
        Expira = (
            TiempoDB["ultimo_tiempo"] if TiempoDB and TiempoDB["ultimo_tiempo"] else 0
        )

        # Actualiza si solo pasan 20s
        Tiempo = 20
        if TiempoActual - Expira >= Tiempo:

            # Obtener los precios de fiat y tipo
            resultado = ApiBinance(fiat, tipo)
            if resultado:
                if tipo not in ["BUY", "SELL"]:
                    raise ValueError("ERROR")

                # Borrar datos anteriores
                db.execute(f"DELETE FROM {tipo} WHERE fiat=?", (fiat,))
                # Actualizar datos
                Datos = [
                    (
                        item["usuario"],
                        item["precio"],
                        item["disponible"],
                        item["min"],
                        item["max"],
                        item["fiat"],
                        TiempoActual,
                    )
                    for item in resultado
                ]
                db.executemany(
                    f""" INSERT INTO {tipo} (
                    usuario, 
                    precio, 
                    disponible, 
                    min, 
                    max,
                    fiat,
                    tiempo) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    Datos,
                )
                db.commit()
                # print(f"ACtualizado {fiat}, {tipo}")
            else:
                # Si la api no devuelve datos, se usa de la base de datos
                return
        else:
            # print("no tiempo")
            return


# Conexion a la base de datos
def GetDb():
    if "db" not in g:
        g.db = sqlite3.connect("DB.db")
        g.db.row_factory = sqlite3.Row
    return g.db


# Cierra conexion de la base de datos
@app.teardown_appcontext
def cerrar(exception):
    db = g.pop("db", None)
    if db is not None:
        db.close()


# Obtener precios de fiat y tipo
def Precio(fiat, tipo):

    # Actualiza la base de datos
    ActualizarPrecios(fiat, tipo)

    # Obtennemos los preciso de la base de datos
    db = GetDb()
    precio = db.execute(f"SELECT precio FROM {tipo} WHERE fiat = ?", (fiat,)).fetchone()

    if precio is not None:
        return precio["precio"]
    return None

# Fiats
Fiats = {"BOB", "ARS", "PEN", "USD", "COP", "EUR", "VES"}

# La pagina Principal


@app.route("/", methods=["GET", "POST"])
def index():
    # Get muestra index y post para realizar la operacion
    if request.method == "POST":

        # verifica que se manden formatos json
        if not request.is_json:
            return jsonify({"success": False, "Error": "No permitido"}), 403

        Datos = request.get_json()
        FiatA = Datos.get("FA")
        FiatB = Datos.get("FB")
        monto = Datos.get("monto")

        if not FiatA or not FiatB or not monto:
            return jsonify({"success": False, "Error": "Complete los Datos"})
        
        # Validar Fiats
        if FiatA not in Fiats:
            return jsonify({"success": False, "Error": "Fiat no valido"})
        
        if FiatB not in Fiats:
            return jsonify({"success": False, "Error": "Fiat no valido"})
        
        # LLama a precio para obtnener datos o actualizar la base de datos
        PrecioA = Precio(FiatA, "BUY")
        PrecioB = Precio(FiatB, "SELL")

        if PrecioA is None or PrecioB is None:
            return jsonify({"success": False, "Error": "Precios no obtenidos"})

        try:
            # El monto de la comision se fija
            # Puede ser modificada la variable MontoComision
            MontoComision = 0.14

            a = Formatear(PrecioA)
            b = Formatear(PrecioB)
            Monto = Formatear(monto)
            comision = Formatear(MontoComision)

            Resultado = Calcular(a, b, Monto, comision)

        except Exception as e:
            return jsonify({"success": False, "Error": "No se pudo calcular"})

        return jsonify({"success": True, "resultado": Resultado})
    else:
        return render_template("index.html")


# Pagian compra o venta de usdt
@app.route("/USDT", methods=["GET", "POST"])
def usdt():
    if request.method == "POST":

        if not request.is_json:
            return jsonify({"success": False, "Error": "No permitido"}), 403

        Datos = request.get_json()
        tipo = Datos.get("Tipo")
        Fiat = Datos.get("Fiat")
        por = Datos.get("Por")
        monto = Datos.get("Monto")

        if not tipo or not Fiat or not monto or not por:
            return jsonify({"success": False, "Error": "Complete los Datos USDT"})

        # El tipo de operacion debe ser solo BUY o SELL
        if tipo == "compra":
            Tipo = "BUY"
        elif tipo == "venta":
            Tipo = "SELL"
        else:
            return jsonify({"success": False, "Error": "No permitido tipo"})

        if Fiat not in Fiats:
            return jsonify({"success": False, "Error": "Fiat no valido"})

        # Obtener el precio de ese fiat y actualizar la base de datos
        precioFiat = Precio(Fiat, Tipo)
        if precioFiat is None:
            return jsonify({"success": False, "Error": "Precios no obtenidos"})

        try:
            precio = Formatear(precioFiat)
            monto = Formatear(monto)
            comision = Formatear(0.07)

            # Convierte el valor esperado
            if por == "fiat":
                POR = "Fiat"
            elif por == "usdt":
                POR = "USDT"
            else:
                return jsonify({"success": False, "Error": "No permitido Por"})
            Resultado = CalcularUsdt(precio, monto, comision, POR, Tipo)
        except Exception as e:
            return jsonify({"success": False, "Error": "No se pudo calcular"})

        return jsonify({"success": True, "ResultadoUsdt": str(Resultado)})


# Debug en local
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
