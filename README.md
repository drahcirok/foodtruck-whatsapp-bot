# 🍔 Food Truck Delicias - WhatsApp Bot

> **Proyecto de Interacción Humano-Computador (IHC)**
> 4to Semestre - Ingeniería de Software

Este repositorio contiene el código fuente de un **Chatbot de WhatsApp** diseñado para automatizar la toma de pedidos en un Food Truck. El sistema permite a los usuarios ver el menú, gestionar su carrito de compras y realizar pedidos en tiempo real.

---

## 📱 Funcionalidades Principales

* **🤖 Bienvenida Visual:** Envío de menú con imágenes atractivas (Rich Media).
* **📋 Menú Interactivo:** Selección de productos por número (Hamburguesas, Bebidas, Extras).
* **🛒 Carrito Inteligente:**
    * Agregar productos.
    * Eliminar ítems específicos (ej: "Eliminar 1").
    * Opción de "Vaciar Carrito" completo.
    * Cálculo automático del total.
* **☁️ Base de Datos:** Persistencia de sesiones y pedidos usando MongoDB.
* **🧾 Ticket Virtual:** Generación de resumen de compra al finalizar.

---

## 🛠️ Tecnologías Usadas

* **Lenguaje:** Node.js (JavaScript)
* **Framework:** Express.js
* **API:** Twilio for WhatsApp
* **Base de Datos:** MongoDB Atlas
* **Túnel Local:** Ngrok

---

## 📸 Capturas del Proyecto

| Menú Principal | Gestión del Carrito |
|:---:|:---:|
| *(Aquí puedes subir tus capturas después)* | *(Aquí puedes subir tus capturas después)* |

---

## 🚀 Instalación y Uso

1.  Clonar el repositorio:
    ```bash
    git clone [https://github.com/TU_USUARIO/foodtruck-whatsapp-bot.git](https://github.com/TU_USUARIO/foodtruck-whatsapp-bot.git)
    ```
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Configurar variables de entorno (`.env`):
    ```env
    TWILIO_ACCOUNT_SID=tu_sid
    TWILIO_AUTH_TOKEN=tu_token
    MONGODB_URI=tu_mongo_uri
    ```
4.  Correr el servidor:
    ```bash
    npm run dev
    ```

---
*Desarrollado con ❤️ por [Tu Nombre]*
