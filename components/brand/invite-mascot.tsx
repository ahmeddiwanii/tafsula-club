/** Exact invitation artwork. The file is one picture, so the whole figure floats and breathes together. */

export function InviteMascot({ className = "" }: { className?: string }) {
  return (
    <div className={`taf-mascot ${className}`} aria-hidden>
      <img
        src="/brand/invite-mascot.png"
        alt=""
        width={1024}
        height={682}
        draggable={false}
        className="taf-mascot-breathe h-auto w-full select-none"
      />
    </div>
  )
}
