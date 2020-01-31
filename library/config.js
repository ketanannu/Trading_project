module.exports = {
	baseUrlLandingPage: 'https://www.binance.com/en',
	baseUrlPairTradingView: 'https://www.binance.com/en/trade/ETH_BTC',
	websocketURL:
		'wss://stream.binance.com/stream?streams=!miniTicker@arr@3000ms/ethbtc@depth.b10/ethbtc@aggTrade.b10',
	isHeadless: false,
	slowMo: 0,
	isDevtools: false,
	launchTimeout: 60000,
	waitingTimeout: 60000,
	viewportWidth: 1366,
	viewportHeight: 728,
	windowMaximize: ['--start-maximized'],
}
