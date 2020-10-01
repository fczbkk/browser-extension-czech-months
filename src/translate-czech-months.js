const IS_HANDLED = '__czech_months_is_handled'

const months = {
  'january': ['leden', 'ledny',
    'ledna', 'lednů',
    'lednu', 'lednům',
    'leden', 'ledny',
    'ledne', 'ledny',
    'lednu', 'lednech',
    'lednem', 'ledny'],
  'february': ['únor', 'únory',
    'února', 'únorů',
    'únoru', 'únorům',
    'únor', 'únory',
    'únore', 'únory',
    'únoru', 'únorech',
    'únorem', 'únory'],
  'march': ['březen', 'březny',
    'března', 'březnů',
    'březnu', 'březnům',
    'březen', 'březny',
    'březne', 'březny',
    'březnu', 'březnech',
    'březnem', 'březny'],
  'april': ['duben', 'dubny',
    'dubna', 'dubnů',
    'dubnu', 'dubnům',
    'duben', 'dubny',
    'dubne', 'dubny',
    'dubnu', 'dubnech',
    'dubnem', 'dubny'],
  'may': ['květen', 'květny',
    'května', 'květnů',
    'květnu', 'květnům',
    'květen', 'květny',
    'květne', 'květny',
    'květnu', 'květnech',
    'květnem', 'květny'],
  'june': ['červen', 'červny',
    'června', 'červnů',
    'červnu', 'červnům',
    'červen', 'červny',
    'červne', 'červny',
    'červnu', 'červnech',
    'červnem', 'červny'],
  'july': ['červenec', 'července',
    'července', 'červenců',
    'červenci', 'červencům',
    'červenec', 'července',
    'červenci', 'července',
    'červenci', 'červencích',
    'červencem', 'červenci'],
  'august': ['srpen', 'srpny',
    'srpna', 'srpnů',
    'srpnu', 'srpnům',
    'srpen', 'srpny',
    'srpne', 'srpny',
    'srpnu', 'srpnech',
    'srpnem', 'srpny'],
  'september': ['září', 'září',
    'září', 'září',
    'září', 'zářím',
    'září', 'září',
    'září', 'září',
    'září', 'zářích',
    'zářím', 'zářími'],
  'october': ['říjen', 'říjny',
    'října', 'říjnů',
    'říjnu', 'říjnům',
    'říjen', 'říjny',
    'říjne', 'říjny',
    'říjnu', 'říjnech',
    'říjnem', 'říjny'],
  'november': ['listopad', 'listopady',
    'listopadu', 'listopadů',
    'listopadu', 'listopadům',
    'listopad', 'listopady',
    'listopade', 'listopady',
    'listopadu', 'listopadech',
    'listopadem', 'listopady'],
  'december': ['prosinec', 'prosince',
    'prosince', 'prosinců',
    'prosinci', 'prosincům',
    'prosinec', 'prosince',
    'prosinci', 'prosince',
    'prosinci', 'prosincích',
    'prosincem', 'prosinci']
}

const monthMatchers = Object.values(months)
  .map((monthVariants) => `(${monthVariants.join('|')})`)
  .join('|')

const re = new RegExp(`(^|\\P{L})(${ monthMatchers })($|\\P{L})`, 'ugi')

function translateMonths(content = '') {
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

function updateNodes(rootNode = document.body) {
  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
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
