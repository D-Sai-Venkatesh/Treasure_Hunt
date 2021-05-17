const assert = require('chai').assert
const myent  = require('../Entity')
const myapp  = require('../app')


//-----------------Check if string-------------------
describe("Entity Test ", function(){
    it('Testing entity class', function(){
        let res = myent();
        assert.typeOf(res, 'string');
    });
});

// ----------------Check if = MY Class------------------
describe("Entity Test ", function(){
    it('Testing Entity class', function(){
        let res = myent();
        assert.equal(res, 'MY Class');
    });
});
// ----------------Check if = App Class-----------------
describe("App Test ", function(){
    it('Testing App class', function(){
        let res = myapp();
        assert.equal(res, 'App Class');
    });
});
// ----------------Check if = MY Class------------------
describe("App Test ", function(){
    it('Testing App class', function(){
        let res = myapp();
        assert.equal(res, 'MY Class');
    });
});

