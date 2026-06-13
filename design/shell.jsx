<!-- @dsCard group="Dashboard" viewport="1280x820" name="Management Dashboard" subtitle="Human-facing console — overview, content library, review queue" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>omnara · Management Dashboard</title>
<link rel="stylesheet" href="../../styles.css">
<style>
  html,body{height:100%}
  body{margin:0;font-family:var(--font-sans);background:var(--bg-base);color:var(--text-body)}
  #root{height:100vh}
  .dash{display:grid;grid-template-columns:var(--sidebar-w) 1fr;height:100vh;overflow:hidden}

  /* sidebar */
  .dash__side{background:var(--surface);border-right:1px solid var(--border-subtle);
    display:flex;flex-direction:column;padding:14px 12px}
  .dash__brand{display:flex;align-items:center;gap:9px;padding:6px 8px 14px}
  .dash__wm{font-family:var(--font-display);font-weight:500;font-size:19px;color:var(--text-strong);letter-spacing:-0.02em}
  .dash__nav{display:flex;flex-direction:column;gap:2px}
  .dash__navitem{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:var(--radius-md);
    border:none;background:transparent;color:var(--text-muted);font:var(--type-label);cursor:pointer;text-align:left;width:100%;
    transition:var(--transition-colors)}
  .dash__navitem svg{width:18px;height:18px}
  .dash__navitem:hover{background:var(--bg-subtle);color:var(--text-strong)}
  .dash__navitem.is-active{background:var(--accent-soft);color:var(--accent-soft-text)}
  .dash__navcount{margin-left:auto;font-family:var(--font-mono);font-size:11px;background:var(--warning-soft);
    color:var(--warning);border-radius:var(--radius-full);padding:1px 7px}
  .dash__sitebox{margin-top:auto;padding:14px 8px 10px;border-top:1px solid var(--border-subtle)}
  .dash__siterow{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-body);padding:4px 0}
  .dash__siterow .dot{width:7px;height:7px;border-radius:50%;flex:0 0 auto}
  .dash__siterow .plat{margin-left:auto;font-family:var(--font-mono);font-size:10px;color:var(--text-faint)}
  .dash__agent{display:flex;align-items:center;gap:10px;padding:11px 8px 4px;border-top:1px solid var(--border-subtle)}
  .dash__agentmeta{font-size:12.5px;line-height:1.3}
  .dash__agentmeta b{color:var(--text-strong);font-weight:600;display:block}
  .dash__agentmeta span{color:var(--text-muted);font-size:11px;display:flex;align-items:center;gap:5px}
  .dash__agentmeta .dot{width:6px;height:6px;border-radius:50%}

  /* main */
  .dash__main{display:flex;flex-direction:column;min-width:0;overflow:hidden}
  .dash__top{display:flex;align-items:center;gap:14px;height:var(--topbar-h);padding:0 24px;
    border-bottom:1px solid var(--border-subtle);background:var(--surface);flex:0 0 auto}
  .dash__topttl{display:flex;flex-direction:column;gap:1px;min-width:0}
  .dash__topttl h1{font:var(--type-h3);color:var(--text-strong)}
  .dash__topttl span{font-size:12px;color:var(--text-muted)}
  .dash__topsearch{margin-left:auto;width:300px}
  .dash__body{padding:24px;overflow:auto;display:flex;flex-direction:column;gap:20px}

  /* stats */
  .dash__stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .stat{display:flex;flex-direction:column;gap:5px}
  .stat__ic{width:34px;height:34px;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;margin-bottom:4px}
  .stat__ic svg{width:18px;height:18px}
  .stat__ic--live{background:var(--success-soft);color:var(--success)}
  .stat__ic--warning{background:var(--warning-soft);color:var(--warning)}
  .stat__ic--ai{background:var(--ai-soft);color:var(--ai-text)}
  .stat__ic--neutral{background:var(--bg-sunken);color:var(--text-muted)}
  .stat__v{font-family:var(--font-display);font-size:30px;font-weight:500;color:var(--text-strong);line-height:1}
  .stat__k{font-size:13px;color:var(--text-muted)}

  /* cols */
  .dash__cols{display:flex;gap:20px;align-items:flex-start}
  .grow{flex:1;min-width:0}
  .rev{display:flex;flex-direction:column}
  .rev__row{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--border-subtle)}
  .rev__row:last-child{border-bottom:none;padding-bottom:0}
  .rev__ic{width:36px;height:36px;border-radius:var(--radius-md);background:var(--bg-subtle);
    display:flex;align-items:center;justify-content:center;color:var(--text-muted);flex:0 0 auto}
  .rev__ic svg{width:18px;height:18px}
  .rev__meta{flex:1;min-width:0}
  .rev__meta b{font-size:14px;color:var(--text-strong);font-weight:500}
  .rev__meta span{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted);margin-top:3px}
  .rev__act{display:flex;gap:8px;flex:0 0 auto}
  .feed{display:flex;flex-direction:column}
  .feed__row{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-subtle)}
  .feed__row:last-child{border-bottom:none;padding-bottom:0}
  .feed__meta{font-size:13px;color:var(--text-body)}
  .feed__meta time{display:block;font-family:var(--font-mono);font-size:10px;color:var(--text-faint);margin-top:3px}

  /* library */
  .lib__bar{display:flex;align-items:center;justify-content:space-between;gap:16px}
  .lib__tools{display:flex;gap:10px;align-items:center}
  .tbl{width:100%;border-collapse:collapse;font-size:13px}
  .tbl th{text-align:left;font:var(--type-eyebrow);letter-spacing:var(--tracking-caps);text-transform:uppercase;
    color:var(--text-faint);padding:10px 12px;border-bottom:1px solid var(--border-subtle)}
  .tbl td{padding:11px 12px;border-bottom:1px solid var(--border-subtle);color:var(--text-body)}
  .tbl tr:last-child td{border-bottom:none}
  .tbl tbody tr:hover{background:var(--bg-subtle)}
  .tbl__t{display:flex;align-items:center;gap:9px;color:var(--text-strong)}
  .tbl__t svg{color:var(--text-faint);width:16px;height:16px}
  .tbl__t b{font-weight:500}
  .tbl__by{color:var(--text-muted)}
  .tbl__by{white-space:nowrap}
  .tbl__by span.om-avatar{vertical-align:middle;margin-right:6px}
  .tbl__when{font-family:var(--font-mono);font-size:11px;color:var(--text-faint)}

  /* review detail */
  .rev2{flex-direction:row;gap:18px}
  .rev2__list{width:280px;flex:0 0 280px;display:flex;flex-direction:column;gap:2px;align-self:flex-start}
  .rev2__item{text-align:left;border:none;background:transparent;padding:10px;border-radius:var(--radius-md);cursor:pointer;
    display:flex;flex-direction:column;gap:4px;width:100%}
  .rev2__item b{font-size:13px;color:var(--text-strong);font-weight:500}
  .rev2__item span{font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:5px}
  .rev2__item:hover{background:var(--bg-subtle)}
  .rev2__item.is-active{background:var(--accent-soft)}
  .rev2__detail{flex:1;min-width:0}
  .rev2__head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:18px}
  .rev2__head h2{font:var(--type-h2);color:var(--text-strong);margin:10px 0 6px}
  .rev2__sub{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-muted)}
  .rev2__actions{display:flex;gap:10px;flex:0 0 auto}
  .rev2__preview{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--bg-subtle);padding:26px}
  .prose{max-width:600px}
  .prose h3{font:var(--type-h2);color:var(--text-strong);margin-bottom:12px}
  .prose p{font:var(--type-body);color:var(--text-body);margin-bottom:12px}
  .diff{display:block;font-family:var(--font-mono);font-size:12px;padding:7px 11px;border-radius:var(--radius-sm);margin-top:8px}
  .diff--add{background:var(--success-soft);color:var(--success)}

  /* settings */
  .set{max-width:620px;display:flex;flex-direction:column;gap:16px}
  .set__group{display:flex;flex-direction:column;gap:14px;padding:6px 2px}
  .set__row{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;
    padding-bottom:14px;border-bottom:1px solid var(--border-subtle)}
  .set__row:last-child{border-bottom:none;padding-bottom:0}
  .set__lbl b{display:block;color:var(--text-strong);font-size:14px;font-weight:500}
  .set__lbl span{font-size:12.5px;color:var(--text-muted)}

  /* toast stack */
  .toasts{position:fixed;right:24px;bottom:24px;display:flex;flex-direction:column;gap:12px;z-index:var(--z-toast)}

  .placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
    color:var(--text-faint);padding:80px 0;text-align:center}
  .placeholder svg{width:32px;height:32px}
