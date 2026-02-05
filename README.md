# Food Truck Delicias - AI WhatsApp Bot

> **Materia:** Interacción Humano-Computador (IHC)
> **Semestre:** 4to - Ingeniería de Software
> **Periodo:** 2025-2026

## Descripción del Proyecto

Este repositorio aloja el código fuente de un **Agente Conversacional Inteligente** desplegado en WhatsApp, diseñado para la automatización de pedidos en el sector gastronómico. A diferencia de los chatbots tradicionales basados en árboles de decisión rígidos, este sistema integra **Inteligencia Artificial (OpenAI GPT-3.5)** para procesar lenguaje natural, permitiendo una interacción fluida y flexible con el usuario.

El sistema es capaz de interpretar intenciones complejas, gestionar el estado del carrito de compras en tiempo real y persistir la información de las sesiones mediante una base de datos NoSQL.

---

## ⚙️ Arquitectura y Funcionalidades

### 1. Procesamiento de Lenguaje Natural (NLP)
El núcleo del bot utiliza la API de OpenAI para interpretar los mensajes del usuario. Esto permite:
* **Detección de Intenciones:** Diferencia entre consultas de menú, agregación de productos, eliminación de ítems y cierre de venta.
* **Manejo de Contexto:** Entiende instrucciones compuestas como *"Quiero dos hamburguesas clásicas y quítame la coca-cola"*.
* **Function Calling:** Mapea las instrucciones del usuario a funciones ejecutables en el backend (`add_to_cart`, `remove_from_cart`).

### 2. Gestión Robusta de Pedidos
* **Validación Lógica:** Algoritmos que previenen errores comunes (cantidades negativas, spam, inconsistencias numéricas).
* **Feedback Inmediato:** El sistema retorna el estado actualizado del carrito automáticamente tras cada modificación.
* **Persistencia:** Uso de MongoDB para mantener la sesión del usuario activa y recuperar el carrito en caso de interrupciones.

### 3. Experiencia Visual (Rich Media)
* Envío automatizado del menú en formato de imagen/PDF mediante la API de WhatsApp Business (Twilio).
* Generación de tickets de venta detallados al finalizar la transacción.

---

## 🛠️ Stack Tecnológico

* **Runtime Environment:** Node.js
* **Framework Web:** Express.js
* **Inteligencia Artificial:** OpenAI API (GPT-3.5 Turbo)
* **Mensajería:** Twilio API for WhatsApp
* **Base de Datos:** MongoDB Atlas
* **Tunneling:** Ngrok (Entorno de desarrollo)

---

## 📂 Estructura del Proyecto

El código sigue una arquitectura modular para facilitar la escalabilidad:

* `src/controllers`: Manejo de las solicitudes entrantes (Webhooks).
* `src/services`: Lógica de negocio (OpenAI, Twilio, Gestión de Órdenes).
* `src/models`: Esquemas de datos (Mongoose) para usuarios y menú.
* `src/utils`: Herramientas auxiliares y formateo.

---

## 🚀 Instalación y Despliegue

### Prerrequisitos
* Node.js v18+
* Cuenta activa en MongoDB Atlas
* Credenciales de Twilio y OpenAI

### Pasos
1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/drahcirok/foodtruck-whatsapp-bot.git](https://github.com/drahcirok/foodtruck-whatsapp-bot.git)
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configuración de entorno:**
    Crear un archivo `.env` en la raíz con las siguientes variables:
    ```env
    PORT=3000
    MONGODB_URI=tu_cadena_de_conexion
    TWILIO_ACCOUNT_SID=tu_sid
    TWILIO_AUTH_TOKEN=tu_token
    TWILIO_PHONE_NUMBER=numero_sandbox
    OPENAI_API_KEY=tu_api_key_openai
    ```

4.  **Ejecución:**
    ```bash
    npm run dev
    ```

---

## 📸 Evidencia de Funcionamiento

| Menú Principal | Gestión del Carrito | Ticket Final |
|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/f1157dad-ce3e-4a9e-941f-c6a4021b0804" width="250" /> | <img src="https://github.com/user-attachments/assets/7b36d427-0e48-4071-98fc-3b9c69e25a05" width="250" /> | 

---

**Desarrollado por:** Richard [Tu Apellido]
