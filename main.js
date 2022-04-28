export function main(){
	// index
	const FOUND = 0;
	const NOTFOUND = -1;

	// length
	const UNSET = 0;

	window.presetPrompt = function() {
		loadPreset(prompt('プリセットコードを入力して下さい:\nPlease enter a preset code:'));
	}

	window.loadPreset = function(preset) {
		console.log("preset code given: " + preset);
	}

	window.generatePreset = function() {
		alert("not implemented.");
	}

	try {
		const hostname = 'wacca.marv-games.jp';
		if (location.hostname !== hostname){
			throw new Error('invalid-hostname');
		}

		const loginPagePath = '/web/login';
		if (location.pathname.indexOf(loginPagePath) === FOUND) {
			throw new Error('not-logged-in');
		}
		
		const designSettingsPath = 'web/option/designSetting';
		if (location.pathname.indexOf(designSettingsPath) === NOTFOUND) {
			throw new Error('invalid-directory');
		}

		// context menu patch
		try { $('html').off('contextmenu'); } catch {};


		const parentNode = document.querySelector('.option__setting:not(.color-manager-enabled):not(.color-manager)');
		if(parentNode == null) {
			console.warn("color manager already injected, halt.");
			return;
		}

		const insertCode = 
		`<style>
		html[class="translated-ltr"] .eng-text {display: none;}
		</style>
		<div class="option__setting color-manager">
			<h2 class="option__title">WACCA Color Manager v0.1</h2>
			<ul class="option__select">
				<li class="second__index">
					<a onclick="presetPrompt()">
						<div class="select__top long" style="background: linear-gradient(to bottom, #ff2400, #881200);">
							<div class="select__tl">プリセットを開く<span class="eng-text"> / Load Preset</span></div>
						</div>
					</a>
					<div class="select__bottom">カラープリセットを設定できます。<span class="eng-text"><br>You can load a color preset.</span></div>
				</li>
				<li class="second__index">
					<a onclick=generatePreset()>
						<div class="select__top long" style="background: linear-gradient(to bottom, #ff2400, #881200);">
							<div class="select__tl">プリセットを共有<span class="eng-text"> / Share Preset</span></div>
						</div>
					</a>
					<div class="select__bottom">カラープリセットを共有できます。<span class="eng-text"><br>You can share the current color preset.</span></div>
				</li>
			</ul>
		</div>`;

		parentNode.classList.add("color-manager-enabled");
		parentNode.insertAdjacentHTML('beforebegin', insertCode);
		
	} catch (error) {
		let alertMessage = '';
		let newLocation = '';

		switch (error.message) {
			case 'invalid-hostname':
				alertMessage = 'ここはWACCAのマイページではありません。\nWACCAのマイページへログインし、「オプション」タブの中にある「デザイン設定」ページで、改めて実行してください。\nThis is not WACCA\'s My Page.\nPlease log in to WACCA\'s My Page and run it again on the "Design Settings(デザイン設定)" page in the "Options(オプション)" tab.';
				newLocation = 'https://wacca.marv-games.jp/web/login';
				break;

			case 'not-logged-in':
				alertMessage = 'WACCAのマイページへログインしていないようです。\nWACCAのマイページへログインし、「オプション」タブの中にある「デザイン設定」ページで、改めて実行してください。\nIt seems that you have not logged in to WACCA\'s My Page.\nPlease log in to WACCA\'s My Page and run it again on the "Design Settings(デザイン設定)" page in the "Options(オプション)" tab.';
				break;
		
			case 'invalid-directory':
				alertMessage = 'このページではブックマークレットを実行できません。このダイアログを閉じると「デザイン設定」ページへ移動しますので、そこで改めて実行してください。\nThe bookmarklet cannot be run on this page. When you close this dialog, you will be redirected to the "Design Settings(デザイン設定)" page, so please run it again there.';
				newLocation = 'https://wacca.marv-games.jp/web/option/designSetting';
				break;
		}

		if (alertMessage.length !== UNSET) {
			window.alert(alertMessage);
		}
		
		if (newLocation.length !== UNSET) {
			location.href = newLocation;
		}
	}
	return;
}