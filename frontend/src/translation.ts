export function TransName(name: string|{[key:string]:string}): string {
	if (typeof name == 'string')
		return name
	const keys = Object.keys(name)
	if (keys.length > 0)
		return name[keys[0]]
	return ''
}


export default function Trans(name: string, params?: any[]): string {
	return name
}
