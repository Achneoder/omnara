<!-- @dsCard group="Components" viewport="700x300" name="Feedback — dialog, toast, tooltip" subtitle="Modal dialog, toasts & tooltips" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="../../styles.css">
<style>
  body { margin: 0; background: var(--bg-subtle); padding: 24px; }
  .wrap { display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; }
  .col { display: flex; flex-direction: column; gap: 14px; }
  /* keep the dialog inline (not fixed) for the card preview */
  .inline-dialog .om-dialog__scrim { position: static; padding: 0; background: none; backdrop-filter: none; }
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
  const { Dialog, Toast, Tooltip, Button, IconButton } = window.OmnaraDesignSystem_c73439;
  const Ico = (n) => <i data-lucide={n}></i>;
  function Demo() {
    return (
      <>
        <div className="inline-dialog" style={{flex: "0 0 340px"}}>
          <Dialog title="Publish to production?" description="omnara will push 3 pages to shop.example.com."
            icon={Ico("check-check")} onClose={() => {}}
            footer={<>
              <Button variant="ghost">Cancel</Button>
              <Button variant="primary">Publish changes</Button>
            </>}>
            <span style={{font: "var(--type-body-sm)", color: "var(--text-muted)"}}>
              This can be reverted from version history.
            </span>
          </Dialog>
        </div>
        <div className="col">
          <Toast variant="success" title="Published" onClose={() => {}}>3 pages live on shop.example.com</Toast>
          <Toast variant="ai" title="omnara drafted a page" icon={Ico("sparkles")} onClose={() => {}}>Review before it goes live</Toast>
          <div style={{display: "flex", gap: 10, paddingTop: 4}}>
            <Tooltip label="Revert to previous version" kbd="⌘Z">
              <IconButton label="Revert" variant="outline">{Ico("rotate-ccw")}</IconButton>
            </Tooltip>
            <Tooltip label="Version history" side="bottom">
              <IconButton label="History" variant="outline">{Ico("git-branch")}</IconButton>
            </Tooltip>
          </div>
        </div>
      </>
    );
  }
  ReactDOM.createRoot(document.getElementById("root")).render(<Demo />);
  setTimeout(() => window.lucide && window.lucide.createIcons(), 60);
</script>
</body>
</html>
