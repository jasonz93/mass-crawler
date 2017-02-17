/**
 * Created by nicholas on 17-2-17.
 */
const expect = require('chai').expect;
const {CrawlerSession, Components} = require('../');
const {BaseMiddleware, BaseProxySelector} = Components;

class SimpleMiddleware extends BaseMiddleware {
    async execute(session, next) {
        this.options = {
            headers: {
                crawler: 'test header'
            }
        };
        return next();
    };

    async buildRequestOptions(session) {
        return this.options;
    };
}

class ErrorMiddleware extends BaseMiddleware {
    constructor(context) {
        super();
        this.context = context;
        context.retries = 0;
    }
    async execute(session, next) {
        console.log('throwing auth error');
        throw new Error('auth err');
    }

    async onError(session, err) {
        if (this.context.retries < 5) {
            console.log('retrying', ++this.context.retries);
            return true;
        }
    }
}

class FakeProxySelector extends BaseProxySelector {
    constructor(proxy) {
        super();
        this.proxy = proxy;
    }

    async select(session) {
        return this.proxy;
    }
}

describe('Crawler test', function () {
    it('Test simple middleware', function (done) {
        (async () => {
            let session = new CrawlerSession();
            session.addMiddleware(new SimpleMiddleware());
            let {response, data} = await session.request('http://www.baidu.com');
            expect(data).to.contain('html');
            expect(response.request.headers['crawler']).to.be.equal('test header');
            done();
        })().catch(done);

    });

    it('Test error middleware', function (done) {
        (async() => {
            let session = new CrawlerSession();
            let context = {};
            session.addMiddleware(new ErrorMiddleware(context));
            try {
                let {response, data} = await session.request('http://www.baidu.com');
                expect(response).to.be.equal(null, 'This should never asserted.');
            } catch (e) {
                if (e.stack && e.stack.indexOf('AssertionError') === 0) {
                    throw e;
                }
                expect(context.retries).to.be.equal(5);
            }
            done();
        })().catch(done);
    });

    it('Test proxy selector', function (done) {
        (async () => {
            let session = new CrawlerSession();
            session.addMiddleware(new FakeProxySelector('xxx'));
            try {
                let {response, data} = await session.request('http://www.baidu.com');
                expect(response).to.be.equal(null, 'This should never asserted.');
            } catch (e) {
                if (e.stack && e.stack.indexOf('AssertionError') === 0) {
                    throw e;
                }
                expect(e.message).to.contain('Invalid protocol');
            }
            done();
        })().catch(done);
    });
});