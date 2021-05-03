const { expect } = require('chai');
const { insertValueAtPath } = require('../../src/util/helpers');

describe('Helper Methods', () => {
  describe('insertValueAtPath', () => {
    it('should add a single value to an object', () => {
      const value = 'test_value';
      const pathArray = ['testPath1', 'testPath2', 'testPath3'];
      const obj = { testPath1: { testPath2: {} } };

      const newObj = insertValueAtPath(value, pathArray, obj);
      expect(newObj.testPath1.testPath2.testPath3).to.equal(value);
    });

    it('should add a path to a single value to an object', () => {
      const value = 'test_value';
      const pathArray = ['testPath1', 'testPath2', 'testPath3'];
      const obj = { testPath1: {} };

      const newObj = insertValueAtPath(value, pathArray, obj);
      expect(newObj.testPath1.testPath2).to.exist;
      expect(newObj.testPath1.testPath2.testPath3).to.equal(value);
    });

    it('should add a path to a single value to a new object', () => {
      const value = 'test_value';
      const pathArray = ['testPath1', 'testPath2', 'testPath3'];

      const newObj = insertValueAtPath(value, pathArray);
      expect(newObj.testPath1).to.exist;
      expect(newObj.testPath1.testPath2).to.exist;
      expect(newObj.testPath1.testPath2.testPath3).to.equal(value);
    });
  });
});
