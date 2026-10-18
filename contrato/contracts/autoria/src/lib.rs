#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, String, Vec,
};

#[cfg(test)]
mod test;

const TTL_MINIMO: u32 = 100_000;
const TTL_EXTENDIDO: u32 = 500_000;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Registro(BytesN<32>),
    PorAutor(Address),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Registro {
    pub autor: Address,
    pub titulo: String,
    pub fecha: u64,
    pub ledger: u32,
}

#[contract]
pub struct AutoriaContract;

#[contractimpl]
impl AutoriaContract {
    pub fn registrar(env: Env, autor: Address, hash: BytesN<32>, titulo: String) {
        autor.require_auth();

        let key = DataKey::Registro(hash.clone());
        if env.storage().persistent().has(&key) {
            panic!("este hash ya fue registrado");
        }

        let registro = Registro {
            autor: autor.clone(),
            titulo,
            fecha: env.ledger().timestamp(),
            ledger: env.ledger().sequence(),
        };
        env.storage().persistent().set(&key, &registro);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_MINIMO, TTL_EXTENDIDO);

        let akey = DataKey::PorAutor(autor.clone());
        let mut lista: Vec<BytesN<32>> = env
            .storage()
            .persistent()
            .get(&akey)
            .unwrap_or(Vec::new(&env));
        lista.push_back(hash.clone());
        env.storage().persistent().set(&akey, &lista);
        env.storage()
            .persistent()
            .extend_ttl(&akey, TTL_MINIMO, TTL_EXTENDIDO);

        env.events()
            .publish((symbol_short!("registro"), autor), hash);
    }

    pub fn verificar(env: Env, hash: BytesN<32>) -> Option<Registro> {
        env.storage().persistent().get(&DataKey::Registro(hash))
    }

    pub fn obras_de(env: Env, autor: Address) -> Vec<BytesN<32>> {
        env.storage()
            .persistent()
            .get(&DataKey::PorAutor(autor))
            .unwrap_or(Vec::new(&env))
    }
}
