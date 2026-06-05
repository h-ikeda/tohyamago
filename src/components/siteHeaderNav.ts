/**
 * SiteHeader のナビゲーション挙動。
 * Astro の <script> から呼ぶほか、Vitest からも単体テストできるよう分離する。
 *
 * ドロップダウンの開閉モデル (data-open と aria-expanded を常に同時更新し、
 * 「見た目の開閉」と「支援技術への通知」を一致させる):
 * - マウス: ホバー (pointerenter / pointerleave) で開閉する。
 *   クリックはトグルしない (ホバーが制御) ため、クリック後にポインタが離れれば閉じる。
 * - キーボード: Enter / Space (click は detail===0) でトグル、
 *   フォーカスが項目外へ移ったとき・Escape で閉じる (フォーカスはトリガーへ戻す)。
 * - タッチ: タップ (click) でトグル、メニュー外タップで閉じる。
 */
export function initSiteHeaderNav(scope: ParentNode = document): void {
  const ownerDoc =
    scope instanceof Document
      ? scope
      : ((scope as Element).ownerDocument ?? document)

  // モバイルメニューの開閉
  const toggle = scope.querySelector<HTMLButtonElement>('[data-menu-toggle]')
  const panel = scope.querySelector<HTMLElement>('[data-mobile-nav]')

  toggle?.addEventListener('click', () => {
    if (!panel) return
    const willOpen = panel.hasAttribute('hidden')
    panel.toggleAttribute('hidden', !willOpen)
    toggle.setAttribute('aria-expanded', String(willOpen))
    // 開き直したときは前回のスクロール位置を引き継がず先頭に戻す
    if (willOpen) panel.scrollTop = 0
  })

  // デスクトップドロップダウン (ディスクロージャー)
  scope
    .querySelectorAll<HTMLButtonElement>('[data-dropdown-trigger]')
    .forEach((btn) => {
      const li = btn.closest('li')
      if (!li) return

      // 直近のポインタ種別を記録し、click がマウス由来かタッチ由来かを判別する
      let lastPointerType = ''

      const setOpen = (open: boolean) => {
        btn.setAttribute('aria-expanded', String(open))
        li.toggleAttribute('data-open', open)
      }

      li.addEventListener('pointerdown', (e) => {
        lastPointerType = e.pointerType
      })

      // マウスのホバーで開閉 (タッチの pointerenter/leave は無視)
      li.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') setOpen(true)
      })
      li.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse') setOpen(false)
      })

      btn.addEventListener('click', (e) => {
        // マウスのクリックはホバーが制御するためトグルしない
        // (クリックで data-open が固定され開きっぱなしになるのを防ぐ)。
        // キーボード (detail===0) とタッチのみトグルする。
        const isKeyboard = e.detail === 0
        if (isKeyboard || lastPointerType !== 'mouse') {
          setOpen(btn.getAttribute('aria-expanded') !== 'true')
        }
      })

      // フォーカスが項目の外へ移ったら閉じる (キーボードでの Tab 離脱・外クリック)
      li.addEventListener('focusout', (e) => {
        if (!li.contains(e.relatedTarget as Node | null)) setOpen(false)
      })

      // Escape で閉じ、フォーカスをトリガーへ戻す
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          setOpen(false)
          btn.focus()
        }
      })
    })

  // メニュー外をクリック/タップしたら、開いている他のドロップダウンを閉じる
  // (フォーカスを取得しないタッチ端末でのフォールバック)
  ownerDoc.addEventListener('click', (e) => {
    scope
      .querySelectorAll<HTMLButtonElement>('[data-dropdown-trigger]')
      .forEach((btn) => {
        const li = btn.closest('li')
        if (!li || li.contains(e.target as Node | null)) return
        btn.setAttribute('aria-expanded', 'false')
        li.removeAttribute('data-open')
      })
  })

  // Escape でモバイルパネルを閉じ、フォーカスを開閉ボタンへ戻す
  ownerDoc.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel && !panel.hasAttribute('hidden')) {
      panel.setAttribute('hidden', '')
      toggle?.setAttribute('aria-expanded', 'false')
      toggle?.focus()
    }
  })
}
