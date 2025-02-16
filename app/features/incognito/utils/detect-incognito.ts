/*!
 * https://github.com/Joe12387/detectIncognito
 * MIT License - Copyright (c) 2021 - 2024 Joe Rutkowski <Joe@dreggle.com>
 **/

export interface IncognitoDetectionResult {
	isPrivate: boolean
	browserName: string
}

export async function detectIncognito(): Promise<IncognitoDetectionResult> {
	let browserName = 'Unknown'
	const identifyChromium = (): string => {
		const ua = navigator.userAgent
		if (/Chrome/.test(ua)) {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			if ((navigator as any).brave !== undefined) return 'Brave'
			if (/Edg/.test(ua)) return 'Edge'
			if (/OPR/.test(ua)) return 'Opera'
			return 'Chrome'
		}
		return 'Chromium'
	}
	const feid = (): number => {
		let id = 0
		try {
			;(-1).toFixed(-1)
		} catch (e) {
			id = (e as Error).message.length
		}
		return id
	}
	const isSafari = (): boolean => feid() === 44
	const isChrome = (): boolean => feid() === 51
	const safariTest = async (): Promise<boolean> =>
		new Promise((resolve) => {
			const tmp = String(Math.random())
			try {
				const req = window.indexedDB.open(tmp, 1)
				req.onupgradeneeded = (event) => {
					const db = (event.target as IDBOpenDBRequest).result
					try {
						const store = db.createObjectStore('test', { autoIncrement: true })
						store.put(new Blob())
						resolve(false)
					} catch (e) {
						resolve(
							e instanceof Error &&
								e.message.includes('BlobURLs are not yet supported')
						)
					} finally {
						db.close()
						window.indexedDB.deleteDatabase(tmp)
					}
				}
			} catch {
				resolve(false)
			}
		})
	const safariPrivateTest = async (): Promise<boolean> => safariTest()
	const getQuotaLimit = (): number =>
		window.performance &&
		// @ts-ignore
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(window.performance.memory as any)?.jsHeapSizeLimit !== undefined
			? // @ts-ignore
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				(window.performance.memory as any).jsHeapSizeLimit
			: 1073741824
	const storageQuotaChromePrivateTest = async (): Promise<boolean> =>
		new Promise((resolve, reject) => {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			;(navigator as any).webkitTemporaryStorage.queryUsageAndQuota(
				(_used: number, quota: number) => {
					const quotaInMib = Math.round(quota / (1024 * 1024))
					const limit = Math.round(getQuotaLimit() / (1024 * 1024)) * 2
					resolve(quotaInMib < limit)
				},
				(e: Error) =>
					reject(new Error(`detectIncognito failed: ${e.message}`))
			)
		})
	const chromePrivateTest = async (): Promise<boolean> =>
		storageQuotaChromePrivateTest()
	if (isSafari()) {
		browserName = 'Safari'
		return { isPrivate: await safariPrivateTest(), browserName }
	}
	if (isChrome()) {
		browserName = identifyChromium()
		return { isPrivate: await chromePrivateTest(), browserName }
	}
	throw new Error('detectIncognito cannot determine the browser')
}

export default detectIncognito
