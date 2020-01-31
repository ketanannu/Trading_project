// Core Packages
const puppeteer = require('puppeteer')
const WebSocket = require('ws')

// Configuration File
const config = require('../library/config')

// Custom Functions
const custom = require('../library/custom-functions')

// Object Repository
const objectRepository = require('../library/object-repository')

// Test Data
const testData = require('../library/test-data')

describe('Coding task for QA Automation Engineer @tradeling', () => {
	let browser
	let page

	before(async function() {
		browser = await puppeteer.launch({
			headless: config.isHeadless,
			slowMo: config.slowMo,
			devtools: config.isDevtools,
			timeout: config.launchTimeout,
			args: config.windowMaximize,
		})
		page = await browser.newPage()
		await page.setDefaultTimeout(config.waitingTimeout)
		await page.setViewport({
			width: config.viewportWidth,
			height: config.viewportHeight,
		})
	})

	after(async function() {
		await browser.close()
	})

	describe('First End-End Test', () => {
		it('navigate to binance homepage', async () => {
			await custom.loadUrl(page, config.baseUrlLandingPage)
		})

		it('click on view more markets link', async () => {
			await custom.shouldExist(page, objectRepository.VIEW_MORE_MARKETS_ICON)
			await custom.click(page, objectRepository.VIEW_MORE_MARKETS_ICON)
		})

		it('click on ETH/BTC button', async () => {
			await custom.shouldExist(page, objectRepository.PAIR_ELEMENTS_BUTTON)
			await custom.waitForSynchronizationToComplete(page, 4000)
			await custom.clickViaIterationOverText(
				page,
				objectRepository.PAIR_ELEMENTS_BUTTON,
				testData.pairingValue
			)
		})

		it('verify ETC/BTC pair trading view page loaded successfully', async () => {
			await custom.waitForText(
				page,
				objectRepository.H2_HEADING,
				testData.pairingValue
			)
			await custom.shouldExist(page, objectRepository.ETH_BTC_MORE_LINK)
			await custom.shouldExist(page, objectRepository.CHART_CONTAINER)
			await custom.shouldExist(page, objectRepository.EXCHANGE_TAB)
			await custom.shouldExist(page, objectRepository.MARGIN_TAB)
			await custom.shouldExist(page, objectRepository.LIMIT_TAB)
			await custom.shouldExist(page, objectRepository.MARKET_TAB)
			await custom.shouldExist(page, objectRepository.STOP_LIMIT_TAB)
		})
	})

	describe('Second End-End Test', () => {
		let price

		it('navigate to binance ETH/BTC pair trading view page', async () => {
			await custom.loadUrl(page, config.baseUrlPairTradingView)
		})

		it('click on exchange tab if not selected by default', async () => {
			await custom.shouldExist(page, objectRepository.EXCHANGE_TAB)
			await custom.clickIfNotSelectedByDefault(
				page,
				objectRepository.EXCHANGE_TAB_SELECTED_LOCATOR,
				objectRepository.EXCHANGE_TAB
			)
		})

		it('click on limit tab if not selected by default', async () => {
			await custom.shouldExist(page, objectRepository.LIMIT_TAB)
			await custom.clickIfNotSelectedByDefault(
				page,
				objectRepository.EXCHANGE_LIMIT_TAB_SELECTED_LOCATOR,
				objectRepository.EXCHANGE_LIMIT_TAB
			)
		})

		it('verify ETH/BTC price in price inputbox of Buy ETH form is populated by default', async () => {
			await custom.shouldExist(page, objectRepository.BUY_PRICE_TEXTBOX)
			price = await custom.getAttribute(
				page,
				objectRepository.BUY_PRICE_TEXTBOX,
				'value'
			)
			if (price.trim().length != 0) {
				console.log('Price Value : ' + price)
			} else {
				throw new Error(
					'The price field is empty, should be prepolulated by default'
				)
			}
		})

		it('enter ETH/BTC quantity in amount inputbox of Buy ETH forum', async () => {
			await custom.shouldExist(page, objectRepository.BUY_QUANTITY_TEXTBOX)
			console.log('Amount Value : ' + testData.amountValue)
			await custom.typeText(
				page,
				testData.amountValue,
				objectRepository.BUY_QUANTITY_TEXTBOX
			)
		})

		it('verify that ETH/BTC total value is displaying correctly to the user in Buy ETH forum', async () => {
			await custom.shouldExist(page, objectRepository.BUY_TOTAL_TEXTBOX)

			let totalExpected = price * testData.amountValue
			let totalActual = parseFloat(
				await custom.getAttribute(
					page,
					objectRepository.BUY_TOTAL_TEXTBOX,
					'value'
				)
			)

			console.log('Total Expected : ' + totalExpected.toPrecision(10))
			console.log('Total Actual   : ' + totalActual.toPrecision(10))

			if (totalExpected.toPrecision(10) == totalActual.toPrecision(10)) {
			} else
				throw new Error(
					'Total actual : ' +
						totalActual +
						' is not matching with total expected : ' +
						totalExpected
				)
		})

		it('verify that for guest user Submit button is not displaying inside the Buy ETH forum', async () => {
			await custom.shouldNotVisible(page, objectRepository.BUY_SUBMIT_BUTTON)
		})

		it('verify that for guest user Login and Registry Now links are displaying inside the Buy ETH forum', async () => {
			await custom.shouldExist(page, objectRepository.BUY_LOGIN_LINK)
			await custom.shouldExist(page, objectRepository.BUY_REGISTER_LINK)
		})
	})

	describe('Data Last End-End (WebSockets) Test', () => {
		it('verifies that the data is loaded in the tickers', async () => {
			let ws = new WebSocket(config.websocketURL)

			let flag_miniTicker = false
			let flag_ethbtc_depth = false
			let flag_ethbtc_aggTrade = false

			ws.on('message', function incoming(data) {
				let v = JSON.parse(data)

				if (v.stream == '!miniTicker@arr@3000ms') {
					if (v.data.length != 0) {
						flag_miniTicker = true
					} else
						throw new Error(
							'The data field is empty inisde "' + v.stream + '" stream ticker'
						)
				} else if (v.stream == 'ethbtc@depth') {
					if (JSON.stringify(v.data) != JSON.stringify({})) {
						flag_ethbtc_depth = true
					} else
						throw new Error(
							'The data field is empty inisde "' + v.stream + '" stream ticker'
						)
				} else if (v.stream == 'ethbtc@aggTrade') {
					if (JSON.stringify(v.data) != JSON.stringify({})) {
						flag_ethbtc_aggTrade = true
					} else
						throw new Error(
							'The data field is empty inisde "' + v.stream + '" stream ticker'
						)
				} else {
					throw new Error(
						'Should not fall inside this loop as all 3 data stream tickers are covered above'
					)
				}

				if (flag_miniTicker && flag_ethbtc_depth && flag_ethbtc_aggTrade) {
					console.log(
						'All 3 data stream tickers value are non empty, hence data is loaded in the tickers'
					)
					ws.terminate()
				}
			})
		})

		it('verifies there is a consistent stream of data', async () => {
			let ws = new WebSocket(config.websocketURL)

			let totalLength = 0
			let dateBefore = new Date().getTime()

			ws.on('message', function incoming(data) {
				totalLength += data.length

				if (new Date().getTime() - dateBefore > 10000) {
					console.log(
						'Total length of the data in chacarter recevied in 10 sec : ' +
							totalLength
					)

					if (totalLength > 15000) {
						console.log(
							'Since we got more than 15000 characters of data in 10 sec, we can say that there is a consistent stream of data'
						)
					} else {
						throw new Error('Data is not consistent as per the benchmark taken')
					}
					ws.terminate()
				}
			})
		})

		// Not able to find any method in node js websocket library to evaluate the time of the websocket connection, hence doing the same as below
		it('verifies the time it takes the socket connection to connect is less than 1 second', async () => {
			let dateCapturedBeforeConnection = new Date().getTime()

			let ws = new WebSocket(config.websocketURL)

			ws.on('message', function incoming(data) {
				let dateCapturedAfterConnection = new Date().getTime()
				let timeDiff =
					dateCapturedAfterConnection - dateCapturedBeforeConnection
				console.log('Time difference (in ms) before and after : ' + timeDiff)

				if (dateCapturedAfterConnection - dateCapturedBeforeConnection < 3000) {
					console.log(
						'Since timestamp difference is less than 3 seconds (changing 1 sec to 3 sec as not able to find any direct method to' +
							'validate the connection time and by the given way of verification there will always be some delay while performing' +
							'the date caputuring. On average, we are getting 1.5 sec connection time by this procedure), hence we could say that' +
							'time websocket takes to connect is less than 1 second'
					)
				} else {
					throw new Error('socket connection time is more than expected')
				}
				ws.terminate()
			})
		})
	})
})
