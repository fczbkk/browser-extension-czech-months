const IS_HANDLED = '__czech_months_is_handled'

// TODO config object
const months = {
  'january': ['leden', 'lednový', 'lednu'],
  'february': ['únor', 'únorový', 'únoru'],
  'march': ['březen'],
  'april': ['duben'],
  'may': ['květen'],
  'june': ['červen'],
  'july': ['červenec'],
  'august': ['srpen'],
  'september': ['září'],
  'october': ['říjen'],
  'november': ['listopad'],
  'december': ['prosinec']
}

const monthMatchers = Object.values(months)
  .map((monthVariants) => `(${ monthVariants.join('|') })`)
  .join('|')

const re = new RegExp(`(^|\\P{L})(${ monthMatchers })($|\\P{L})`, 'ugi')

function translateMonths (content = '') {
  return content.replaceAll(re, function (...args) {
    const {
      1: prefix,
      15: postfix,
      2: original
    } = args
    const matchedMonthId = [...args].slice(3, 15).findIndex(Boolean)
    const translation = Object.keys(months)[matchedMonthId]
    return `${prefix}${original} (${translation})${postfix}`
  })
}

function updateNodes (rootNode = document.body) {
  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        if (re.test(node.nodeValue)) {
          return NodeFilter.FILTER_ACCEPT
        }
      }
    }
  )

  let currentNode = walker.currentNode
  while (currentNode) {
    if (
      !currentNode[IS_HANDLED] &&
      (currentNode.nodeType === Node.TEXT_NODE)
    ) {
      currentNode.nodeValue = translateMonths(currentNode.nodeValue)
      currentNode[IS_HANDLED] = true
    }
    currentNode = walker.nextNode()
  }
}

const observer = new MutationObserver((mutationsList) => {
  for (let mutation of mutationsList) {
    updateNodes(mutation.target)
  }
})

updateNodes(document.body)

observer.observe(document.body, {
  subtree: true,
  childList: true
})
