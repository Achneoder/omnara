/* omnara Management Dashboard — screens */
const DSx = window.OmnaraDesignSystem_c73439;
const { Card, CardHeader, Badge, Tag, Button, IconButton, Avatar, Tabs, Select, Switch } = DSx;
const Ic = (n) => <i data-lucide={n}></i>;

/* ---------- Overview ---------- */
const STATS = [
  { k: "Live pages", v: "1,204", icon: "check-check", tone: "live" },
  { k: "Needs review", v: "4", icon: "eye", tone: "warning" },
  { k: "Sites connected", v: "3", icon: "globe", tone: "neutral" },
  { k: "Drafted today", v: "18", icon: "sparkles", tone: "ai" },
];
const ACTIVITY = [
  { who: "agent", t: "Published 3 pages to shop.example.com", time: "2s ago", icon: "check-check" },
  { who: "agent", t: "Drafted “Summer collection” landing page", time: "11m ago", icon: "sparkles" },
  { who: "Dana", t: "Approved “Returns policy” update", time: "1h ago", icon: "circle-check" },
  { who: "agent", t: "Synced 42 media assets to the CDN", time: "2h ago", icon: "refresh-cw" },
];
const REVIEW = [
  { t: "Summer collection — landing page", site: "shopify", type: "page", when: "11m ago" },
  { t: "How we source our linen", site: "wordpress", type: "post", when: "26m ago" },
  { t: "Updated FAQ — shipping & returns", site: "wordpress", type: "page", when: "1h ago" },
  { t: "Product copy — Aram lounge chair", site: "shopify", type: "product", when: "3h ago" },
];

