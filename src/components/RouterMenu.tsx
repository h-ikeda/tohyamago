import { useState, useCallback } from 'react'

const links = [
  { path: '/purpose', title: '活動趣旨' },
  { path: '/membership', title: '入会案内' },
  { path: '/articles', title: '定款' },
  { path: '/public_notices', title: '公告' },
  { path: 'https://shop.tohyamago.org', title: '成果品販売' },
  { path: '/notation', title: '特定商取引法に基づく表記' },
]

type Phase = 'closed' | 'opening' | 'open' | 'closing-v' | 'closing-next'

export default function RouterMenu({
  currentPath = '/',
}: {
  currentPath?: string
}) {
  const [phase, setPhase] = useState<Phase>('closed')

  const menuVisible =
    phase === 'opening' ||
    phase === 'open' ||
    phase === 'closing-v' ||
    phase === 'closing-next'
  const btnVisible =
    phase === 'closed' ||
    phase === 'opening' ||
    phase === 'closing-v' ||
    phase === 'closing-next'

  const open = useCallback(() => setPhase('opening'), [])

  const cancel = useCallback(() => setPhase('closing-v'), [])

  const next = useCallback(() => setPhase('closing-next'), [])

  const onMenuAnimEnd = useCallback(() => {
    if (phase === 'opening') setPhase('open')
    if (phase === 'closing-v' || phase === 'closing-next') setPhase('closed')
  }, [phase])

  const onBtnAnimEnd = useCallback(() => {
    // no state change needed on button anim end
  }, [])

  const isActive = (path: string) => {
    if (path.startsWith('https://')) return false
    return currentPath === path
  }

  const menuAnim =
    phase === 'opening'
      ? 'rm-menu-enter 0.2s forwards'
      : phase === 'closing-v'
        ? 'rm-menu-leave-v 0.2s forwards'
        : phase === 'closing-next'
          ? 'rm-menu-leave-next 0.2s forwards'
          : undefined

  const btnAnim =
    phase === 'closed'
      ? undefined
      : phase === 'opening'
        ? 'rm-menu-leave-next 0.2s forwards'
        : phase === 'closing-next'
          ? 'rm-btn-enter-next 0.2s forwards'
          : 'rm-btn-enter-v 0.2s forwards'

  return (
    <>
      {/* Backdrop (メニュー外クリックで閉じる) */}
      {(phase === 'open' || phase === 'opening') && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="メニューを閉じる"
          className="fixed inset-0 z-10"
          onClick={cancel}
        />
      )}

      {/* 目次ボタン */}
      <button
        onClick={open}
        onAnimationEnd={onBtnAnimEnd}
        style={{
          display: btnVisible ? undefined : 'none',
          animation: btnAnim,
        }}
        className="fixed left-4 z-20 bottom-2 w-14 h-14 rounded-full border border-primary-soft shadow-lg bg-primary-deep text-white cursor-pointer
                   after:content-['▲'] after:absolute after:bottom-14 after:inset-x-0 after:text-sm after:text-accent after:animate-bounce"
      >
        目次
      </button>

      {/* メニュー */}
      <menu
        onAnimationEnd={onMenuAnimEnd}
        style={{
          display: menuVisible ? undefined : 'none',
          animation: menuAnim,
        }}
        className="fixed left-4 z-20 bottom-4 bg-primary-deep flex flex-col rounded-xl border border-primary-soft text-white shadow-xl"
      >
        {links.map((link) => (
          <li
            key={link.path}
            className="border-b border-primary-soft last:border-none"
          >
            <a
              href={link.path}
              onClick={next}
              className={[
                'flex px-5 py-2 gap-2 transition-colors hover:bg-white/15',
                isActive(link.path)
                  ? 'before:border-l-4 before:border-y-4 before:border-l-accent before:h-0 before:self-center'
                  : 'before:border-l-4 before:border-transparent',
              ].join(' ')}
            >
              {link.title}
            </a>
          </li>
        ))}
      </menu>
    </>
  )
}
