"use strict";

var _constants = require("./constants");

const zlib = require("zlib");
const jose = require("node-jose");

module.exports = {
    /**
    * minified json return remove all white space
    */
    minifiedJson: payload => {
        return new Promise(async (resolve, reject) => {
            try {
                // remove all whitespace
                const minifiedCard = JSON.stringify(payload);
                // compress using "raw" DEFLATE compression (no zlib or gz headers)
                const compressedCard = zlib.deflateRawSync(minifiedCard);
                // console.log(`Compress ===> ${compressedCard}\n`)
                resolve(compressedCard);
            } catch (error) {
                reject(null);
            }
        });
    },

    /**
    * createSign json return remove all white space
    */
    createSign: minifiedJson => {
        return new Promise(async (resolve, reject) => {
            try {
                // const private_key_value = await getPrivateKeyValue('saguaroKeystore');
                let keyStoreValue = _constants.KEYSTORE;
                const key_store = await jose.JWK.asKeyStore(keyStoreValue);
                const rawKey = key_store.get(keyStoreValue.keys[0].kid);
                const key = await jose.JWK.asKey(rawKey);
                const token = await jose.JWS.createSign({ alg: 'ES256', fields: { zip: 'DEF' }, format: 'compact' }, key).update(minifiedJson).final();
                // console.log(`Token ==> ${token}\n`)
                resolve(token);
            } catch (error) {
                reject(null);
            }
        });
    },

    decryptSign: jws => {
        return new Promise(async (resolve, reject) => {
            try {
                const [header, payload, signature] = jws.split('.');
                // Decode the payload
                const decodedPayload = Buffer.from(payload, 'base64');
                // Decompress the card and extract the data into an object
                const decompressedCard = zlib.inflateRawSync(decodedPayload);
                const card = JSON.parse(decompressedCard.toString());
                // console.log(`card ==> ${JSON.stringify(card)}\n`)
                resolve(card);
            } catch (error) {
                reject(error);
            }
        });
    },

    encryptPayload: payload => {
        return new Promise(async (resolve, reject) => {
            try {
                let minifyResponsePayload = await module.exports.minifiedJson(payload);
                let createSignedPayload = await module.exports.createSign(minifyResponsePayload);

                // let decryptedPayload = await module.exports.decryptSign(createSignedPayload);
                // console.log(`\nDecrypted ==> ${JSON.stringify(decryptedPayload)}`);
                resolve(createSignedPayload);
            } catch (error) {
                reject(null);
            }
        });
    }
};