function Overview() {
  return (
    <div className="dash__body">
      <div className="dash__stats">
        {STATS.map((s) => (
          <Card key={s.k} elevation="flat" padding="md" className="stat">
            <span className={"stat__ic stat__ic--" + s.tone}>{Ic(s.icon)}</span>
            <div className="stat__v">{s.v}</div>
            <div className="stat__k">{s.k}</div>
          </Card>
        ))}
      </div>

      <div className="dash__cols">
        <Card elevation="flat" padding="lg" className="grow">
          <CardHeader title="Needs your review"
            action={<Badge variant="ai">{Ic("sparkles")}drafted by omnara</Badge>} />
          <div className="rev">
            {REVIEW.map((r) => (
              <div className="rev__row" key={r.t}>
                <span className="rev__ic">{Ic("file-text")}</span>
                <div className="rev__meta">
                  <b>{r.t}</b>
                  <span><Tag>{r.site}</Tag> · {r.type} · {r.when}</span>
                </div>
                <div className="rev__act">
                  <Button size="sm" variant="ghost">View</Button>
                  <Button size="sm" variant="primary">Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card elevation="flat" padding="lg" style={{ width: 320, flex: "0 0 320px" }}>
          <CardHeader title="Activity" />
          <div className="feed">
            {ACTIVITY.map((a, i) => (
              <div className="feed__row" key={i}>
                {a.who === "agent" ? <Avatar agent size="xs" /> : <Avatar name={a.who} size="xs" />}
                <div className="feed__meta">
                  <span>{a.t}</span>
                  <time>{a.time}</time>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Content library ---------- */
const ITEMS = [
  { t: "Homepage", type: "page", plat: "shopify", status: "live", by: "agent", when: "2s ago" },
  { t: "Summer collection", type: "page", plat: "shopify", status: "review", by: "agent", when: "11m ago" },
  { t: "How we source our linen", type: "post", plat: "wordpress", status: "review", by: "agent", when: "26m ago" },
  { t: "Returns policy", type: "page", plat: "wordpress", status: "live", by: "Dana", when: "1h ago" },
  { t: "Aram lounge chair", type: "product", plat: "shopify", status: "draft", by: "agent", when: "3h ago" },
  { t: "About the studio", type: "page", plat: "custom", status: "live", by: "agent", when: "1d ago" },
];
const STATUS = {
  live: { variant: "live", dot: true, label: "Live" },
  review: { variant: "warning", label: "Needs review" },
  draft: { variant: "neutral", label: "Draft" },
};

function ContentLibrary() {
  const [tab, setTab] = React.useState("all");
  const rows = ITEMS.filter((r) =>
    tab === "all" ? true : tab === "ai" ? r.by === "agent" : tab === "review" ? r.status === "review" : r.status === "live");
  return (
    <div className="dash__body">
      <div className="lib__bar">
        <Tabs value={tab} onChange={setTab} items={[
          { value: "all", label: "All", count: ITEMS.length },
          { value: "ai", label: "AI-drafted" },
          { value: "review", label: "Needs review", count: 2 },
          { value: "live", label: "Live" },
        ]} />
        <div className="lib__tools">
          <Select size="sm" options={["All platforms", "Shopify", "WordPress", "Custom"]} />
          <Button size="sm" variant="primary" iconLeft={Ic("plus")}>New content</Button>
        </div>
      </div>

      <Card elevation="flat" padding="sm">
        <table className="tbl">
          <thead><tr><th>Title</th><th>Type</th><th>Platform</th><th>Status</th><th>Author</th><th>Updated</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => {
              const st = STATUS[r.status];
              return (
                <tr key={r.t}>
                  <td className="tbl__t">{Ic("file-text")}<b>{r.t}</b></td>
                  <td><Tag>{r.type}</Tag></td>
                  <td><Tag icon={Ic("globe")}>{r.plat}</Tag></td>
                  <td><Badge variant={st.variant} dot={st.dot}>{st.label}</Badge></td>
                  <td className="tbl__by">{r.by === "agent"
                    ? <><Avatar agent size="xs" /> omnara</>
                    : <><Avatar name={r.by} size="xs" /> {r.by}</>}</td>
                  <td className="tbl__when">{r.when}</td>
                  <td><IconButton label="More" variant="ghost" size="sm">{Ic("more-horizontal")}</IconButton></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------- Review detail ---------- */
function ReviewQueue({ onPublish }) {
  const [sel, setSel] = React.useState(0);
  const r = REVIEW[sel];
  return (
    <div className="dash__body rev2">
      <Card elevation="flat" padding="sm" className="rev2__list">
        <div className="om-eyebrow" style={{ padding: "8px 10px 4px" }}>Queue · 4</div>
        {REVIEW.map((it, i) => (
          <button key={it.t} className={"rev2__item" + (i === sel ? " is-active" : "")} onClick={() => setSel(i)}>
            <b>{it.t}</b>
            <span><Tag>{it.site}</Tag> · {it.when}</span>
          </button>
        ))}
      </Card>

      <Card elevation="flat" padding="lg" className="rev2__detail">
        <div className="rev2__head">
          <div>
            <Badge variant="ai">{Ic("sparkles")}drafted by omnara</Badge>
            <h2>{r.t}</h2>
            <p className="rev2__sub"><Tag icon={Ic("globe")}>{r.site}</Tag> · {r.type} · {r.when}</p>
          </div>
          <div className="rev2__actions">
            <Button variant="secondary" iconLeft={Ic("message-square")}>Request changes</Button>
            <Button variant="primary" iconLeft={Ic("check-check")} onClick={onPublish}>Approve &amp; publish</Button>
          </div>
        </div>
        <div className="rev2__preview">
          <div className="prose">
            <h3>Summer, in linen.</h3>
            <p>A capsule of breathable, naturally dyed pieces — cut for long days and warm evenings. Each item is woven from European flax and finished in small batches.</p>
            <p>Free shipping over $120 · 30-day returns · carbon-neutral delivery.</p>
            <span className="diff diff--add">+ Added 2 product highlights and an SEO description</span>
            <span className="diff diff--add">+ Linked 6 products from the Summer collection</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { Overview, ContentLibrary, ReviewQueue });
