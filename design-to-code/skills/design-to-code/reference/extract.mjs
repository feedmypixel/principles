export const extractSpec = (page, elements, scopeSelector) =>
  page.evaluate(
    ({ elements, scopeSelector }) => {
      const scope = scopeSelector ? document.querySelector(scopeSelector) : document
      if (!scope) {
        return Object.fromEntries(
          Object.keys(elements).map((name) => [name, { exists: false, count: 0, scopeMissing: true }])
        )
      }

      const numberOr = (value) => {
        const number = Number.parseFloat(value)
        return Number.isFinite(number) ? Math.round(number * 100) / 100 : value
      }

      // color-mix() computes to color(srgb …); the mock's literals compute to rgb().
      const rgbOf = (value) => {
        if (!value.startsWith('color(srgb ') || !value.endsWith(')')) {
          return value
        }
        const [channels, alpha] = value.slice('color(srgb '.length, -1).split(' / ')
        const [red, green, blue] = channels
          .split(' ')
          .map((channel) => Math.round(Number(channel) * 255))
        return alpha === undefined
          ? `rgb(${red}, ${green}, ${blue})`
          : `rgba(${red}, ${green}, ${blue}, ${Math.round(Number(alpha) * 100) / 100})`
      }

      const ancestorScale = (el) => {
        let scale = 1
        for (let node = el; node; node = node.parentElement) {
          const transform = getComputedStyle(node).transform
          const match = /^matrix\(([^,]+),/.exec(transform)
          if (match) {
            scale *= Number.parseFloat(match[1])
          }
        }
        return scale
      }

      // A placeholder carries the field's type and colour; its box is the element's.
      const styleOf = (el, pseudo) => {
        const computed = getComputedStyle(el, pseudo)
        const elementStyle = getComputedStyle(el)
        const scale = ancestorScale(el)
        const domRect = el.getBoundingClientRect()
        const rect = { width: domRect.width / scale, height: domRect.height / scale }
        return {
          type: {
            fontSize: numberOr(computed.fontSize),
            fontWeight: numberOr(computed.fontWeight),
            lineHeight: numberOr(computed.lineHeight),
            letterSpacing: numberOr(computed.letterSpacing),
            textTransform: computed.textTransform
          },
          colour: {
            color: rgbOf(computed.color),
            backgroundColor: rgbOf(elementStyle.backgroundColor),
            borderColor: rgbOf(elementStyle.borderColor)
          },
          box: {
            paddingTop: numberOr(elementStyle.paddingTop),
            paddingRight: numberOr(elementStyle.paddingRight),
            paddingBottom: numberOr(elementStyle.paddingBottom),
            paddingLeft: numberOr(elementStyle.paddingLeft),
            gap: numberOr(elementStyle.gap),
            width: numberOr(rect.width),
            height: numberOr(rect.height),
            borderRadius: numberOr(elementStyle.borderRadius),
            borderWidth: numberOr(elementStyle.borderWidth)
          },
          layout: {
            display: elementStyle.display,
            flexDirection: elementStyle.flexDirection,
            alignItems: elementStyle.alignItems,
            justifyContent: elementStyle.justifyContent
          }
        }
      }

      const isField = (el) => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'

      const showsPlaceholder = (el) => isField(el) && Boolean(el.placeholder) && el.value === ''

      const isUnseen = (el) => {
        const style = getComputedStyle(el)
        return style.clipPath === 'inset(50%)' || style.display === 'none'
      }

      const visibleTextOf = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent
        }
        if (node.nodeType !== Node.ELEMENT_NODE || isUnseen(node)) {
          return ''
        }
        if (isField(node)) {
          return ['checkbox', 'radio'].includes(node.type) ? '' : node.value || (node.placeholder ?? '')
        }
        // A mock writes its flex items side by side where a build spaces them; inline text runs on.
        const breaksWords = (child) =>
          child.nodeType === Node.ELEMENT_NODE && getComputedStyle(child).display !== 'inline'
        return Array.from(node.childNodes)
          .map((child) => (breaksWords(child) ? ` ${visibleTextOf(child)} ` : visibleTextOf(child)))
          .join('')
      }

      const textOf = (el) => {
        if (isField(el)) {
          return el.value || (el.placeholder ?? '')
        }
        return visibleTextOf(el).trim().replace(/\s+/g, ' ')
      }

      const edgesFrom = (el, originSelector) => {
        const origin = originSelector && scope.querySelector(originSelector)
        if (!origin) {
          return originSelector ? { origin: 'missing' } : undefined
        }
        const box = el.getBoundingClientRect()
        const originBox = origin.getBoundingClientRect()
        return {
          left: numberOr(String(box.left - originBox.left)),
          right: numberOr(String(originBox.right - box.right)),
          top: numberOr(String(box.top - originBox.top)),
          bottom: numberOr(String(originBox.bottom - box.bottom))
        }
      }

      const result = {}
      for (const [name, { selector, origin }] of Object.entries(elements)) {
        const matches = Array.from(scope.querySelectorAll(selector))
        if (matches.length === 0) {
          result[name] = { exists: false, count: 0 }
          continue
        }
        const el = matches[0]
        const pseudo = showsPlaceholder(el) ? '::placeholder' : undefined
        result[name] = {
          exists: true,
          count: matches.length,
          tag: el.tagName.toLowerCase(),
          text: textOf(el),
          childTags: Array.from(el.children)
            .filter((child) => !isUnseen(child))
            .map((child) => child.tagName.toLowerCase()),
          ...styleOf(el, pseudo),
          edge: edgesFrom(el, origin)
        }
      }
      return result
    },
    { elements, scopeSelector }
  )
