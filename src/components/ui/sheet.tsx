import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
))
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

interface SheetContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    'title'
  > {
  title?: React.ReactNode
  hideHandle?: boolean
  contentClassName?: string
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, contentClassName, title, hideHandle, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-[20px] bg-surface text-fg shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-transform data-[state=closed]:translate-y-full data-[state=open]:translate-y-0',
        className,
      )}
      {...props}
    >
      {!hideHandle && (
        <div className="flex flex-none justify-center pb-1 pt-2.5">
          <span className="h-1 w-9 rounded-full bg-border" />
        </div>
      )}
      {title && (
        <div className="flex flex-none items-center justify-between border-b border-border px-5 pb-3.5 pt-1 text-lg font-semibold">
          <DialogPrimitive.Title>{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="rounded-md p-1 text-fg-muted hover:bg-surface-alt"
            aria-label="Fermer"
          >
            <X size={22} />
          </DialogPrimitive.Close>
        </div>
      )}
      {!title && (
        <DialogPrimitive.Title className="sr-only">Bottom sheet</DialogPrimitive.Title>
      )}
      <div className={cn('flex-1 overflow-auto', contentClassName)}>{children}</div>
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = DialogPrimitive.Content.displayName

export { Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay, SheetContent }
