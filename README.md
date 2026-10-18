HOLA, ES ES MI PRIMER COMMIT PARA EL REPOSITORIO
 Bootcamp TESH - Registro de Autoría en Stellar
Proyecto final desarrollado para el Bootcamp TESH utilizando contratos inteligentes en Soroban.

Datos de la Entrega
Contract ID: (ver sección Entregable)
Red: Stellar Testnet

## Funciones del contrato

- `registrar(autor, hash, titulo)`: guarda el hash SHA-256 de una obra con la fecha del ledger. Requiere la firma del autor y rechaza hashes duplicados.
- `verificar(hash)`: devuelve autor, título, fecha y ledger, o nada si no existe.
- `obras_de(autor)`: lista los hashes registrados por un autor.

## Cómo correr el contrato inteligente para diseñadores


1. `npm install`
2. `npm run dev` y abrir la dirección que imprime Vite
3. Conectar Freighter (red Testnet), elegir un archivo desde tu dispositivo, escribir un título y registrar

## Entregable

- **Contrato (Stellar Testnet):** CAGXF67UEBHDPSRFC6PNN6XNGIMJSHC2E5YS7B24C7GK4VW3SN2O5QWF
- **Transacción de evidencia (registrar):** https://stellar.expert/explorer/testnet/tx/ed30e5dd556f663e02b33c4b6d5ea87dc203e77230eb01a88132b5b136b8a083
- **Frontend:** Vite + Freighter (index.html y main.js)
