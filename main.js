import { requestAccess, signTransaction } from "@stellar/freighter-api";
import {
  rpc,
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Address,
  xdr,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";

// ⚠️ Pega aquí la dirección (C...) de tu contrato desplegado
const CONTRACT_ID = "CDLZFC3SYJYDZT7K67VZ7SHPJVIEUVNIXF47ZG2FB2RMOQVU2HHGCYSC";

const RPC_URL = "https://soroban-testnet.stellar.org";
const PASSPHRASE = Networks.TESTNET;

const server = new rpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);

let usuario = null;
let hashRegistrar = null;
let hashVerificar = null;

const $ = (id) => document.getElementById(id);

function mostrar(id, texto, clase = "") {
  const el = $(id);
  el.className = "msg " + clase;
  el.innerHTML = texto;
}

// --- Hash SHA-256 en el navegador ---
async function hashDeArchivo(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return new Uint8Array(digest);
}

const aHex = (bytes) =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");

// --- Conectar Freighter ---
$("btn-conectar").addEventListener("click", async () => {
  try {
    const { address, error } = await requestAccess();
    if (error) throw new Error(error.message || error);
    usuario = address;
    mostrar("msg-wallet", `Conectado: <code>${address}</code>`, "ok");
    actualizarBotones();
  } catch (e) {
    mostrar("msg-wallet", `No se pudo conectar: ${e.message}`, "err");
  }
});

function actualizarBotones() {
  $("btn-registrar").disabled = !(usuario && hashRegistrar);
  $("btn-verificar").disabled = !(usuario && hashVerificar);
}

$("archivo-registrar").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  hashRegistrar = await hashDeArchivo(file);
  $("hash-registrar").textContent = aHex(hashRegistrar);
  actualizarBotones();
});

$("archivo-verificar").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  hashVerificar = await hashDeArchivo(file);
  actualizarBotones();
});

// --- Construir transacción de contrato ---
async function construirTx(metodo, ...args) {
  const cuenta = await server.getAccount(usuario);
  return new TransactionBuilder(cuenta, { fee: BASE_FEE, networkPassphrase: PASSPHRASE })
    .addOperation(contract.call(metodo, ...args))
    .setTimeout(60)
    .build();
}

// --- Registrar ---
$("btn-registrar").addEventListener("click", async () => {
  const titulo = $("titulo").value.trim();
  if (!titulo) return mostrar("msg-registrar", "Escribe un título.", "err");

  try {
    $("btn-registrar").disabled = true;
    mostrar("msg-registrar", "Preparando transacción…");

    const tx = await construirTx(
      "registrar",
      new Address(usuario).toScVal(),
      xdr.ScVal.scvBytes(hashRegistrar),
      nativeToScVal(titulo, { type: "string" })
    );

    const preparada = await server.prepareTransaction(tx);
    mostrar("msg-registrar", "Firma en Freighter…");

    const { signedTxXdr, error } = await signTransaction(preparada.toXDR(), {
      networkPassphrase: PASSPHRASE,
    });
    if (error) throw new Error(error.message || error);

    const firmada = TransactionBuilder.fromXDR(signedTxXdr, PASSPHRASE);
    const enviada = await server.sendTransaction(firmada);
    if (enviada.status === "ERROR") throw new Error("La red rechazó la transacción.");

    mostrar("msg-registrar", "Esperando confirmación…");
    let resultado = await server.getTransaction(enviada.hash);
    while (resultado.status === "NOT_FOUND") {
      await new Promise((r) => setTimeout(r, 1500));
      resultado = await server.getTransaction(enviada.hash);
    }

    if (resultado.status === "SUCCESS") {
      const link = `https://stellar.expert/explorer/testnet/tx/${enviada.hash}`;
      mostrar(
        "msg-registrar",
        `✅ Registrado. <a href="${link}" target="_blank" rel="noopener">Ver en Stellar Expert</a><br><code>${enviada.hash}</code>`,
        "ok"
      );
    } else {
      throw new Error("La transacción falló (¿hash ya registrado?).");
    }
  } catch (e) {
    mostrar("msg-registrar", `Error: ${e.message}`, "err");
  } finally {
    actualizarBotones();
  }
});

// --- Verificar (solo lectura, no cuesta nada) ---
$("btn-verificar").addEventListener("click", async () => {
  try {
    mostrar("msg-verificar", "Consultando…");
    const tx = await construirTx("verificar", xdr.ScVal.scvBytes(hashVerificar));
    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) throw new Error(sim.error);

    const reg = sim.result?.retval ? scValToNative(sim.result.retval) : null;
    if (!reg) {
      return mostrar("msg-verificar", "No hay registro de este archivo.", "err");
    }
    const fecha = new Date(Number(reg.fecha) * 1000).toLocaleString("es-MX");
    mostrar(
      "msg-verificar",
      `✅ Registrado por <code>${reg.autor}</code><br>Título: ${reg.titulo}<br>Fecha: ${fecha}`,
      "ok"
    );
  } catch (e) {
    mostrar("msg-verificar", `Error: ${e.message}`, "err");
  }
});
