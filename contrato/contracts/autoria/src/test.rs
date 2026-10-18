#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, String};

fn preparar() -> (Env, AutoriaContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths();
    let id = env.register(AutoriaContract, ());
    let client = AutoriaContractClient::new(&env, &id);
    (env, client)
}

#[test]
fn registra_y_verifica() {
    let (env, client) = preparar();
    let autor = Address::generate(&env);
    let hash = BytesN::from_array(&env, &[1u8; 32]);
    let titulo = String::from_str(&env, "Logo Cafe Azul");

    client.registrar(&autor, &hash, &titulo);

    let reg = client.verificar(&hash).unwrap();
    assert_eq!(reg.autor, autor);
    assert_eq!(reg.titulo, titulo);
}

#[test]
fn hash_inexistente_devuelve_none() {
    let (env, client) = preparar();
    let hash = BytesN::from_array(&env, &[9u8; 32]);
    assert!(client.verificar(&hash).is_none());
}

#[test]
fn rechaza_hash_duplicado() {
    let (env, client) = preparar();
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let hash = BytesN::from_array(&env, &[2u8; 32]);
    let titulo = String::from_str(&env, "Ilustracion");

    client.registrar(&a, &hash, &titulo);
    let resultado = client.try_registrar(&b, &hash, &titulo);
    assert!(resultado.is_err());

    assert_eq!(client.verificar(&hash).unwrap().autor, a);
}

#[test]
fn lista_obras_por_autor() {
    let (env, client) = preparar();
    let autor = Address::generate(&env);
    let h1 = BytesN::from_array(&env, &[3u8; 32]);
    let h2 = BytesN::from_array(&env, &[4u8; 32]);
    let titulo = String::from_str(&env, "Mockup");

    client.registrar(&autor, &h1, &titulo);
    client.registrar(&autor, &h2, &titulo);

    assert_eq!(client.obras_de(&autor).len(), 2);
}
