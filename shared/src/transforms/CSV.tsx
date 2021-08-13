/**
 * CSV.tsx
 * Prepare 2D array - table for csv output
 */


import React from 'react'
import { TTransformData } from '../types'
import { TTransformWidget } from '../editor/types'
import { IHelpers } from '../formula/types'
import FormulaEvaluate from '../formula/formula'
import InputApplyOnEnter from '../widgets/InputApplyOnEnter'
import Trans from '../translation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'


interface CSVRow {
	source: string,
	cols: string[],
}
export interface CSVData extends TTransformData {
	type: 'CSV',
	rows: CSVRow[],
}

const CSV: TTransformWidget = {
	name: 'CSV',

	newItem: async () => {
		const obj: CSVData = {
			type: 'CSV',
			comment: '',
			rows: [{
				source: '',
				cols: [ '', '', '' ]
			}],
		}
		return obj
	},
	
	transform: async (dt, item2: TTransformData) => {
		const item = item2 as CSVData
		const arr: any[][] = []
		const helper: IHelpers & {vars: {}} = {
			vars: {
				'data': dt,
			}
		}
		for (const rowDef of item.rows) {
			if (rowDef.source.length > 0) {
				// append zero or more rows, based on source
				const rowSource = await FormulaEvaluate(rowDef.source, helper)
				if (!Array.isArray(rowSource)) {
					throw new Error(`transform Filter: source of row should be array but got: ${typeof rowSource}, for source: ${rowDef.source}.`)
				}
				for (const rowItem of rowSource) {
					const row: any[] = []
					helper.vars.item = rowItem
					for (const cellFormula of rowDef.cols) {
						const cell = await FormulaEvaluate(cellFormula, helper)
						row.push(cell)
					}
					delete helper.vars.item
					arr.push(row)
				}
			}
			else {
				// append one row
				const row: any[] = []
				for (const cellFormula of rowDef.cols) {
					const cell = await FormulaEvaluate(cellFormula, helper)
					row.push(cell)
				}
				arr.push(row)
			}
		}
		return arr
	},
	
	Editor: function(props) {
		const item = props.item as CSVData
		return <>
			<table className='table table-sm'>
				<tbody>
					<tr>
						<td className='table-info'>
							{Trans('source data')}
						</td>
						{item.rows[0].cols.map((_, colIdx) => <td key={colIdx}>
							<button
								className='btn btn-sm btn-outline-secondary'
								onClick={() => removeCol(item, props.setItem, colIdx)}
								title={Trans('remove')}
								disabled={item.rows[0].cols.length <= 1}
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</td>)}
						<td></td>
					</tr>
					{item.rows.map((row, rowIdx) => <tr key={rowIdx}>
						<td className='table-info'>
							<InputApplyOnEnter
								value={row.source}
								onChange={val => updateSource(item, props.setItem, rowIdx, String(val))}
								placeholder='ƒ'
							/>
						</td>
						{row.cols.map((col, colIdx) => <td key={colIdx}>
							<InputApplyOnEnter
								value={col}
								onChange={val => updateCell(item, props.setItem, rowIdx, colIdx, String(val))}
								placeholder='ƒ'
							/>
						</td>)}
						<td>
							<button
								className='btn btn-sm btn-outline-secondary'
								onClick={() => removeRow(item, props.setItem, rowIdx)}
								title={Trans('remove')}
								disabled={item.rows.length <= 1}
							>
								<FontAwesomeIcon icon={faTimes} />
							</button>
						</td>
					</tr>)}
				</tbody>
			</table>

			<small className='d-block text-muted'>
				{Trans('current item is in var -name-', ['item'])}
			</small>

			<div className="btn-group mt-3" role="group">
				<button
					className='btn btn-outline-primary'
					onClick={() => addRow(item, props.setItem)}
				>
					<FontAwesomeIcon icon={faPlus} className='me-2' />
					{Trans('add row')}
				</button>
				<button
					className='btn btn-outline-primary'
					onClick={() => addCol(item, props.setItem)}
				>
					<FontAwesomeIcon icon={faPlus} className='me-2' />
					{Trans('add col')}
				</button>
			</div>
		</>
	},
}


function removeCol(item: CSVData, setItem: (itm: CSVData)=>void, colIdx: number): void {
	if (item.rows.length === 0) {
		return
	}
	if (item.rows[0].cols.length <= 1) {
		return
	}
	const item2: CSVData = {...item}
	item2.rows = item2.rows.map(x => ({...x}))
	for (const row of item2.rows) {
		row.cols = [...row.cols]
		row.cols.splice(colIdx, 1)
	}
	setItem(item2)
}


function addCol(item: CSVData, setItem: (itm: CSVData)=>void): void {
	const item2: CSVData = {...item}
	item2.rows = item2.rows.map(x => ({...x}))
	for (const row of item2.rows) {
		row.cols = [...row.cols, '']
	}
	setItem(item2)
}


function removeRow(item: CSVData, setItem: (itm: CSVData)=>void, rowIdx: number): void {
	if (item.rows.length <= 1) {
		return
	}
	const item2: CSVData = {...item}
	item2.rows = [...item2.rows]
	item2.rows.splice(rowIdx, 1)
	setItem(item2)
}


function addRow(item: CSVData, setItem: (itm: CSVData)=>void): void {
	const item2: CSVData = {...item}
	const row: CSVRow = {
		source: '',
		cols: item2.rows[0].cols.map((_) => ''),
	}
	item2.rows = [...item2.rows, row]
	setItem(item2)
}


function updateCell(item: CSVData, setItem: (itm: CSVData)=>void, rowIdx: number, colIdx: number, val: string): void {
	const item2: CSVData = {...item}
	item2.rows = [...item2.rows]
	item2.rows[rowIdx] = {...item2.rows[rowIdx]}
	item2.rows[rowIdx].cols = [...item2.rows[rowIdx].cols]
	item2.rows[rowIdx].cols[colIdx] = val
	setItem(item2)
}


function updateSource(item: CSVData, setItem: (itm: CSVData)=>void, rowIdx: number, val: string): void {
	const item2: CSVData = {...item}
	item2.rows = [...item2.rows]
	item2.rows[rowIdx] = {...item2.rows[rowIdx]}
	item2.rows[rowIdx].source = val
	setItem(item2)
}


export { CSV }
