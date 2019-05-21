'use strict';

const { JsonWebToken } = require('..');

describe('Json Web Token', () => {
  test('令牌一秒内过期', done => {
    const jwt = new JsonWebToken('secret', '1s');
    const value = { value: 'value' };
    const token = jwt.sign(value);

    setTimeout(() => {
      try {
        jwt.verify(token);
      } catch (error) {
        expect(error).toBeInstanceOf(jwt.jwt.TokenExpiredError);
        done();
      }
    }, 1200);
  });

  test('假的令牌', done => {
    const jwt = new JsonWebToken('secret', '1s');
    try {
      jwt.verify('fake token');
    } catch (error) {
      expect(error).toBeInstanceOf(jwt.jwt.JsonWebTokenError);
      done();
    }
  });

  test('解密成功', done => {
    const jwt = new JsonWebToken('secret', '1s');
    const value = { value: 'value' };
    const token = jwt.sign(value);
    const decoded = jwt.verify(token);
    expect(decoded).toMatchObject(value);
    done();
  });
});
