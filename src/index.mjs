import Koa from 'koa';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import RSS from 'rss';

// Replace your URL with needed
const FEED_TITLE = "Craiglist RSS Search";
const FEED_URL = "https://seattle.craigslist.org/search/ata";

const getResults = async () => {
  const feed = new RSS({
    title: FEED_TITLE,
    description: 'RSS feeed for craiglist.org',
    feed_url: '',
    site_url: '',
    managingEditor: 'RSS Local Server',
    webMaster: 'RSS Local Server',
    copyright: 'MIT',
    language: 'en',
    categories: ['Craiglist'],
    pubData: new Date().toDateString(),
    ttl: 60
  });
  const result = await fetch(FEED_URL, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-US,en;q=0.9,ru;q=0.8",
      "cache-control": "max-age=0",
      "sec-ch-ua": "\"Chromium\";v=\"96\", \" Not A;Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET"
  });

  const html = await result.text();
  const dom = new JSDOM(html);
  const records = dom.window.document.querySelectorAll('div.result-info');
  if (records.length > 0) {
    for (let i = 0; i < records.length; i += 1) {
      const r = records[i];
      const { innerHTML: title, href: url } = r.querySelector('a');
      const price = r.querySelector('.result-price').innerHTML;
      const date = r.querySelector('time').attributes.datetime.value;

      feed.item({
        title,
        description: price,
        url,
        categories: ['Craiglist'],
        author: 'RSS Local Server',
        date
      });
    }
  }

  return feed;
}

const app = new Koa();

app.use(async ctx => {
  const feed = await getResults();

  ctx.response.type = 'application/rss+xml';
  ctx.response.charset = 'utf-8';
  ctx.body = feed.xml();
});

app.listen(9999);