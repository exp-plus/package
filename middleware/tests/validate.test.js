'use strict';

const { validate } = require('..');
const Joi = require('@hapi/joi');

describe('参数校验', () => {
  test('参数校验不匹配', done => {
    validate('header', Joi.object().keys({
      headers: {
        header1: 'header1',
      },
    }))({
      headers: {
        header1: 'header1',
      },
    },
    {},
    error => {
      expect(error.statusCode).toEqual(400);
      done();
    });
  });
  test('header 参数校验', done => {
    validate('header', Joi.object().keys({
      headers: {
        header1: 'header1',
      },
    }))({
      headers: {
        header1: 'header1',
      },
    },
    {},
    () => { done(); });
  });
  test('body 参数校验', done => {
    validate('header', Joi.object().keys({
      body: {
        body1: 'body1',
      },
    }))({
      body: {
        body1: 'body1',
      },
    },
    {},
    () => { done(); });
  });
  test('query 参数校验', done => {
    validate('header', Joi.object().keys({
      query: {
        query1: 'query1',
      },
    }))({
      query: {
        query1: 'query1',
      },
    },
    {},
    () => { done(); });
  });
});
