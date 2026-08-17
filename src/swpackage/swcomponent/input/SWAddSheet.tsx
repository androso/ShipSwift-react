/**
 * Bottom sheet with a text input field, Cancel and Continue buttons.
 * Presented as a medium-height sheet for collecting user input
 * (e.g. purpose, wish, notes).
 *
 * Usage:
 *   <SWAddSheet
 *     isPresented={showSheet}
 *     onIsPresentedChange={setShowSheet}
 *     onConfirm={(text) => console.log(text)}
 *   />
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SWButton } from "@/swpackage/swutil";

export function SWAddSheet({
  isPresented,
  onIsPresentedChange,
  title = "Your Generation Purpose",
  placeHolderText = "Enter your purpose/wish/favorite things for this generation (optional)...",
  minLines = 5,
  onConfirm,
}: {
  isPresented: boolean;
  onIsPresentedChange: (isPresented: boolean) => void;
  title?: string;
  placeHolderText?: string;
  minLines?: number;
  onConfirm?: (text: string) => void;
}) {
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    if (isPresented) setInputText("");
  }, [isPresented]);

  return (
    <AnimatePresence>
      {isPresented && (
        <motion.div
          className="sw-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onIsPresentedChange(false)}
        >
          <motion.div
            className="sw-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            exit={{ y: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(event) => event.stopPropagation()}
            style={{ minHeight: "48vh" }}
          >
            <div
              style={{
                width: 36,
                height: 5,
                borderRadius: 3,
                background: "var(--sw-fill)",
                margin: "4px auto 12px",
              }}
            />
            <p
              style={{
                margin: "0 16px 8px",
                fontSize: 17,
                fontWeight: 600,
                textAlign: "left",
              }}
            >
              {title}
            </p>
            <textarea
              value={inputText}
              placeholder={placeHolderText}
              rows={minLines}
              onChange={(event) => setInputText(event.target.value)}
              style={{
                width: "100%",
                resize: "vertical",
                minHeight: minLines * 22,
                padding: 16,
                borderRadius: 16,
                border: "1px solid var(--sw-label)",
                background: "transparent",
                outline: "none",
              }}
            />
            <div style={{ flex: 1, minHeight: 32 }} />
            <div style={{ display: "flex", gap: 12, paddingTop: 12 }}>
              <SWButton
                variant="secondary"
                onClick={() => onIsPresentedChange(false)}
              >
                Cancel
              </SWButton>
              <SWButton
                variant="primary"
                disabled={inputText.trim().length === 0}
                onClick={() => {
                  onConfirm?.(inputText);
                  onIsPresentedChange(false);
                }}
              >
                Continue
              </SWButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
