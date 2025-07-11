import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import DraggableImageComponent from '../../DraggableImageComponent/DraggableImageComponent'

export const DraggableImage = Node.create({
  name: 'draggableImage',
  group: 'block',
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      width: { default: '400px' },
    }
  },

  parseHTML() {
    return [{ tag: 'draggable-image' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DraggableImageComponent)
  },
})
