import { useState, type ReactNode } from "react";
import { useParams } from "react-router";
import {
  SWAddSheet,
  SWAlertManager,
  SWBulletPointText,
  SWFloatingLabels,
  SWGradientDivider,
  SWImageThumbnail,
  SWKPICard,
  SWKPIDeltaTag,
  SWLabelWithIcon,
  SWLabelWithImage,
  SWLoadingManager,
  SWMarkdownText,
  SWOnboardingView,
  SWOrderView,
  SWPageLoading,
  SWRootTabView,
  SWRotatingQuote,
  SWScrollingFAQ,
  SWSearchBar,
  SWStatusBadge,
  SWStepper,
  SWTabButton,
  SWThinkingIndicator,
  SWVideoPlayer,
  SWWallet,
} from "@/swpackage/swcomponent";
import { CatalogList, DemoPage } from "./DemoPage";

const ITEMS = [
  { id: "floating", title: "Floating Labels", icon: "tag.fill", description: "Animated floating capsule labels over an image." },
  { id: "faq", title: "Scrolling FAQ", icon: "bubble.left.and.text.bubble.right", description: "Auto-scrolling horizontal FAQ carousel." },
  { id: "quote", title: "Rotating Quote", icon: "text.quote", description: "Auto-rotating quote display with author attribution." },
  { id: "basic", title: "Basic Display Elements", icon: "rectangle.3.group", description: "BulletPointText, GradientDivider, and LabelWithIcon." },
  { id: "onboarding", title: "Onboarding", icon: "hand.wave.fill", description: "Multi-page welcome flow with skip support." },
  { id: "order", title: "Order", icon: "cup.and.saucer.fill", description: "Animated drink customization demo." },
  { id: "tab", title: "Tab", icon: "rectangle.split.3x1.fill", description: "TabView template with selected/unselected icons." },
  { id: "markdown", title: "Markdown Text", icon: "text.badge.checkmark", description: "Custom Markdown renderer for LLM output." },
  { id: "badge", title: "Status Badge", icon: "circle.dotted", description: "Capsule status badge with five semantic styles." },
  { id: "thumbnail", title: "Image Thumbnail", icon: "photo.fill", description: "Square image tile with color fallback." },
  { id: "kpi", title: "KPI Card", icon: "rectangle.stack.badge.plus", description: "Dashboard KPI card with animated value and delta tag." },
  { id: "wallet", title: "Wallet", icon: "wallet.bifold.fill", description: "Payment-card stack with a reveal toggle." },
  { id: "video", title: "Video Player", icon: "play.fill", description: "Preview plus fullscreen HTML5 video player." },
  { id: "alert", title: "SWAlert", icon: "bell.badge", description: "Toast overlay with info/success/warning/error presets." },
  { id: "loading", title: "SWLoading", icon: "hourglass", description: "Fullscreen loading overlay with optional icon." },
  { id: "thinking", title: "Thinking Indicator", icon: "ellipsis.bubble.fill", description: "Three bouncing dots for typing state." },
  { id: "tabs", title: "Tab Button", icon: "rectangle.split.3x1.fill", description: "Capsule segmented tab buttons." },
  { id: "stepper", title: "Stepper", icon: "plus", description: "Compact +/- quantity stepper with haptics." },
  { id: "search", title: "Search Bar", icon: "magnifyingglass", description: "Frosted capsule search field." },
  { id: "sheet", title: "Add Sheet", icon: "plus", description: "Bottom sheet with text field and Cancel/Continue." },
];

export function UIListView() {
  return <CatalogList title="UI" base="/ui" items={ITEMS} />;
}

function AlertDemo() {
  return (
    <div className="sw-demo-stack">
      <p>Tap to trigger alerts</p>
      {(["info", "success", "warning", "error"] as const).map((type) => (
        <button
          key={type}
          type="button"
          className="sw-btn sw-btn-secondary"
          onClick={() => SWAlertManager.shared.show(type, `This is a ${type} message`)}
        >
          {type}
        </button>
      ))}
      <button
        type="button"
        className="sw-btn sw-btn-primary"
        onClick={() =>
          SWAlertManager.shared.show({
            icon: "star.fill",
            message: "Custom alert style",
            textColor: "var(--sw-yellow)",
            backgroundStyle: "#111",
            borderColor: "var(--sw-yellow)",
          })
        }
      >
        Custom
      </button>
    </div>
  );
}

function LoadingDemo() {
  return (
    <SWPageLoading page="home">
      <div className="sw-demo-stack" style={{ background: "linear-gradient(135deg, #007aff, #af52de)", color: "#fff", minHeight: "70vh" }}>
        <h2>Page Content</h2>
        <button
          type="button"
          className="sw-btn sw-btn-primary"
          onClick={() => {
            SWLoadingManager.shared.show("home", "Loading data...");
            setTimeout(() => SWLoadingManager.shared.hide("home"), 2000);
          }}
        >
          Show Default Loading
        </button>
        <button
          type="button"
          className="sw-btn sw-btn-secondary"
          onClick={() => {
            SWLoadingManager.shared.show({
              page: "home",
              message: "Syncing data...",
              systemImage: "arrow.triangle.2.circlepath",
            });
            setTimeout(() => SWLoadingManager.shared.hide("home"), 2000);
          }}
        >
          Show Loading with Icon
        </button>
      </div>
    </SWPageLoading>
  );
}

