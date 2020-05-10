import { Element, Node } from 'slate'
import { Options } from '..'

/**
 * True if the node is a list item
 */
export const isItem = ({ typeItem }: Options) => (node: Node): boolean =>
  Element.isElement(node) && typeItem === node.type
