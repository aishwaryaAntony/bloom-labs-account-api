import jwt from "jsonwebtoken";
import db from "../models/index";
import crypto from "../helpers/crypto";
import { JWT_PRIVATE_KEY } from "../helpers/constants";

module.exports = async (req, res, next)=> {
    try {
        const headers = req.headers;       
            if (headers.hasOwnProperty('authorization')) {
                const token = req.headers.authorization.split(" ")[1];
                const decoded = jwt.verify(token, JWT_PRIVATE_KEY);
                req.userData = decoded;
                // console.log(`Decoded -> ${JSON.stringify(decoded)}`)
               
                if(Object.keys(decoded).length > 0){      
                    
                    if(decoded.userId !== undefined){
                        let hashedUserId = await crypto.hash_from_string(decoded.userId);
                        let fetchAccount = await db.Account.findOne({ where: { hashed_user_id: hashedUserId}});
                        if(fetchAccount === null){
                            return res.status(401).json({
                                status: 'failed',
                                message: 'Auth failed'
                            });
                        }
                        if (decoded.account_token !== null && decoded.account_token !== undefined){
                            if (fetchAccount.account_token !== decoded.account_token){
                                return res.status(401).json({
                                    status: 'failed',
                                    message: 'Auth failed'
                                });
                            }
                        }
                    }else{
                        // Request from other services
                        let account_token = decoded.account_token;
                        if (account_token !== "12345") {
                            return res.status(401).json({
                                status: 'failed',
                                message: 'Auth failed'
                            });
                        }
                    }
                    
                }else{
                    return res.status(401).json({
                        status: 'failed',
                        message: 'Auth failed'
                    });
                }

                next();   
            
        } else {
            return res.status(401).json({
                status: 'failed',
                message: 'Auth failed'
            });
        }
    } catch (error) {
        return res.status(401).json({
            status: 'failed',
            message: 'Auth failed'
        });
    }    
}