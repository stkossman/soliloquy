import { useCallback, useEffect, useState } from 'react'

export interface UseZoomControlResult {
	zoomLevel: number
	setZoomLevel: (level: number) => void
}

const STORAGE_KEY = 'soliloquy-zoom-level'

export function useZoomControl(): UseZoomControlResult {
	const [zoomLevel, setZoomLevel] = useState(1)

	useEffect(() => {
		const savedZoom = localStorage.getItem(STORAGE_KEY)
		if (savedZoom) setZoomLevel(parseFloat(savedZoom))
	}, [])

	const handleSetZoom = useCallback((level: number) => {
		setZoomLevel(level)
		localStorage.setItem(STORAGE_KEY, level.toString())
	}, [])

	return { zoomLevel, setZoomLevel: handleSetZoom }
}
