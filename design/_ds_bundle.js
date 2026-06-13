<!-- @dsCard group="MCP Client" viewport="1280x820" name="MCP Client" subtitle="Developer-facing content command interface (dark)" -->
<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>omnara · MCP Client</title>
<link rel="stylesheet" href="../../styles.css">
<style>
  html,body{height:100%}
  body{margin:0;font-family:var(--font-sans);background:var(--bg-base);color:var(--text-body)}
  #root{height:100vh}
  .mcp{display:grid;grid-template-columns:256px 1fr;height:100vh;overflow:hidden}

  /* sidebar */
  .mcp__side{background:var(--surface);border-right:1px solid var(--border-subtle);
    display:flex;flex-direction:column;padding:14px 12px;gap:10px;overflow:hidden}
  .mcp__brand{display:flex;align-items:center;gap:9px;padding:4px 6px}
  .mcp__wm{font-family:var(--font-display);font-weight:500;font-size:18px;color:var(--text-strong);letter-spacing:-.02em}
  .mcp__tagchip{margin-left:auto;font-family:var(--font-mono);font-size:10px;color:var(--text-muted);
    border:1px solid var(--border-default);border-radius:var(--radius-full);padding:2px 8px}
  .mcp__eyebrow{font:var(--type-eyebrow);letter-spacing:var(--tracking-caps);text-transform:uppercase;color:var(--text-faint);padding:6px 6px 2px}
  .mcp__sessions{display:flex;flex-direction:column;gap:2px}
  .mcp__session{display:flex;align-items:center;gap:9px;padding:8px 9px;border:none;background:transparent;
    border-radius:var(--radius-md);color:var(--text-muted);cursor:pointer;text-align:left;width:100%;font-size:13px;
    transition:var(--transition-colors)}
  .mcp__session svg{width:15px;height:15px;flex:0 0 auto}
  .mcp__session-t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .mcp__session-w{font-family:var(--font-mono);font-size:10px;color:var(--text-faint)}
  .mcp__session:hover{background:var(--bg-subtle);color:var(--text-body)}
  .mcp__session.is-active{background:var(--accent-soft);color:var(--accent-soft-text)}
  .mcp__conns{display:flex;flex-direction:column;gap:1px}
  .mcp__conn{display:flex;align-items:center;gap:8px;padding:5px 8px;font-size:12px;color:var(--text-body)}
  .mcp__conn .dot{width:7px;height:7px;border-radius:50%;flex:0 0 auto}
  .mcp__conn-h{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-mono);font-size:11px}
  .mcp__conn-p{font-family:var(--font-mono);font-size:10px;color:var(--text-faint)}
  .mcp__server{margin-top:auto;display:flex;align-items:center;gap:10px;padding:11px 6px 2px;border-top:1px solid var(--border-subtle)}
  .mcp__server-m{font-size:12px}
  .mcp__server-m b{display:block;color:var(--text-strong);font-weight:600}
  .mcp__server-m span{display:flex;align-items:center;gap:5px;color:var(--text-muted);font-size:11px}
  .mcp__server-m .dot{width:6px;height:6px;border-radius:50%}

  /* main */
  .mcp__main{display:flex;flex-direction:column;min-width:0;overflow:hidden}
  .mcp__head{display:flex;align-items:center;gap:12px;height:var(--topbar-h);padding:0 24px;
    border-bottom:1px solid var(--border-subtle);flex:0 0 auto}
  .mcp__head h1{font:var(--type-title);color:var(--text-strong)}
  .mcp__head .sub{font-family:var(--font-mono);font-size:11px;color:var(--text-faint)}
  .mcp__head .right{margin-left:auto;display:flex;gap:6px;align-items:center}
  .thread{flex:1;overflow:auto;padding:10px 0 16px}
  .msg{display:flex;gap:12px;padding:14px 28px}
  .msg__body{flex:1;min-width:0;display:flex;flex-direction:column;gap:9px}
  .msg__name{font-family:var(--font-mono);font-size:11px;color:var(--text-faint)}
  .msg__text{font:var(--type-body);color:var(--text-body);max-width:720px}
  .msg--user .msg__text{color:var(--text-strong)}

  .tool{font-family:var(--font-mono);font-size:12px;background:var(--surface-inset);
    border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:10px 12px;line-height:1.7;
    color:var(--text-muted);max-width:560px;white-space:pre-wrap}
  .tool .arrow{color:var(--accent)}
  .tool__res{color:var(--text-faint)}
  .tool .ok{color:var(--success)}

  .draft{border:1px solid var(--border-default);border-radius:var(--radius-lg);background:var(--surface-raised);
    padding:16px;max-width:560px}
  .draft__head{display:flex;align-items:center;gap:10px;margin-bottom:9px}
  .draft__title{font-family:var(--font-display);font-weight:500;color:var(--text-strong);font-size:16px}
  .draft__meta{margin-left:auto;font-family:var(--font-mono);font-size:10px;color:var(--text-faint)}
  .draft__body{font:var(--type-body-sm);color:var(--text-muted);margin-bottom:14px}
  .draft__act{display:flex;gap:8px;flex-wrap:wrap}

  .composer{border-top:1px solid var(--border-subtle);background:var(--surface);padding:12px 24px 16px;flex:0 0 auto}
  .composer__chips{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
  .chip{font-size:12px;color:var(--text-body);background:var(--bg-subtle);border:1px solid var(--border-subtle);
    border-radius:var(--radius-full);padding:5px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;
    transition:var(--transition-colors)}
  .chip svg{width:13px;height:13px;color:var(--text-muted)}
  .chip:hover{border-color:var(--border-strong);color:var(--text-strong)}
  .composer__row{display:flex;align-items:center;gap:10px;background:var(--bg-base);
    border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:9px 10px 9px 14px;
    transition:var(--transition-colors),box-shadow var(--duration-fast)}
  .composer__row:focus-within{border-color:var(--border-focus);box-shadow:var(--shadow-focus)}
  .composer__prompt{color:var(--accent);font-family:var(--font-mono);font-size:14px}
  .composer__row input{flex:1;border:none;background:transparent;outline:none;color:var(--text-strong);
    font-family:var(--font-sans);font-size:15px;min-width:0}
  .composer__row input::placeholder{color:var(--text-faint)}
</style>
</head>
<body data-theme="dark">
<div id="root"></div>

<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script src="../../_ds_bundle.js"></script>
<script type="text/babel" src="parts.jsx"></script>
<script type="text/babel">
  const { ClientSidebar, Message } = window;
  const { Button, IconButton, Badge, Tooltip } = window.OmnaraDesignSystem_c73439;
  const I = (n) => <i data-lucide={n}></i>;

  const INITIAL = [
    { role: "user", text: "Draft a landing page for the summer linen collection on shopify." },
    { role: "agent", blocks: [
      { type: "tool",
        call: "content.draft({ site: \"shop.example.com\", type: \"page\" })",
        result: "created draft  ·  page/summer-collection" },
      { type: "draft", title: "Summer, in linen.", meta: "shop · page · 1,204 words",
        body: "A capsule of breathable, naturally dyed pieces — cut for long days and warm evenings. Added 2 product highlights, an SEO description, and linked 6 products." },
      { type: "text", text: "Drafted and linked 6 products. Want me to publish, or send it to your review queue?" },
    ]},
  ];

  const CHIPS = [
    { label: "Send to review", icon: "eye", kind: "review" },
    { label: "Show the diff", icon: "git-compare", kind: "diff" },
    { label: "Publish to staging", icon: "rocket", kind: "staging" },
  ];

  function App() {
    const [msgs, setMsgs] = React.useState(INITIAL);
    const [val, setVal] = React.useState("");
    const threadRef = React.useRef(null);

    React.useEffect(() => {
      window.lucide && window.lucide.createIcons();
      if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
    });

    const agentReply = (kind) => {
      if (kind === "publish") return { role: "agent", blocks: [
        { type: "tool", call: "content.publish({ id: \"page/summer-collection\", target: \"shop.example.com\" })", result: "live  ·  v0.43  ·  240ms" },
        { type: "text", text: "Published. “Summer, in linen.” is live on shop.example.com." } ]};
      if (kind === "review") return { role: "agent", blocks: [
        { type: "text", text: "Sent to your review queue. A human can approve it from the dashboard." } ]};
      if (kind === "diff") return { role: "agent", blocks: [
        { type: "tool", call: "content.diff({ id: \"page/summer-collection\" })", result: "+42 lines  ·  6 products linked  ·  1 SEO block" },
        { type: "text", text: "Open the diff in the dashboard to review every change line by line." } ]};
      if (kind === "staging") return { role: "agent", blocks: [
        { type: "tool", call: "content.publish({ id: \"page/summer-collection\", target: \"staging\" })", result: "deployed  ·  preview.shop.example.com" },
        { type: "text", text: "Live on staging — preview at preview.shop.example.com before you ship." } ]};
      return { role: "agent", blocks: [
        { type: "text", text: "On it. I’ll draft that and surface it here for review." } ]};
    };

    const send = (text, kind) => {
      const body = text || val.trim();
      if (!body && !kind) return;
      setMsgs((m) => [...m, { role: "user", text: body || (kind ? CHIPS.find(c=>c.kind===kind)?.label : "") }]);
      setVal("");
      setTimeout(() => setMsgs((m) => [...m, agentReply(kind || "freeform")]), 350);
    };

    return (
      <div className="mcp">
        <ClientSidebar />
        <div className="mcp__main">
          <div className="mcp__head">
            <h1>Summer collection launch</h1>
            <span className="sub">· session s1</span>
            <div className="right">
              <Badge variant="live" dot>server connected</Badge>
              <Tooltip label="Session settings"><IconButton label="Settings" variant="ghost">{I("settings-2")}</IconButton></Tooltip>
            </div>
          </div>

          <div className="thread" ref={threadRef}>
            {msgs.map((m, i) => (
              <Message key={i} m={m}
                onReview={() => send("Send “Summer, in linen.” to review.", "review")}
                onPublish={() => send("Publish “Summer, in linen.” to shop.example.com.", "publish")} />
            ))}
          </div>

          <div className="composer">
            <div className="composer__chips">
              {CHIPS.map((c) => (
                <button className="chip" key={c.kind} onClick={() => send(null, c.kind)}>{I(c.icon)}{c.label}</button>
              ))}
            </div>
            <form className="composer__row" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <span className="composer__prompt">›</span>
              <input value={val} onChange={(e) => setVal(e.target.value)}
                placeholder="Ask omnara to draft, edit, or publish content…" />
              <Button variant="primary" size="sm" iconRight={I("arrow-up")} onClick={() => send()}>Send</Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>
</body>
</html>
