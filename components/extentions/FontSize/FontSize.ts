import { Mark, mergeAttributes, RawCommands } from '@tiptap/core'

export const FontSize = Mark.create({
	name: 'fontSize',

	addOptions() {
		return {
			types: ['textStyle'],
		}
	},

	addAttributes() {
		return {
			size: {
				default: null,
				parseHTML: element => element.style.fontSize || null,
				renderHTML: attributes => {
					if (!attributes.size) return {}
					return { style: `font-size: ${attributes.size}` }
				},
			},
		}
	},

	parseHTML() {
		return [{ style: 'font-size' }]
	},

	renderHTML({ HTMLAttributes }) {
		return ['span', mergeAttributes(HTMLAttributes), 0]
	},

	addCommands() {
		return {
			setFontSize:
				(size: string) => ({ chain }: { chain: any }) => {
					return chain().setMark(this.name, { size }).run()
				},
			unsetFontSize:
				() => ({ chain }: { chain: any }) => {
					return chain().unsetMark(this.name).run()
				},
		} as Partial<RawCommands>;
	},
})
