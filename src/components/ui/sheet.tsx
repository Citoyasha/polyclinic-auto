import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

// Tracks the on-screen keyboard via the Visual Viewport API so the bottom
// sheet can lift above it on Android. Returns the keyboard height in px,
// or 0 when no keyboard is showing (or the API isn't available).
function useKeyboardInset(active: boolean): number {
  const [inset, setInset] = React.useState(0)
  React.useEffect(() => {
    if (!active) {
      setInset(0)
      return
    }
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const next = Math.max(
        0,
        Math.round(window.innerHeight - vv.height - vv.offsetTop),
      )
      setInset(next)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [active])
  return inset
}

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
>(({ className, contentClassName, title, hideHandle, children, style, ...props }, ref) => {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  const keyboard = useKeyboardInset(mounted)
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed inset-x-0 z-50 flex flex-col rounded-t-[20px] bg-surface text-fg shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-transform data-[state=closed]:translate-y-full data-[state=open]:translate-y-0',
          className,
        )}
        style={{
          bottom: keyboard,
          maxHeight: `calc(92dvh - ${keyboard}px)`,
          ...style,
        }}
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
  )
})
SheetContent.displayName = DialogPrimitive.Content.displayName

export { Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay, SheetContent }
