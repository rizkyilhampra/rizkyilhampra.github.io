import { createContext, useCallback, useContext, useState } from "react";
import { GraphModal } from "./GraphModal";

// Lets any descendant open the full-garden graph as an overlay, no matter which
// page it's on. Mounted in PageShell, so every page that renders a shell gets the
// affordance. State is per-page (a fresh instance per navigation), which is all
// we need: opening a node closes the overlay, so it never has to outlive a page.
const GraphModalContext = createContext(() => {});

export function useGraphModal() {
  return useContext(GraphModalContext);
}

export function GraphModalProvider({ onNavigate, children }) {
  const [open, setOpen] = useState(false);

  const openGraph = useCallback(() => setOpen(true), []);
  const closeGraph = useCallback(() => setOpen(false), []);

  // Following a node navigates away, so the overlay should step aside with it.
  const navigateAndClose = useCallback(
    (to) => {
      setOpen(false);
      onNavigate?.(to);
    },
    [onNavigate]
  );

  return (
    <GraphModalContext.Provider value={openGraph}>
      {children}
      {open ? (
        <GraphModal onClose={closeGraph} onNavigate={navigateAndClose} />
      ) : null}
    </GraphModalContext.Provider>
  );
}
