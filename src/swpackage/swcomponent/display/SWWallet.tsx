/**
 * A playful wallet "pocket" that holds a stack of payment cards. Cards tuck
 * into an olive-green pouch; tapping the eye springs them into a staggered
 * ladder and reveals every amount at once.
 *
 * Usage:
 *   <SWWallet />
 *   <SWWallet cards={SWWalletCard.sample} currencyCode="USD" />
 */
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { haptic, SWSymbol } from "@/swpackage/swutil";

export type SWWalletCard = {
  id: string;
  /** Wordmark shown on the card (e.g. "Stripe"). Rendered as plain bold text. */
  name: string;
  /** Card balance, summed into the wallet total. */
  balance: number;
  /** Card background fill color. */
  tint: string;
  /** Foreground (text) color used for the wordmark and amount. */
  foreground: string;
};

const SAMPLE_CARDS: SWWalletCard[] = [
  {
    id: "stripe",
    name: "stripe",
    balance: 32495,
    tint: "rgb(102, 77, 230)",
    foreground: "#fff",
  },
  {
    id: "wise",
    name: "Wise",
    balance: 45654,
    tint: "rgb(158, 237, 110)",
    foreground: "rgb(26, 41, 26)",
  },
  {
    id: "paypal",
    name: "PayPal",
    balance: 345865,
    tint: "rgb(242, 245, 247)",
    foreground: "rgb(26, 71, 168)",
  },
];

export const SWWalletCard = {
  sample: SAMPLE_CARDS,
};

const CARD_WIDTH = 250;
const CARD_HEIGHT = 150;
const COLLAPSED_BASE = 100;
const REVEALED_BASE = 4;
const HIDDEN_STEP = 16;
const REVEAL_STEP = 42;
const HIDDEN_SCALE_STEP = 0.05;
const REVEAL_SCALE_STEP = 0.11;
const POCKET_HEIGHT = 190;
const POCKET_TOP = 150;

export function SWWallet({
  cards = SWWalletCard.sample,
  currencyCode = "USD",
  walletColor = "rgb(41, 54, 23)",
}: {
  cards?: SWWalletCard[];
  currencyCode?: string;
  walletColor?: string;
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const totalBalance = useMemo(
    () => cards.reduce((sum, card) => sum + card.balance, 0),
    [cards],
  );
  const format = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div
      style={{
        width: CARD_WIDTH + 40,
        height: POCKET_TOP + POCKET_HEIGHT + 10,
        margin: "0 auto",
        padding: 24,
        position: "relative",
      }}
    >
      {cards.map((card, index) => {
        const backness = cards.length - 1 - index;
        const scale =
          1 - backness * (isRevealed ? REVEAL_SCALE_STEP : HIDDEN_SCALE_STEP);
        const y =
          (isRevealed ? REVEALED_BASE : COLLAPSED_BASE) +
          index * (isRevealed ? REVEAL_STEP : HIDDEN_STEP);
        return (
          <motion.div
            key={card.id}
            animate={{ y, scale }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 22,
              delay: index * 0.07,
            }}
            style={{
              position: "absolute",
              left: 20,
              top: 0,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              borderRadius: 18,
              background: card.tint,
              transformOrigin: "top center",
              zIndex: index,
              boxShadow: "0 4px 8px rgba(0,0,0,0.18)",
              outline: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: 18,
                fontFamily: 'ui-rounded, "SF Pro Rounded", var(--sw-font)',
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: card.foreground,
                }}
              >
                {card.name}
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: card.foreground,
                  opacity: 0.85,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {isRevealed ? format(card.balance) : "••••"}
              </span>
            </div>
          </motion.div>
        );
      })}

      <div
        className="sw-wallet-pocket"
        style={{
          position: "absolute",
          left: 0,
          top: POCKET_TOP,
          width: CARD_WIDTH + 40,
          height: POCKET_HEIGHT,
          background: walletColor,
          zIndex: cards.length + 10,
          boxShadow: "0 6px 10px rgba(0,0,0,0.2)",
        }}
      >
        <div className="sw-wallet-stitch" />
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "12px 20px 14px",
            fontFamily: 'ui-rounded, "SF Pro Rounded", var(--sw-font)',
          }}
        >
          <div style={{ flex: 1 }} />
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#fff",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {isRevealed ? format(totalBalance) : "••••••"}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.6)",
              marginTop: 6,
            }}
          >
            Total Balance
          </div>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            aria-label={isRevealed ? "Hide balances" : "Reveal balances"}
            onClick={() => {
              haptic();
              setIsRevealed((value) => !value);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SWSymbol
              name={isRevealed ? "eye" : "eye.slash"}
              size={16}
              color="rgba(255,255,255,0.85)"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