</style>
</head>
<body>
<div id="root"></div>

<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script src="../../_ds_bundle.js"></script>
<script type="text/babel" src="shell.jsx"></script>
<script type="text/babel" src="screens.jsx"></script>
<script type="text/babel">
  const { Sidebar, Topbar, Overview, ContentLibrary, ReviewQueue } = window;
  const { Toast, Switch, Button, Card, CardHeader, Input, Select } = window.OmnaraDesignSystem_c73439;
  const I = (n) => <i data-lucide={n}></i>;

  const TITLES = {
    overview: ["Overview", "Tuesday, June 13 · 4 drafts need your review"],
    content: ["Content", "1,204 items across 3 connected sites"],
    review: ["Review queue", "4 AI drafts waiting for approval"],
    sites: ["Sites", "3 platforms connected through the MCP server"],
    settings: ["Settings", "Confidential controls — managed by you, not the agent"],
  };

  function Settings() {
    return (
      <div className="dash__body">
        <Card elevation="flat" padding="lg" className="set">
          <CardHeader title="Agent autonomy" icon={I("shield")} />
          <div className="set__group">
            <div className="set__row">
              <div className="set__lbl"><b>Auto-publish AI drafts</b><span>omnara publishes without waiting for human review</span></div>
              <Switch />
            </div>
            <div className="set__row">
              <div className="set__lbl"><b>Auto-sync media to CDN</b><span>Mirror images and assets on every publish</span></div>
              <Switch defaultChecked />
            </div>
            <div className="set__row">
              <div className="set__lbl"><b>Allow schema changes</b><span>Let the agent add content types and fields</span></div>
              <Switch />
            </div>
          </div>
        </Card>
        <Card elevation="flat" padding="lg" className="set">
          <CardHeader title="Confidential — secrets" icon={I("key-round")}
            action={<Button size="sm" variant="secondary" iconLeft={I("plus")}>Add secret</Button>} />
          <div className="set__group">
            <div className="set__row">
              <div className="set__lbl"><b>Shopify Admin API token</b><span>shop.example.com · never exposed to the agent</span></div>
              <Input size="sm" defaultValue="shpat_••••••••••" style={{width:220}} iconRight={I("eye-off")} />
            </div>
            <div className="set__row">
              <div className="set__lbl"><b>WordPress app password</b><span>journal.example.com</span></div>
              <Input size="sm" defaultValue="••••••••••••" style={{width:220}} iconRight={I("eye-off")} />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function Placeholder({ icon, text }) {
    return <div className="dash__body"><div className="placeholder">{I(icon)}<span>{text}</span></div></div>;
  }

  function App() {
    const [screen, setScreen] = React.useState("overview");
    const [toasts, setToasts] = React.useState([]);
    React.useEffect(() => { window.lucide && window.lucide.createIcons(); });

    const pushToast = (toast) => {
      const id = Math.random();
      setToasts((t) => [...t, { ...toast, id }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
    };

    const onPublish = () => pushToast({ variant: "success", title: "Published", msg: "3 pages live on shop.example.com" });

    let body;
    if (screen === "overview") body = <Overview />;
    else if (screen === "content") body = <ContentLibrary />;
    else if (screen === "review") body = <ReviewQueue onPublish={onPublish} />;
    else if (screen === "settings") body = <Settings />;
    else if (screen === "sites") body = <Placeholder icon="globe" text="Site connections — out of scope for this kit" />;
    else body = <Placeholder icon="box" text="Empty" />;

    const [title, sub] = TITLES[screen];
    const topAction = screen === "content"
      ? null
      : <Button variant="primary" iconLeft={I("sparkles")}
          onClick={() => pushToast({ variant: "ai", title: "omnara is drafting…", msg: "A new page will appear in your review queue" })}>
          Ask omnara
        </Button>;

    return (
      <div className="dash">
        <Sidebar active={screen} onNav={setScreen} />
        <div className="dash__main">
          <Topbar title={title} sub={sub} action={topAction} />
          {body}
        </div>
        <div className="toasts">
          {toasts.map((t) => (
            <Toast key={t.id} variant={t.variant} title={t.title}
              icon={t.variant === "ai" ? I("sparkles") : undefined}
              onClose={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
              {t.msg}
            </Toast>
          ))}
        </div>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>
</body>
</html>
