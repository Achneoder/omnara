<!-- @dsCard group="Colors" viewport="700x180" name="Surfaces & text — light / dark" subtitle="Semantic aliases. Dark theme reskins the MCP Client" -->
<!doctype html>
<html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="../styles.css">
<style>
  body{margin:0;background:var(--bg-subtle);padding:20px;font-family:var(--font-sans);display:flex;gap:16px}
  .panel{flex:1;border-radius:var(--radius-lg);border:1px solid var(--border-subtle);overflow:hidden;
    background:var(--bg-base)}
  .panel .head{font:var(--type-eyebrow);letter-spacing:var(--tracking-caps);text-transform:uppercase;
    color:var(--text-muted);padding:10px 14px;border-bottom:1px solid var(--border-subtle)}
  .panel .stack{padding:14px;display:flex;flex-direction:column;gap:8px}
  .line{display:flex;align-items:center;gap:10px}
  .box{width:34px;height:34px;border-radius:var(--radius-sm);border:1px solid var(--border-default);flex:0 0 auto}
  .t{font-size:12px}
  .t b{display:block;color:var(--text-strong);font-weight:600}
  .t span{color:var(--text-muted);font-family:var(--font-mono);font-size:10px}
</style></head>
<body>
  <div class="panel">
    <div class="head">Light (default)</div>
    <div class="stack">
      <div class="line"><span class="box" style="background:var(--surface)"></span><span class="t"><b>Surface</b><span>--surface</span></span></div>
      <div class="line"><span class="box" style="background:var(--bg-subtle)"></span><span class="t"><b>Subtle bg</b><span>--bg-subtle</span></span></div>
      <div class="line"><span class="box" style="background:var(--text-strong)"></span><span class="t"><b>Text strong</b><span>--text-strong</span></span></div>
      <div class="line"><span class="box" style="background:var(--text-muted)"></span><span class="t"><b>Text muted</b><span>--text-muted</span></span></div>
    </div>
  </div>
  <div class="panel" data-theme="dark">
    <div class="head">Dark · MCP Client</div>
    <div class="stack">
      <div class="line"><span class="box" style="background:var(--surface)"></span><span class="t"><b>Surface</b><span>--surface</span></span></div>
      <div class="line"><span class="box" style="background:var(--surface-raised)"></span><span class="t"><b>Raised</b><span>--surface-raised</span></span></div>
      <div class="line"><span class="box" style="background:var(--text-strong)"></span><span class="t"><b>Text strong</b><span>--text-strong</span></span></div>
      <div class="line"><span class="box" style="background:var(--accent)"></span><span class="t"><b>Accent</b><span>--accent</span></span></div>
    </div>
  </div>
</body></html>
