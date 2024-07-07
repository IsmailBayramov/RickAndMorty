"use strict";
const fs = require("fs");
const pg = require("pg");
const axios = require("axios");

const tableName = "IsmailBayramov";

const config = {
    connectionString:
        "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
    ssl: {
        rejectUnauthorized: true,
        ca: fs
            .readFileSync("/Users/work/.postgresql/root.crt")
            .toString(),
    },
};

const conn = new pg.Client(config);

async function createTable() {
    const createQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            data JSONB
        );
    `;
    await conn.query(createQuery);
}

async function insertCharacter(character) {
    const insertQuery = `
        INSERT INTO ${tableName} (
            name, data
        ) VALUES (
            $1, $2
        );
    `;
    const values = [character.name, character];
    await conn.query(insertQuery, values);
}

async function loadCharacters() {
    let url = 'https://rickandmortyapi.com/api/character';
    while (url) {
        const response = await axios.get(url);
        const characters = response.data.results;
        for (const character of characters) {
            await insertCharacter(character);
        }
        url = response.data.info.next;
    }
}

async function main() {
    try {
        await conn.connect();
        await createTable();
        await loadCharacters();
    } catch (err) {
        console.error(err);
    } finally {
        await conn.end();
    }
}

main();
