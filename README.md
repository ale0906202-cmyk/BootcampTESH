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
