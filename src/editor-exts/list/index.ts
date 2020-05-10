import { Editor, Element, Node, Transforms } from 'slate'
import { onEnter, onTab, onBackspace } from './handlers'
import {
  childOfListIsAlwaysItem,
  itemChildrenAreAlwaysElements,
  itemsWithoutParentListAreUnwrapped,
  joinAdjacentLists,
  unwrapListsOverDepthLimit,
} from './normalizers'
import {
  decreaseItemDepth,
  increaseItemDepth,
  splitListItem,
  toggleList,
  unwrapList,
  wrapInList,
} from './commands'
import {
  getCurrentItem,
  getCurrentList,
  getDeepestItemDepth,
  getItemDepth,
  getListForItem,
  getItemsAtRange,
  getTopmostItemsAtRange,
  getPreviousItem,
  isItem,
  isList,
  isSelectionInList,
} from './utils'

export type Options = {
  types: string[]
  typeItem: string
  typeDefault: string
  canMerge: (listA: Node, listB: Node) => boolean
  maxDepth: number
}

const KEY_ENTER = 'Enter'
const KEY_TAB = 'Tab'
const KEY_BACKSPACE = 'Backspace'

const applyNormalization = (options: Options, editor: Editor): void => {
  childOfListIsAlwaysItem(options, editor)
  itemChildrenAreAlwaysElements(options, editor)
  itemsWithoutParentListAreUnwrapped(options, editor)
  joinAdjacentLists(options, editor)
  unwrapListsOverDepthLimit(options, editor)
}

/**
 * User is pressing a key in the editor
 */
const onKeyDown = (options: Options, event, editor): void => {
  switch (event.key) {
    case KEY_ENTER:
      onEnter(options, event, editor)
      break
    case KEY_TAB:
      onTab(options, event, editor)
      break
    case KEY_BACKSPACE:
      onBackspace(options, event, editor)
      break
    default:
      break
  }
}

const getOnKeyDown = (options: Options) => (editor: Editor) => (event) => {
  onKeyDown(options, event, editor)
}

const getTransforms = (options: Options) => ({
  decreaseItemDepth: decreaseItemDepth(options),
  increaseItemDepth: increaseItemDepth(options),
  splitListItem: splitListItem(options),
  toggleList: toggleList(options),
  unwrapList: unwrapList(options),
  wrapInList: wrapInList(options),
})

const getEditorUtils = (options: Options) => ({
  getCurrentItem: getCurrentItem(options),
  getCurrentList: getCurrentList(options),
  getDeepestItemDepth: getDeepestItemDepth(options),
  getItemDepth: getItemDepth(options),
  getTopmostItemsAtRange: getTopmostItemsAtRange(options),
  getItemsAtRange: getItemsAtRange(options),
  getListForItem: getListForItem(options),
  getPreviousItem: getPreviousItem(options),
  isSelectionInList: isSelectionInList(options),
})

const getElementUtils = (options: Options) => ({
  isItem: isItem(options),
  isList: isList(options),
})

const withEditList = (options: Options) => (editor) => {
  applyNormalization(options, editor)

  return editor
}

/**
 * A Slate plugin to handle keyboard events in lists.
 */
export const EditListPlugin = (customOptions?: Partial<Options>) => {
  const options = {
    maxDepth: 6,
    types: ['ul_list', 'ol_list'],
    typeItem: 'list_item',
    typeDefault: 'paragraph',
    canMerge: (a: Node, b: Node) => a.type === b.type,
    ...customOptions,
  }

  const EnhancedEditor = {
    ...Editor,
    ...getEditorUtils(options),
  }
  const EnhancedElement = {
    ...Element,
    ...getElementUtils(options),
  }
  const EnhancedTransforms = {
    ...Transforms,
    ...getTransforms(options),
  }

  return [
    withEditList(options),
    getOnKeyDown(options),
    {
      Editor: EnhancedEditor,
      Element: EnhancedElement,
      Transforms: EnhancedTransforms,
    },
  ] as const
}
