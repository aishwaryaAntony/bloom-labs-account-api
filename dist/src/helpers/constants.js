"use strict";

require('dotenv').config();

module.exports = {
    NODE_ENV: process.env.NODE_ENV,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
    //ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    TEAM_IDENTIFIER: process.env.TEAM_IDENTIFIER,
    PASS_TYPE_IDENTIFIER: process.env.PASS_TYPE_IDENTIFIER,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    CLIENT_DOMAIN: "http://localhost:4000/",
    KEYSTORE: { "keys": [{ "kty": "EC", "kid": "ikebkJKpOVb7eqMSIFweiWEARx_3wckdUNKA_sh0t-U", "use": "sig", "alg": "ES256", "crv": "P-256", "x": "GJaz--V59sjMNL7a7-3_PyIRTEIIBTxk6XCzUoQgGpY", "y": "mKFr8UtpQANC-hO8xKg563scjF8Y2NpXPt7jtxzOHWc", "d": "aSRZghDdHokKaba6Gln-9Xj-CXN0WTdnLif94Mc59e8" }] },
    PRIVATE_KEYSTORE: { "keys": [{ "kty": "EC", "kid": "ikebkJKpOVb7eqMSIFweiWEARx_3wckdUNKA_sh0t-U", "use": "sig", "alg": "ES256", "crv": "P-256", "x": "GJaz--V59sjMNL7a7-3_PyIRTEIIBTxk6XCzUoQgGpY", "y": "mKFr8UtpQANC-hO8xKg563scjF8Y2NpXPt7jtxzOHWc" }] },
    S3_USER_BUCKET_NAME: process.env.S3_USER_BUCKET_NAME,
    S3_INSURANCE_BUCKET_NAME: process.env.S3_INSURANCE_BUCKET_NAME,
    S3_BUCKET_KMS_ARN: process.env.S3_BUCKET_KMS_ARN,
    S3_BUCKETS: [{ bucketName: process.env.S3_USER_BUCKET_NAME, code: "u" }, { bucketName: process.env.S3_INSURANCE_BUCKET_NAME, code: "i" }],
    MESSAGE_DOMAIN: "http://localhost:3002/"

};