'use client'

import React from 'react'
import { Editor } from '@tiptap/react'

interface FontSizeSelectorProps {
	editor: Editor
}

export default function FontSizeSelector({
	editor,
}: FontSizeSelectorProps) {
	const fontSizes = [
		{ label: '12px', value: '12px' },
		{ label: '14px', value: '14px' },
		{ label: '16px', value: '16px' },
		{ label: '18px', value: '18px' },
		{ label: '24px', value: '24px' },
		{ label: '32px', value: '32px' },
	]

	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const size = e.target.value
		if (!size) return
		editor.chain().focus().setFontSize(size).run()
	}

	return (
		<select
			className="border p-1 rounded text-sm"
			onChange={handleChange}
			defaultValue=""
		>
			<option value="" disabled hidden>
				Font size
			</option>
			{fontSizes.map(({ label, value }) => (
				<option key={value} value={value}>
					{label}
				</option>
			))}
		</select>
	)
}
