<!-- @dsCard group="Components" viewport="700x340" name="Core — buttons, badges, cards" subtitle="Buttons, icon buttons, badges, tags, avatars & cards" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="../../styles.css">
<style>
  body { margin: 0; background: var(--bg-base); padding: 24px; }
  .wrap { display: flex; flex-direction: column; gap: 22px; }
  .row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .lbl { font: var(--type-eyebrow); letter-spacing: var(--tracking-caps); text-transform: uppercase;
    color: var(--text-faint); width: 100%; }
</style>
</head>
<body>
<div id="root" class="wrap"></div>
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
<script src="../../_ds_bundle.js"></script>
<script type="text/babel">
  const { Button, IconButton, Badge, Tag, Avatar, Card, CardHeader } = window.OmnaraDesignSystem_c73439;
  const Ico = (n) => <i data-lucide={n}></i>;
  function Demo() {
    return (
      <>
        <div className="row"><span className="lbl">Buttons</span>
          <Button variant="primary" iconLeft={Ico("sparkles")}>Draft with omnara</Button>
          <Button variant="secondary">Review</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger" iconLeft={Ico("rotate-ccw")}>Revert</Button>
          <Button variant="primary" loading>Publishing</Button>
          <Button variant="secondary" disabled>Disabled</Button>
        </div>
        <div className="row"><span className="lbl">Sizes · icon buttons</span>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <IconButton label="New" variant="solid">{Ico("plus")}</IconButton>
          <IconButton label="Settings" variant="outline">{Ico("settings")}</IconButton>
          <IconButton label="More" variant="ghost">{Ico("more-horizontal")}</IconButton>
        </div>
        <div className="row"><span className="lbl">Badges · tags · avatars</span>
          <Badge variant="live" dot>Live</Badge>
          <Badge variant="ai">{Ico("sparkles")}Drafted by omnara</Badge>
          <Badge variant="warning">Needs review</Badge>
          <Badge variant="neutral">v0.42</Badge>
          <Tag icon={Ico("globe")}>shopify</Tag>
          <Tag variant="accent">blog/post</Tag>
          <Avatar name="Dana Reyes" status />
          <Avatar agent />
        </div>
        <Card elevation="flat" padding="md" style={{maxWidth: 360}}>
          <CardHeader title="Homepage" icon={Ico("file-text")}
            action={<Badge variant="live" dot>Live</Badge>} />
          <p className="om-card__body">Edited by omnara · 2s ago · 1,204 words</p>
        </Card>
      </>
    );
  }
  ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
  setTimeout(() => window.lucide && window.lucide.createIcons(), 60);
</script>
</body>
</html>
