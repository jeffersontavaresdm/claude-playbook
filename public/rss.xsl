<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html lang="pt-BR">
			<head>
				<meta charset="utf-8"/>
				<meta name="viewport" content="width=device-width,initial-scale=1"/>
				<title><xsl:value-of select="/rss/channel/title"/> · RSS</title>
				<style>
					:root {
						--bg: #0a0e14;
						--bg-elev: #11161d;
						--fg: #c9d1d9;
						--fg-strong: #e6edf3;
						--muted: #6e7681;
						--border: #1f2630;
						--prompt: #00ff9f;
						--amber: #ffb86c;
						--magenta: #ff79c6;
					}
					* { box-sizing: border-box; }
					body {
						margin: 0;
						background: var(--bg);
						color: var(--fg);
						font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
						line-height: 1.6;
						min-height: 100vh;
					}
					body::before {
						content: '';
						position: fixed;
						inset: 0;
						pointer-events: none;
						background-image:
							linear-gradient(to right, rgba(31, 38, 48, 0.4) 1px, transparent 1px),
							linear-gradient(to bottom, rgba(31, 38, 48, 0.4) 1px, transparent 1px);
						background-size: 64px 64px;
						mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%);
						-webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%);
						z-index: 0;
					}
					.wrap {
						max-width: 760px;
						margin: 0 auto;
						padding: 40px 24px;
						position: relative;
						z-index: 1;
					}
					header { margin-bottom: 32px; border-bottom: 1px dashed var(--border); padding-bottom: 24px; }
					.prompt { color: var(--prompt); font-weight: 700; }
					.amber { color: var(--amber); }
					.muted { color: var(--muted); }
					h1 { color: var(--fg-strong); font-size: 1.8rem; margin: 8px 0 4px; letter-spacing: -0.01em; }
					.sub { color: var(--fg); font-size: 0.95rem; margin: 0; }
					.hint {
						margin-top: 16px;
						padding: 12px 14px;
						background: rgba(0, 255, 159, 0.06);
						border-left: 3px solid var(--prompt);
						color: var(--fg);
						font-size: 0.85rem;
						border-radius: 0 4px 4px 0;
					}
					article {
						background: rgba(17, 22, 29, 0.55);
						border: 1px solid var(--border);
						border-radius: 6px;
						padding: 18px 20px;
						margin: 14px 0;
						transition: border-color .15s, box-shadow .15s;
					}
					article:hover {
						border-color: rgba(0, 255, 159, 0.45);
						box-shadow: 0 0 24px rgba(0, 255, 159, 0.08);
					}
					article .meta {
						font-size: 0.75rem;
						color: var(--muted);
						margin-bottom: 6px;
					}
					article .meta .date { color: var(--magenta); }
					article h2 { margin: 0 0 8px; font-size: 1.1rem; color: var(--fg-strong); }
					article h2 a { color: inherit; text-decoration: none; }
					article h2 a:hover { color: var(--prompt); text-shadow: 0 0 12px rgba(0, 255, 159, 0.45); }
					article p { margin: 0; color: rgba(201, 209, 217, 0.85); font-family: 'IBM Plex Sans', system-ui, sans-serif; line-height: 1.55; }
					.tags { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px; font-size: 0.72rem; }
					.tag .flag { color: var(--amber); }
					.tag .eq { color: var(--muted); }
					.tag .val { color: var(--fg); }
					footer {
						margin-top: 36px;
						padding-top: 18px;
						border-top: 1px dashed var(--border);
						font-size: 0.75rem;
						color: var(--muted);
						text-align: center;
					}
					footer a { color: var(--prompt); text-decoration: none; }
				</style>
			</head>
			<body>
				<div class="wrap">
					<header>
						<div class="muted"><span class="prompt">$</span> curl -s <span class="amber"><xsl:value-of select="/rss/channel/atom:link/@href"/></span> | xmllint</div>
						<h1><xsl:value-of select="/rss/channel/title"/> · RSS</h1>
						<p class="sub"><xsl:value-of select="/rss/channel/description"/></p>
						<div class="hint">
							Esta é a versão <strong>visual</strong> do feed RSS. Para acompanhar atualizações, copie a URL desta
							página e cole no seu leitor de feed (NetNewsWire, Feedly, Inoreader, Miniflux, etc).
						</div>
					</header>
					<xsl:for-each select="/rss/channel/item">
						<article>
							<div class="meta">
								<span class="date"><xsl:value-of select="substring(pubDate, 6, 11)"/></span>
								<span class="muted"> · </span>
								<span class="amber"><xsl:value-of select="substring-before(substring-after(link, 'artigos/'), '/')"/>.md</span>
							</div>
							<h2>
								<a>
									<xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute>
									<xsl:value-of select="title"/>
								</a>
							</h2>
							<p><xsl:value-of select="description"/></p>
							<div class="tags">
								<xsl:for-each select="category">
									<span class="tag"><span class="flag">--tag</span><span class="eq">=</span><span class="val"><xsl:value-of select="."/></span></span>
								</xsl:for-each>
							</div>
						</article>
					</xsl:for-each>
					<footer>
						<span class="muted">Gerado por Astro · </span>
						<a><xsl:attribute name="href"><xsl:value-of select="/rss/channel/link"/></xsl:attribute>voltar ao site →</a>
					</footer>
				</div>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
