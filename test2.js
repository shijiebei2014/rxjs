var close1Button = document.querySelector('.close1'),
	close2Button = document.querySelector('.close2'),
	close3Button = document.querySelector('.close3'),
	refreshButton = document.querySelector('.refresh'),
	
	close1Stream = Rx.Observable.fromEvent(close1Button, 'click'),
	close2Stream = Rx.Observable.fromEvent(close2Button, 'click'),
	close3Stream = Rx.Observable.fromEvent(close3Button, 'click'),
	refreshStream = Rx.Observable.fromEvent(refreshButton, 'click'),
	
	requestStream = refreshStream.startWith('startup click').map(function() {
		var url = 'https://api.github.com/users?since=' + Math.floor(Math.random() * 500)
		return url
	}),
	responseStream = requestStream.flatMap(function(url) {
		return Rx.Observable.fromPromise($.getJSON(url))
	}),
	
	createSuggestion = function(closeClickStream){
		return closeClickStream
				.startWith('startup start')
				.combineLatest(responseStream, function(click, listUsers) {
					return listUsers[Math.floor(Math.random() * listUsers.length)]
				})
				.merge(refreshStream.map(function() {
					return null
				}))
				.startWith(null)
	},
	renderSuggestion = function(suggest, selector) {
		if (suggest === null) {
			$(selector).css({visibility: 'hidden'})
		} else {
			$(selector).css({visibility: 'visible'})
			$(selector + ' .username').text(suggest.login)
			$(selector + ' .username').attr('href', suggest.html_url)
			$(selector + ' img').attr('src', suggest.avatar_url)
		}
	},
	
	suggestion1 = createSuggestion(close1Stream),
	suggestion2 = createSuggestion(close2Stream),
	suggestion3 = createSuggestion(close3Stream);

suggestion1.subscribe(function(suggestion) {
	renderSuggestion(suggestion, '.suggestion1')
});
suggestion2.subscribe(function(suggestion) {
	renderSuggestion(suggestion, '.suggestion2')
});
suggestion3.subscribe(function(suggestion) {
	renderSuggestion(suggestion, '.suggestion3')
});
	
	
