import { useState, useEffect, useRef } from 'react'

export default function useStateDelayed<Type>(valueOriginal: Type, setValueOriginal: (r:Type)=>void,): [Type, (x:Type, debouceMs:number)=>void] {
	const [valueCache, setValueCache] = useState<Type>(valueOriginal)
	const valueRef = useRef<Type>(valueOriginal)
	const [tm, setTm] = useState<number>(0)
	function setValue(x: Type, debounceMs: number) {
		setValueCache(x)
		valueRef.current = x
		if (tm) {
			clearTimeout(tm)
			setTm(0)
		}
		if (debounceMs > 0) {
			const tm2 = window.setTimeout(() => {
				setValueOriginal(valueRef.current)
				setTm(0)
			}, debounceMs)
			setTm(tm2)
		}
		else {
			setValueOriginal(valueRef.current)
		}
	}
	useEffect(() => {
		setTm(tm2 => {
			if (tm2 > 0) {
				clearTimeout(tm2)
			}
			return 0
		})
		setValueCache(valueOriginal)
		valueRef.current = valueOriginal
	}, [valueOriginal])
	return [valueCache, setValue]
}
