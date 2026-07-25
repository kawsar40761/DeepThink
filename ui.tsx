"use client";

import { forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, X, Check, ChevronDown, Sun, Moon, Monitor } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTheme } from "@/hooks";

// ---------- Button ----------
const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200",
        secondary:
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
        outline:
          "border border-neutral-200 text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800",
        ghost:
          "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800",
        danger:
          "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-lg",
        md: "h-10 px-4 text-sm rounded-xl",
        lg: "h-12 px-6 text-base rounded-xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

// ---------- Card ----------
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, padding = "md", ...props }, ref) => {
    const paddingClasses = {
      none: "p-0",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-card transition-all",
          hoverable && "hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer",
          paddingClasses[padding],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// ---------- Badge ----------
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        success: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        danger: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// ---------- Modal (Radix Dialog) ----------
interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

function Modal({ open, onOpenChange, children, className, showCloseButton = true }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-modal data-[state=open]:animate-scale-in dark:bg-neutral-900",
            className
          )}
        >
          {children}
          {showCloseButton && (
            <Dialog.Close className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
              <X className="h-5 w-5" />
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------- Input ----------
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-xl border bg-white px-4 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500",
        error ? "border-red-500 focus:ring-red-500" : "border-neutral-200 dark:border-neutral-800",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

// ---------- Textarea ----------
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border bg-white px-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500",
        error ? "border-red-500 focus:ring-red-500" : "border-neutral-200 dark:border-neutral-800",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

// ---------- Spinner ----------
function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-neutral-500", className)} />;
}

// ---------- Skeleton ----------
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-700", className)} />;
}

// ---------- Theme Toggle ----------
function ThemeToggle() {
  const { theme, cycleTheme, mounted } = useTheme();
  if (!mounted) return null;
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
      aria-label={`Current theme: ${theme}. Click to cycle`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

// ---------- EmptyState ----------
interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
      {description && <p className="mt-2 text-sm text-neutral-500">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ---------- ErrorState ----------
function ErrorState({ message = "Something went wrong." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-red-500 font-medium">{message}</p>
    </div>
  );
}

export {
  Button,
  Card,
  Badge,
  Modal,
  Input,
  Textarea,
  Spinner,
  Skeleton,
  ThemeToggle,
  EmptyState,
  ErrorState,
};
