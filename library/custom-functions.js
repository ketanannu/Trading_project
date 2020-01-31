module.exports = {
	click: async function(page, selector) {
		try {
			await page.waitForSelector(selector)
			await page.click(selector)
		} catch (error) {
			throw new Error(`Could not click on selector: ${selector}`)
		}
	},

	clickIfNotSelectedByDefault: async function(page, selector1, selector2) {
		try {
			await shouldNotExist(page, selector1)
		} catch (error) {
			return
		}
		try {
			await page.waitForSelector(selector2)
			await page.click(selector2)
		} catch (error) {
			throw new Error(`Could not click on selector: ${selector2}`)
		}
		try {
			await page.waitForSelector(selector1)
		} catch (error) {
			throw new Error(`Could not find selector: ${selector1}`)
		}
	},

	clickViaIterationOverText: async function(page, selector, text) {
		try {
			await page.waitForSelector(selector)
			let handles = await page.$$(selector)
			for (let handle of handles) {
				let str = await page.evaluate(el => el.innerText, handle)
				if (str == text) {
					await handle.click()
					return
				}
			}
			throw new Error(`Could not find selector: ${selector} with text ${text}`)
		} catch (error) {
			throw new Error(
				`Could not click on selector: ${selector} with text ${text}`
			)
		}
	},

	waitForSynchronizationToComplete: async function(page, waitTime) {
		await page.waitFor(waitTime)
	},

	typeText: async function(page, text, selector) {
		try {
			await page.waitForSelector(selector)
			await page.type(selector, text)
		} catch (error) {
			throw new Error(`Could not type text into selector: ${selector}`)
		}
	},

	loadUrl: async function(page, url) {
		await page.goto(url, { waitUntil: 'networkidle0' })
	},

	getText: async function(page, selector) {
		try {
			await page.waitForSelector(selector)
			return page.$eval(selector, e => e.innerHTML)
		} catch (error) {
			throw new Error(`Cannot get text from selector: ${selector}`)
		}
	},

	getAttribute: async function(page, selector, attribute) {
		try {
			await page.waitForSelector(selector)
			return await page.evaluate(
				'document.querySelector("' +
					selector +
					'").getAttribute("' +
					attribute +
					'")'
			)
		} catch (error) {
			throw new Error(
				`Cannot get attribute ${attribute} from selector: ${selector}`
			)
		}
	},

	getCount: async function(page, selector) {
		try {
			await page.waitForSelector(selector)
			return page.$$eval(selector, items => items.length)
		} catch (error) {
			throw new Error(`Cannot get count of selector: ${selector}`)
		}
	},

	waitForText: async function(page, selector, text) {
		try {
			await page.waitForSelector(selector)
			await page.waitForFunction(
				(selector, text) =>
					document.querySelector(selector).innerText.includes(text),
				{},
				selector,
				text
			)
		} catch (error) {
			throw new Error(`Text: ${text} not found for selector ${selector}`)
		}
	},

	pressKey: async function(page, key) {
		try {
			await page.keyboard.press(key)
		} catch (error) {
			throw new Error(`Could not press key: ${key} on the keyboard`)
		}
	},

	shouldExist: async function(page, selector) {
		try {
			await page.waitForSelector(selector)
		} catch (error) {
			throw new Error(`Selector: ${selector} not exist`)
		}

		try {
			await page.waitForSelector(selector, { visible: true })
		} catch (error) {
			throw new Error(`Selector: ${selector} exist but not visible`)
		}
	},

	shouldNotVisible: async function(page, selector) {
		try {
			await page.waitForSelector(selector)
		} catch (error) {
			throw new Error(`Selector: ${selector} not exist`)
		}

		try {
			await page.waitForSelector(selector, { visible: false })
		} catch (error) {
			throw new Error(`Selector: ${selector} exist but visible`)
		}
	},

	shouldNotExist: async function(page, selector) {
		try {
			await page.waitFor(() => !document.querySelector(selector))
		} catch (error) {
			throw new Error(`Selector: ${selector} exist`)
		}
	},
}
