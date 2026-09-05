<?xml version="1.0" encoding="UTF-8"?>
<!--
  Browser stylesheet for /sitemap.xml. Sitemap XML doesn't need to be
  human-readable, but a stylesheet lets you open the URL in Chrome and
  see a tidy table instead of the raw tree.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title>Sitemap — ChinaRhinestone.com</title>
        <style>
          body { font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                 margin: 0; padding: 2rem; color: #0f172a; background: #f8fafc; }
          h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
          p.lede { color: #64748b; margin: 0 0 1.5rem; }
          table { border-collapse: collapse; width: 100%; max-width: 1100px; background: #fff;
                  box-shadow: 0 1px 2px rgba(15,23,42,0.06); border-radius: 8px; overflow: hidden; }
          th, td { padding: 0.6rem 0.9rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; font-size: 0.75rem; text-transform: uppercase;
               letter-spacing: 0.05em; color: #475569; }
          tr:last-child td { border-bottom: 0; }
          td a { color: #2563eb; text-decoration: none; }
          td a:hover { text-decoration: underline; }
          td.prio, td.freq { font-variant-numeric: tabular-nums; white-space: nowrap; }
          td.path { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>ChinaRhinestone.com — Sitemap</h1>
        <p class="lede"><xsl:value-of select="count(//s:url)"/> URLs · XML version at <code>/sitemap.xml</code></p>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last modified</th>
              <th>Change frequency</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="//s:url">
              <tr>
                <td class="path"><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
                <td><xsl:value-of select="s:lastmod"/></td>
                <td class="freq"><xsl:value-of select="s:changefreq"/></td>
                <td class="prio"><xsl:value-of select="s:priority"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
