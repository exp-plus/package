'use strict';

const { extractOfficialAccountArticle } = require('..');

describe('公众号文章', () => {
  test('非公众号文章', async done => {
    const url = 'https://deeract.com/fake-article.html';
    try {
      await extractOfficialAccountArticle(url);
    } catch (error) {
      expect(error.message).toEqual('必须为公众号文章');
      done();
    }
  });

  test('提取公众号', async done => {
    const url = 'https://mp.weixin.qq.com/s/N8gXXA6PhHgj_wiDkHEWlw';
    const article = await extractOfficialAccountArticle(url);
    expect(article).toHaveProperty('title');
    expect(article).toHaveProperty('description');
    expect(article).toHaveProperty('content');
    expect(article).toHaveProperty('origin_url');
    expect(article).toHaveProperty('origin_url');
    done();
  });
});
