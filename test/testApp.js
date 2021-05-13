const assert = require('chai').assert
const myent  = require('../Entity')
const myapp  = require('../app')


describe("Entity Test ", function(){
    it('Testing entity class', function(){
        let res = myent();
        assert.typeOf(res, 'string');
    });
});

describe("App Test ", function(){
    it('Testing App class', function(){
        let res = myapp();
        assert.equal(res, 'App Class');
    });
});

describe("App Test ", function(){
    it('Testing App class', function(){
        let res = myapp();
        assert.equal(res, 'MY Class');
    });
});

// ------------------------------------------------
describe("App Test ", function(){
    it('Testing App class', function(){
        let res = myapp();
        assert.equal(res, 'MY Class');
    });
});
