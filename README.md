# Ptt RSS
Self-hosted Ptt RSS service

Usage
=====

### Start RSS Server

```
λ ~/ptt-to-rss/ PORT=8000 npm start
```

### Example

- Get RSS of drama-ticket

```
curl http://localhost:8000/drama-ticket.xml
```

Example output:
```
<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
  <channel>
    <title><![CDATA[PTT - drama-ticket]]></title>
    <description><![CDATA[PTT - drama-ticket]]></description>
    <link>https://www.ptt.cc/bbs/drama-ticket/index.html</link>
    <generator>ptt-to-rss</generator>
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

License
-------
[MIT](http://yulun.mit-license.org/)
