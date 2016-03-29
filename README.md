Ptt RSS
=======

Self-hosted Ptt RSS service

Please checkout how do I combine Ptt RSS with IFTTT push notification service to make life more easier. :joy:

[自造：PTT 新文章、關鍵字 手機通知服務](http://yulun.me/2015/ifttt-ptt-rss-alarm-event/)

Install
-------
```
git clone https://github.com/imZack/PttRSS
npm install
```


Usage
-----

### Start RSS Server

```
λ ~/ptt-to-rss/ PORT=8000 npm start
```

### Example

- Get RSS of drama-ticket

```sh
curl http://localhost:8000/drama-ticket.xml
```

Example output:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
  <channel>
    <title><![CDATA[drama-ticket]]></title>
    <description><![CDATA[PTT: drama-ticket]]></description>
    <link>https://www.ptt.cc/bbs/drama-ticket/index.html</link>
    <generator>PttRSS</generator>
    <lastBuildDate>Wed, 01 Jul 2015 16:12:40 GMT</lastBuildDate>
    <pubDate>Wed, 01 Jul 2015 16:12:40 GMT</pubDate>
    <item>
      <title><![CDATA[[售票] 江蕙8/8 台北小巨蛋演唱會 黃3D$2800一張]]></title>
      <link>https://www.ptt.cc/bbs/Drama-Ticket/M.1435766811.A.8A7.html</link>
      <guid isPermaLink="true">https://www.ptt.cc/bbs/Drama-Ticket/M.1435766811.A.8A7.html</guid>
      <dc:creator><![CDATA[pierrebebe]]></dc:creator>
      <pubDate>Wed, 01 Jul 2015 16:00:00 GMT</pubDate>
    </item>
    <item>
      <title><![CDATA[Re: [換票] 江蕙演唱會7/28紅1C連號換其他天]]></title>
      <link>https://www.ptt.cc/bbs/Drama-Ticket/M.1435767028.A.72C.html</link>
      <guid isPermaLink="true">https://www.ptt.cc/bbs/Drama-Ticket/M.1435767028.A.72C.html</guid>
      <dc:creator><![CDATA[yinfan]]></dc:creator>
      <pubDate>Wed, 01 Jul 2015 16:00:00 GMT</pubDate>
    </item>
    <item>
      <title><![CDATA[[公告] 版規-發文前請務必看完]]></title>
      <link>https://www.ptt.cc/bbs/Drama-Ticket/M.1351960651.A.0B0.html</link>
      <guid isPermaLink="true">https://www.ptt.cc/bbs/Drama-Ticket/M.1351960651.A.0B0.html</guid>
      <dc:creator><![CDATA[nickapple]]></dc:creator>
      <pubDate>Sat, 03 Jan 2015 16:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>
```

- Match article title

```sh
// Single keyword
curl http://localhost:8000/Gossiping.xml?title=肥宅

// Multiple keywords (OR)
curl http://localhost:8000/Gossiping.xml?title=肥宅&title=國民黨

// Push count filter
curl http://localhost:8000/Gossiping.xml?push=100 only get > 100 push
```

Example output:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>
      <![CDATA[Gossiping]]>
    </title>
    <description>
      <![CDATA[PTT: Gossiping]]>
    </description>
    <link>https://www.ptt.cc/bbs/Gossiping/index.html</link>
    <generator>PttRSS</generator>
    <lastBuildDate>Sun, 20 Dec 2015 06:17:04 GMT</lastBuildDate>
    <pubDate>Sun, 20 Dec 2015 06:17:04 GMT</pubDate>
    <item>
      <title>
        <![CDATA[[問卦] 如果有「愛的號碼牌」肥宅會拿到幾號呢？]]>
      </title>
      <link>https://www.ptt.cc/bbs/Gossiping/M.1450590925.A.F95.html</link>
      <guid isPermaLink="true">https://www.ptt.cc/bbs/Gossiping/M.1450590925.A.F95.html</guid>
      <dc:creator>
        <![CDATA[nobel777]]>
      </dc:creator>
      <pubDate>Sat, 19 Dec 2015 16:00:00 GMT</pubDate>
    </item>
    <item>
      <title>
        <![CDATA[[問卦] 有沒有這個肥宅網友到底想幹嘛的八卦？]]>
      </title>
      <link>https://www.ptt.cc/bbs/Gossiping/M.1450590385.A.80F.html</link>
      <guid isPermaLink="true">https://www.ptt.cc/bbs/Gossiping/M.1450590385.A.80F.html</guid>
      <dc:creator>
        <![CDATA[poppylove]]>
      </dc:creator>
      <pubDate>Sat, 19 Dec 2015 16:00:00 GMT</pubDate>
    </item>
    <item>
      <title>
        <![CDATA[[問卦] 肥宅去參加系上舞會有搞頭嗎?]]>
      </title>
      <link>https://www.ptt.cc/bbs/Gossiping/M.1450590531.A.491.html</link>
      <guid isPermaLink="true">https://www.ptt.cc/bbs/Gossiping/M.1450590531.A.491.html</guid>
      <dc:creator>
        <![CDATA[yuimoest]]>
      </dc:creator>
      <pubDate>Sat, 19 Dec 2015 16:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>
```

Author
------
YuLun Shih

License
-------
[MIT](http://yulun.mit-license.org/)
