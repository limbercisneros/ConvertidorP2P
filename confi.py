from decimal import Decimal, ROUND_DOWN
import requests

# Codigo desarrollado con apoyo de IA (Gemini: Flash-Lite).
# utilizado para revisar la funcion de ApiBinance(fiat, tipo)
# para la estructura de la peticion a la api
# OBTENER LOS DATOS DE API 
def ApiBinance(fiat, tipo):
    url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
    payload = {
        "asset": "USDT",
        "fiat": fiat,
        "merchantCheck": True,
        "publisherType": "merchant",
        "page": 1,
        "rows": 1,
        "tradeType": tipo,
        "transAmount": "",
        "payTypes": [],
    }
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        data = response.json()

        resultados = []
        if data.get("success"):
            for item in data["data"]:
                resultados.append(
                    {
                        "usuario": item["advertiser"]["nickName"],
                        "precio": float(item["adv"]["price"]),
                        "disponible": float(item["adv"]["surplusAmount"]),
                        "min": float(item["adv"]["minSingleTransAmount"]),
                        "max": float(item["adv"]["maxSingleTransAmount"]),
                        "fiat": fiat,
                    }
                )
        return resultados
    except Exception as e:
        print(f"Error api: {e}")
        return []


#  CONVIERTE FIAT(A) A FIAT(B)
def Calcular(a, b, monto, comision):
    # Calcula usando solo los dos decimales

    # Dividir monto / a
    usd = Formatear((monto / a))
    # Restar comision luego * b
    resultado = (usd - comision) * b
    return Formatear(resultado)
    

#  CALCULA COMPRA O VENTA
def CalcularUsdt(precio, monto, comision, por, tipo):
    if tipo == "BUY":
        if por == "Fiat":
            usdt = Formatear((monto / precio))
            ResultadoBuyFiat = Formatear((usdt - comision))
            return ResultadoBuyFiat
        else:
            USDT = Formatear((monto + comision))
            ResultadoBuyUsdt = Formatear((USDT * precio))
            return ResultadoBuyUsdt
    else:
        if por == "Fiat":
            usdt = Formatear((monto / precio))
            ResultadoSellFiat = Formatear((usdt + comision))
            return ResultadoSellFiat
        else:
            USDT = Formatear((monto - comision))
            ResultadoSellUsdt = Formatear((USDT * precio))
            return ResultadoSellUsdt


# SOLO TOMAR LOS 2 DECIAMLES "0.00"
def Formatear(v):
    f = Decimal(str(v))
    return f.quantize(Decimal("0.01"), rounding=ROUND_DOWN)
