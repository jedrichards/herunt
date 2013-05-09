module.exports = {
    setUp: function (cb) {
        this.foo = "bar";
        cb();
    },
    tearDown: function (cb) {
        cb();
    },
    test1: function (test) {
        test.equals(this.foo,"bar");
        test.done();
    }
};