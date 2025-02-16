import { useState, useEffect } from 'react'
import type * as React from 'react'
import detectIncognito, {
	type IncognitoDetectionResult,
} from '../utils/detect-incognito'

export function BlockIncognito({ children }: { children: React.ReactNode }) {
	const [incognitoResult, setIncognitoResult] =
		useState<IncognitoDetectionResult>()
	useEffect(() => {
		;(async () => {
			const result = await detectIncognito()
			setIncognitoResult(result)
		})()
	}, [])
	return (
		<>
			BlockIncognito start
			<hr />
			{incognitoResult ? (
				!incognitoResult.isPrivate ? (
					children
				) : (
					<>private</>
				)
			) : (
				<>loading</>
			)}
			<hr />
			BlockIncognito end
		</>
	)
}