function InputDemo() {
  const [tab, setTab] = useState(0);
  const [qty, setQty] = useState(1);
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState(false);
  return (
    <div className="sw-demo-stack">
      <div style={{ display: "flex", gap: 8 }}>
        {["All", "Favorites", "Recent"].map((title, i) => (
          <SWTabButton key={title} title={title} isSelected={tab === i} action={() => setTab(i)} />
        ))}
      </div>
      <SWStepper quantity={qty} onQuantityChange={setQty} />
      <div style={{ width: "100%" }}>
        <SWSearchBar text={query} onTextChange={setQuery} />
      </div>
      <button type="button" className="sw-btn sw-btn-primary" onClick={() => setSheet(true)}>
        Open Add Sheet
      </button>
      <SWAddSheet isPresented={sheet} onIsPresentedChange={setSheet} onConfirm={() => setSheet(false)} />
    </div>
  );
}

const DEMOS: Record<string, () => ReactNode> = {
  floating: () => (
    <SWFloatingLabels
      image="/demo/face-picture.png"
      labels={[
        { text: "Teeth mapping", position: { x: 0.3, y: 0.5 } },
        { text: "Plaque detection", position: { x: 0.9, y: 0.6 } },
        { text: "Shape & balance", position: { x: 0.5, y: 0.8 } },
      ]}
    />
  ),
  faq: () => (
    <SWScrollingFAQ
      title="Let's talk about new topics"
      onTap={() => undefined}
      rows={[
        ["How does AI work?", "What can I ask?", "How accurate?", "Help with coding?"],
        ["Write an email", "Summarize article", "Translate text", "Creative ideas"],
        ["Best approach?", "How to improve?", "Give examples", "Compare options"],
      ]}
    />
  ),
  quote: () => (
    <SWRotatingQuote
      quotes={[
        "Those times when you get up early, and you work hard.",
        "It's not the destination, it's the journey.",
      ]}
      author="Kobe Bryant"
    />
  ),
  basic: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SWBulletPointText bulletColor="var(--sw-blue)">Wealth</SWBulletPointText>
      <SWBulletPointText bulletColor="var(--sw-green)">Health</SWBulletPointText>
      <SWGradientDivider />
      <SWLabelWithIcon />
      <SWLabelWithIcon icon="gearshape" bg="var(--sw-orange)" name="Settings" />
      <SWLabelWithImage image="/demo/fullpack-logo.png" name="FullPack" />
    </div>
  ),
  onboarding: () => <SWOnboardingView onComplete={() => undefined} />,
  order: () => <SWOrderView />,
  tab: () => <SWRootTabView />,
  markdown: () => (
    <SWMarkdownText
      text={`# Heading 1
## Heading 2
This is a paragraph with **bold** and *italic* text.

Here is \`inline code\` in a sentence.

\`\`\`ts
function greet() {
  console.log("Hello, world!");
}
\`\`\`

- First item
- Second item with **bold**

1. Ordered item one
2. Ordered item two

---

Another paragraph after the divider.`}
    />
  ),
  badge: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <SWStatusBadge text="Info" style="info" />
      <SWStatusBadge text="Success" style="success" />
      <SWStatusBadge text="Warning" style="warning" />
      <SWStatusBadge text="Error" style="error" />
      <SWStatusBadge text="Neutral" style="neutral" />
    </div>
  ),
  thumbnail: () => (
    <div className="sw-demo-stack">
      <SWImageThumbnail imageName="latte" size={200} cornerRadius={24} />
      <SWImageThumbnail imageName="PreviewMissingAsset" />
    </div>
  ),
  kpi: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <SWKPICard title="Today's Revenue" value="$1,234" icon="dollarsign.circle.fill" tint="var(--sw-brown)">
        <SWKPIDeltaTag delta={12.5} />
      </SWKPICard>
      <SWKPICard title="Cups Sold" value="128" icon="cup.and.saucer.fill" tint="var(--sw-orange)" />
    </div>
  ),
  wallet: () => <SWWallet />,
  video: () => <SWVideoPlayer poster="/demo/galaxy.jpg" />,
  alert: () => <AlertDemo />,
  loading: () => <LoadingDemo />,
  thinking: () => (
    <div className="sw-demo-stack">
      <SWThinkingIndicator />
      <SWThinkingIndicator dotSize={10} dotColor="var(--sw-blue)" spacing={6} />
    </div>
  ),
  tabs: () => <InputDemo />,
  stepper: () => <InputDemo />,
  search: () => <InputDemo />,
  sheet: () => <InputDemo />,
};

export function UIDemo() {
  const { id = "" } = useParams();
  const item = ITEMS.find((i) => i.id === id);
  const Demo = DEMOS[id];
  return (
    <DemoPage title={item?.title ?? id} pad={id !== "onboarding" && id !== "tab" && id !== "order"}>
      {Demo ? Demo() : <p>Unknown demo</p>}
    </DemoPage>
  );
}
