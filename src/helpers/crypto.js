var crypto = require('crypto');
import { ENCRYPTION_KEY } from "./constants";

export default {
   
    /**
    *  hash string from parameter
    */
    hash_from_string(text) {
        return new Promise(async (resolve, reject) => {
            let data = text.toString();
            let hash = crypto.createHash('sha256',ENCRYPTION_KEY).update(data).digest('hex');
            resolve(hash)
        })
    }

}