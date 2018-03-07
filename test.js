// dom对象
var refreshButton = document.querySelector('.refresh'),
	closeButton1 = document.querySelector('.close1'),
	closeButton2 = document.querySelector('.close2'),
	closeButton3 = document.querySelector('.close3'),
	// Observable
	refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click'),
	close1ClickStream = Rx.Observable.fromEvent(closeButton1, 'click'),
	close2ClickStream = Rx.Observable.fromEvent(closeButton2, 'click'),
	close3ClickStream = Rx.Observable.fromEvent(closeButton3, 'click'),
    // 复合Observable
	requestStream = refreshClickStream.startWith('startup click').map(function() {
		var randomOffset = Math.floor(Math.random() * 500);
		return 'https://api.github.com/users?since=' + randomOffset;
	}),
	responseStream = requestStream.flatMap(function(requestUrl) {
		return Rx.Observable.fromPromise($.getJSON(requestUrl));
	}),

	createSuggestion = function(closeClickStream) {
		// 第一个startWith一定要有,否则不会执行function(click, listUsers){}回调
		// 第二个startWith不清楚有什么用,去掉也没有影响
		// 点击refresh按钮,居然会触发responsStream,任何一个Observable触发了,整个链中的Observable都会执行,
		// 点击close的时候,refresh没有点击,对应的Observable不会触发   
		return closeClickStream.startWith('startup click').combineLatest(responseStream, function(click, listUsers) {
		    console.log('latest:', click);
		    return listUsers[Math.floor(Math.random() * listUsers.length)]
		}).merge(refreshClickStream.map(function() {
		    console.log('merge');
		    return null
		}))//.startWith(null)
		/*return refreshClickStream.map(function() {
			console.log('merge');
			return null
		}).merge(closeClickStream.startWith('startup click').combineLatest(responseStream, function(click, listUsers) {
			console.log('latest:', click);
			return listUsers[Math.floor(Math.random() * listUsers.length)]
		})).startWith(null)*/
	},

	renderSuggestion = function(suggestedUser, selector) {
		var suggestionEl = document.querySelector(selector);
		if(suggestedUser === null) {
			console.log('render null');
			suggestionEl.style.visibility = 'hidden';
		} else {
			suggestionEl.style.visibility = 'visible';
			var usernameEl = suggestionEl.querySelector('.username');
			usernameEl.href = suggestedUser.html_url;
			usernameEl.textContent = suggestedUser.login;
			var imgEl = suggestionEl.querySelector('img');
			imgEl.src = "";
			imgEl.src = suggestedUser.avatar_url;
		}
	};

var suggestion1 = createSuggestion(close1ClickStream);
// var suggestion2 = createSuggestion(close2ClickStream);
// var suggestion3 = createSuggestion(close3ClickStream);

suggestion1.subscribe(function(suggestion) {
	console.log(suggestion);
	renderSuggestion(suggestion, '.suggestion1')
});
// suggestion2.subscribe(function(suggestion) { renderSuggestion(suggestion, '.suggestion2') });
// suggestion3.subscribe(function(suggestion) { renderSuggestion(suggestion, '.suggestion3') });