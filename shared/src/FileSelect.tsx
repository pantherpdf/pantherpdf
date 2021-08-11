import React, { useRef } from 'react'

interface Props {
	onSelect: (files: File[]) => void,
}

export function extractFiles(dataTransfer: DataTransfer): File[] {
	const fileUpload: File[] = []
	if (dataTransfer.items) {
		for (let i = 0; i < dataTransfer.items.length; i++) {
			if (dataTransfer.items[i].kind === 'file') {
				const file = dataTransfer.items[i].getAsFile()
				if (file) {
					fileUpload.push(file)
				}
			}
		}
	} else {
		for (let i = 0; i < dataTransfer.files.length; i++) {
			const file = dataTransfer.files[i]
			fileUpload.push(file)
		}
	}
	return fileUpload
}

export default function FileSelect(props: Props) {
	const selectFileElement = useRef<HTMLInputElement>(null)

	// drag-drop
	function onDragOver(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault()
		e.stopPropagation()
	}

	function onDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault()
		e.stopPropagation()
		props.onSelect(extractFiles(e.dataTransfer))
	}

	function selectFileElementChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (!e.target.files)
			return
		const arr: File[] = []
		for (let i=0; i<e.target.files.length; ++i) {
			arr.push(e.target.files[i])
		}
		e.target.value = ''
		props.onSelect(arr)
	}

	// click to browse files
	function selectFileClick() {
		if (!selectFileElement.current) {
			return
		}
		selectFileElement.current.click()
	}

	return <>
		<div
			className='mt-4 mb-4 d-flex flex-column p-4' style={{border:'3px dashed rgba(0,50,160,0.2)'}}
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<div className='text-center'>Drop files here</div>
			<div className='text-center mt-2 text-muted'>or</div>
			<div className='text-center mt-2'><button className='btn btn-sm btn-outline-primary' onClick={selectFileClick}>Select files</button></div>
		</div>
		<input type='file' className='d-none' ref={selectFileElement} onChange={selectFileElementChange} />
	</>
}