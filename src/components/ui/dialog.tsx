"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  setOpen: () => {},
});

function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { setOpen } = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(true),
    });
  }
  return (
    <button type="button" onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(DialogContext);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}

function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground mt-1", className)}>{children}</p>;
}

function DialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex justify-end gap-2 mt-6", className)}>{children}</div>;
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
