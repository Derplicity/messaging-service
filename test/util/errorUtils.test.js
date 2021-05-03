const { expect } = require('chai');
const errorUtils = require('../../src/util/errorUtils');

describe('Error Utility Methods', () => {
  describe('format', () => {
    it('should format multiple mongoose validation errors with a status code', () => {
      const testError1 = { kind: 'testKind1', path: 'testPath1' };
      const testError2 = { kind: 'testKind2', path: 'testPaths.testPath2' };
      const error = {
        name: 'ValidationError',
        errors: {
          testError1,
          testError2,
        },
      };
      const withStatus = true;

      const expectedFormattedError = {
        message: 'Invalid fields.',
        fields: {
          testPath1: 'testKind1',
          testPaths: {
            testPath2: 'testKind2',
          },
        },
      };
      const expectedStatus = 400;

      const { formattedError, status } = errorUtils.format(error, withStatus);
      expect(formattedError).to.deep.equals(expectedFormattedError);
      expect(status).to.equal(expectedStatus);
    });

    it('should format multiple mongoose validation errors without a status code', () => {
      const testError1 = { kind: 'testKind1', path: 'testPath1' };
      const testError2 = { kind: 'testKind2', path: 'testPaths.testPath2' };
      const error = {
        name: 'ValidationError',
        errors: {
          testError1,
          testError2,
        },
      };

      const expectedFormattedError = {
        message: 'Invalid fields.',
        fields: {
          testPath1: 'testKind1',
          testPaths: {
            testPath2: 'testKind2',
          },
        },
      };

      const formattedError = errorUtils.format(error);
      expect(formattedError).to.deep.equals(expectedFormattedError);
    });

    it('should format a mongoose validation error without a status code', () => {
      const testError1 = { kind: 'testKind1', path: 'testPath1' };
      const error = {
        name: 'ValidationError',
        errors: {
          testError1,
        },
      };

      const expectedFormattedError = {
        message: 'Invalid field.',
        fields: {
          testPath1: 'testKind1',
        },
      };

      const formattedError = errorUtils.format(error);
      expect(formattedError).to.deep.equals(expectedFormattedError);
    });

    it('should format multiple mongoose duplicate errors with a status code', () => {
      const error = {
        name: 'MongoError',
        code: 11000,
        keyValue: {
          testKey1: '',
          testKey2: '',
        },
      };
      const withStatus = true;

      const expectedFormattedError = {
        message: 'Invalid fields.',
        fields: {
          testKey1: 'duplicate',
          testKey2: 'duplicate',
        },
      };
      const expectedStatus = 400;

      const { formattedError, status } = errorUtils.format(error, withStatus);
      expect(formattedError).to.deep.equals(expectedFormattedError);
      expect(status).to.equal(expectedStatus);
    });

    it('should format multiple mongoose duplicate errors without a status code', () => {
      const error = {
        name: 'MongoError',
        code: 11000,
        keyValue: {
          testKey1: '',
          testKey2: '',
        },
      };

      const expectedFormattedError = {
        message: 'Invalid fields.',
        fields: {
          testKey1: 'duplicate',
          testKey2: 'duplicate',
        },
      };

      const formattedError = errorUtils.format(error);
      expect(formattedError).to.deep.equals(expectedFormattedError);
    });

    it('should format a mongoose duplicate error without a status code', () => {
      const error = {
        name: 'MongoError',
        code: 11000,
        keyValue: {
          testKey1: '',
        },
      };

      const expectedFormattedError = {
        message: 'Invalid field.',
        fields: {
          testKey1: 'duplicate',
        },
      };

      const formattedError = errorUtils.format(error);
      expect(formattedError).to.deep.equals(expectedFormattedError);
    });

    it('should format a mongoose general error with a status code', () => {
      const error = {
        name: 'MongoError',
        code: 0,
        keyValue: {},
      };

      const expectedFormattedError = {
        message: 'Invalid field.',
        fields: undefined,
      };

      const formattedError = errorUtils.format(error);
      expect(formattedError).to.deep.equals(expectedFormattedError);
    });

    it('should format application errors with a status code', () => {
      const error = {
        name: 'ApplicationError',
        statusCode: 404,
        message: 'test_message',
      };
      const withStatus = true;

      const expectedFormattedError = {
        message: error.message,
      };
      const expectedStatus = error.statusCode;

      const { formattedError, status } = errorUtils.format(error, withStatus);
      expect(formattedError).to.deep.equals(expectedFormattedError);
      expect(status).to.equal(expectedStatus);
    });

    it('should format application errors without a status code', () => {
      const error = {
        name: 'ApplicationError',
        statusCode: 404,
        message: 'test_message',
      };

      const expectedFormattedError = {
        message: error.message,
      };

      const formattedError = errorUtils.format(error);
      expect(formattedError).to.deep.equals(expectedFormattedError);
    });

    it('should format general errors with a status code', () => {
      const error = {
        name: 'UnknownError',
      };
      const withStatus = true;

      const expectedFormattedError = {
        message: 'An unknown error occurred.',
      };
      const expectedStatus = 500;

      const { formattedError, status } = errorUtils.format(error, withStatus);
      expect(formattedError).to.deep.equals(expectedFormattedError);
      expect(status).to.equal(expectedStatus);
    });

    it('should format general errors without a status code', () => {
      const error = {
        name: 'UnknownError',
      };

      const expectedFormattedError = {
        message: 'An unknown error occurred.',
      };

      const formattedError = errorUtils.format(error);
      expect(formattedError).to.deep.equals(expectedFormattedError);
    });
  });
});
