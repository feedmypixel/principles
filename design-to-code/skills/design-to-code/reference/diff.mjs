const SPACING_TOLERANCE_PX = 2
const SIZE_TOLERANCE_RATIO = 0.08

const fmt = (value) => (typeof value === 'number' ? `${value}px` : String(value))

const withinSpacing = (a, b) =>
  typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= SPACING_TOLERANCE_PX

const withinSize = (a, b) =>
  typeof a === 'number' &&
  typeof b === 'number' &&
  Math.abs(a - b) <= Math.max(a, b) * SIZE_TOLERANCE_RATIO

const compareGroup = (name, group, mock, built, defects, skip, tolerant) => {
  for (const key of Object.keys(mock)) {
    const mockValue = mock[key]
    const builtValue = built[key]
    if (mockValue === builtValue || skip(`${group}.${key}`)) {
      continue
    }
    if (tolerant?.(key, mockValue, builtValue)) {
      continue
    }
    defects.push(`${name}\t${group}.${key}\tmock ${fmt(mockValue)}\tbuilt ${fmt(builtValue)}`)
  }
}

const wordsOf = (text) => text?.replace(/\s+/g, ' ').trim()

const sameWords = (a, b) => wordsOf(a) === wordsOf(b)

const edgeState = (edge) => ('origin' in edge ? 'origin missing' : 'measured')

export const diffSpecs = (mockSpecs, builtSpecs, elements) => {
  const defects = []
  const waived = []

  for (const [name, config] of Object.entries(elements)) {
    const mock = mockSpecs[name]
    const built = builtSpecs[name]

    if (config.waiver) {
      waived.push(`${name}\twaived\t${config.waiver}`)
      continue
    }

    const ignored = new Set(Object.keys(config.ignore ?? {}))
    const skip = (property) => {
      if (!ignored.has(property)) {
        return false
      }
      waived.push(`${name}\t${property}\t${config.ignore[property]}`)
      return true
    }

    if (mock.exists !== built.exists) {
      defects.push(
        `${name}\texistence\tmock ${mock.exists ? 'present' : 'missing'}\tbuilt ${built.exists ? 'present' : 'missing'}`
      )
      continue
    }
    if (!mock.exists) {
      continue
    }

    if (mock.count !== built.count && !skip('count')) {
      defects.push(`${name}\tcount\tmock ${mock.count}\tbuilt ${built.count}`)
    }
    if (mock.tag !== built.tag && !skip('tag')) {
      defects.push(`${name}\ttag\tmock ${mock.tag}\tbuilt ${built.tag}`)
    }
    if (!sameWords(mock.text, built.text) && !skip('text')) {
      defects.push(`${name}\ttext\tmock "${mock.text}"\tbuilt "${built.text}"`)
    }
    if (JSON.stringify(mock.childTags) !== JSON.stringify(built.childTags) && !skip('children')) {
      defects.push(
        `${name}\tchildren\tmock [${mock.childTags.join(', ')}]\tbuilt [${built.childTags.join(', ')}]`
      )
    }

    compareGroup(name, 'type', mock.type, built.type, defects, skip)
    compareGroup(name, 'colour', mock.colour, built.colour, defects, skip)
    compareGroup(name, 'layout', mock.layout, built.layout, defects, skip)
    const exact = new Set(config.exact ?? [])
    compareGroup(name, 'box', mock.box, built.box, defects, skip, (key, a, b) => {
      if (exact.has(`box.${key}`)) {
        return false
      }
      if (key === 'width' || key === 'height') {
        return withinSize(a, b)
      }
      return withinSpacing(a, b)
    })
    if (mock.edge || built.edge) {
      const mockEdge = mock.edge ?? { origin: 'missing' }
      const builtEdge = built.edge ?? { origin: 'missing' }
      if ('origin' in mockEdge || 'origin' in builtEdge) {
        if (!skip('edge.origin')) {
          defects.push(
            `${name}\tedge.origin\tmock ${edgeState(mockEdge)}\tbuilt ${edgeState(builtEdge)}`
          )
        }
        continue
      }
      const keys = [...new Set([...Object.keys(mockEdge), ...Object.keys(builtEdge)])]
      const unionOf = (edge) => Object.fromEntries(keys.map((key) => [key, edge[key]]))
      compareGroup(name, 'edge', unionOf(mockEdge), unionOf(builtEdge), defects, skip, (key, a, b) =>
        exact.has(`edge.${key}`) ? false : withinSpacing(a, b)
      )
    }
  }

  return { defects, waived }
}
