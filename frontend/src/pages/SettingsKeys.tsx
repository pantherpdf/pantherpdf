import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../context'
import { IKeyPublicShort, KeyAddRequest, KeysResponse, KeyAddResponse, KeyRemoveRequest, KeyRemoveResponse } from 'reports-shared'
import { faPlus, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons'

type IKeyPublicShortWithKey = IKeyPublicShort & {key?: string}

export default function SettingsKeys() {
	const app = useContext(AppContext)
	const [keys, setKeys] = useState<IKeyPublicShortWithKey[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	// load keys
	useEffect(() => {
		(async function() {
			const r = await fetch('/.netlify/functions/keys', {headers: {Authorization: `Bearer sid:${app.sid}`}})
			const js = await r.json() as KeysResponse
			if (!r.ok || 'msg' in js) {
				console.log(js)
				const msg = 'msg' in js ? js.msg : 'unknown error'
				throw new Error(msg)
			}
			setKeys(js)
			setLoading(false)
		})()
	}, [app.sid])

	async function addNewKey() {
		const name = prompt('Key name: ', 'key')
		if (!name)
			return
		const rq: KeyAddRequest = { name }
		const r = await fetch('/.netlify/functions/keysAdd', {method:'POST', headers:{Authorization: `Bearer sid:${app.sid}`, 'Content-Type':'application/json'}, body: JSON.stringify(rq)})
		const js = await r.json() as KeyAddResponse
		if (!r.ok || 'msg' in js) {
			console.log(js)
			const msg = 'msg' in js ? js.msg : 'unknown error'
			alert(`Error: ${msg}`)
			return
		}
		setKeys([...keys, js])
	}

	async function deleteKey(name: string) {
		if (!window.confirm(`Are you sure to delete ${name}?`))
			return
		const rq: KeyRemoveRequest = { name }
		const r = await fetch('/.netlify/functions/keysRemove', {method:'POST', headers:{Authorization: `Bearer sid:${app.sid}`, 'Content-Type':'application/json'}, body: JSON.stringify(rq)})
		const js = await r.json() as KeyRemoveResponse
		if (!r.ok || 'msg' in js) {
			console.log(js)
			const msg = 'msg' in js ? js.msg : 'unknown error'
			alert(`Error: ${msg}`)
			return
		}
		setKeys(keys.filter(k => k.name !== name))
	}

	return <>
		<h2>API Keys</h2>
		{loading ? <>
			<FontAwesomeIcon icon={faSpinner} spin={true} className='ms-2' /> 
		</>: <>
			<table className='table'>
				<thead>
					<tr>
						<th>Name</th>
						<th style={{width:'220px'}}>Time</th>
						<th style={{width:'50px'}}>&nbsp;</th>
					</tr>
				</thead>
				<tbody>
					{keys.map(k => <tr key={k.name}>
						<td>
							<strong className='d-block'>{k.name}</strong>
							{'key' in k && <div className='alert alert-success' role='alert'>
								<strong className='d-block'>Secret key:</strong>
								{k.key}
							</div>}
						</td>
						<td><small>{k.time}</small></td>
						<td>
							<button className='btn btn-outline-danger btn-sm' onClick={() => deleteKey(k.name)}>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</td>
					</tr>)}
				</tbody>
			</table>
			{keys.length === 0 && <p>No keys in database.</p>}
			<button
				className='btn btn-primary'
				onClick={addNewKey}
			>
				<FontAwesomeIcon icon={faPlus} className='me-2' />
				Add new key
			</button>
		</>}
	</>
}
