/**
 * Created by nicholas on 17-2-17.
 */
'use strict';

const BaseMiddleware = require('./base_middleware');
const request = require('request');

class Executor extends BaseMiddleware {
    async execute(session, options) {
        return new Promise((resolve, reject) => {
            request(options, (err, response, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        data: data,
                        response: response
                    });
                }
            })
        })
    }
}

module.exports = Executor;