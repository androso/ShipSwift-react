import { SWAlertManager } from "../src/swpackage/swcomponent/feedback/SWAlert";
import { SWLoadingManager } from "../src/swpackage/swcomponent/feedback/SWLoading";
import { SWWalletCard } from "../src/swpackage/swcomponent/display/SWWallet";

SWAlertManager.shared.show("success", "Saved!");
const alert = SWAlertManager.shared.getSnapshot();
if (!alert.isShowing || alert.message !== "Saved!" || alert.icon !== "checkmark.circle.fill") {
  console.error("SWAlertManager.show failed", alert);
  process.exit(1);
}
SWAlertManager.shared.dismiss();
if (SWAlertManager.shared.getSnapshot().isShowing) {
  console.error("SWAlertManager.dismiss failed");
  process.exit(1);
}

SWLoadingManager.shared.show("home", "Loading data...");
if (!SWLoadingManager.shared.state("home").isShowing) {
  console.error("SWLoadingManager.show failed");
  process.exit(1);
}
SWLoadingManager.shared.updateMessage("home", "Almost done...");
if (SWLoadingManager.shared.state("home").message !== "Almost done...") {
  console.error("SWLoadingManager.updateMessage failed");
  process.exit(1);
}
SWLoadingManager.shared.hide("home");
if (SWLoadingManager.shared.state("home").isShowing) {
  console.error("SWLoadingManager.hide failed");
  process.exit(1);
}

if (SWWalletCard.sample.length !== 3) {
  console.error("SWWalletCard.sample should include 3 cards");
  process.exit(1);
}

console.log("SWAlertManager / SWLoadingManager / SWWalletCard: ok");
