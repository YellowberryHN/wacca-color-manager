export function main(){
	// index
	const FOUND = 0;
	const NOTFOUND = -1;

	// length
	const UNSET = 0;

	window._preset = null;
	window._presetCode = "";

	window.presetPrompt = function() {
		loadPreset(prompt('プリセットコードを入力して下さい:\nPlease enter a preset code:'));
	}

	window.loadPreset = function(presetCode) {
		if(presetCode == null) return false;

		// default colors as of reverse
		preset = {
			my: 303001,
			touchNote: 5,
			chainNote: 6,
			slideNoteLeft: 4,
			slideNoteRight: 3,
			snapNoteUp: 1,
			snapNoteDown: 2,
			holdNote: 7
		};

		console.log("preset code given: " + presetCode);
		var b64 = presetCode.replace(/[\!\&\$]/g, a => ({'!':'+','&':'/','$':'='})[a]);
		var raw = null;

		try {
			raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
		} catch(e) {
			if(e instanceof DOMException) {
				alert("コードが無効です。もう一度やり直してください。\nInvalid code. Please try again. [raw]");
				return false;
			}
			else console.error(e);
		}

		function va(array, start, length = 2) {
			var value;
			for (var i = start; i < start + length; i++) {
			    value = (value << 8) | array[i];
			}
			return value;
		}

		if(raw != null) {
			if(raw.length != 17) {
				alert("コードが無効です。もう一度やり直してください。\nInvalid code. Please try again. [len]");
				return false;
			}

			/* hello? jank department?? */

			preset.my = va(raw, 0, 3);

			preset.touchNote = va(raw, 3);
			preset.chainNote = va(raw, 5);
			preset.slideNoteLeft = va(raw, 7);
			preset.slideNoteRight = va(raw, 9);
			preset.snapNoteUp = va(raw, 11);
			preset.snapNoteDown = va(raw, 13);
			preset.holdNote = va(raw, 15);

			for (const prop in preset) {
				console.log(`${prop}: ${preset[prop]}`);

				fetch(`https://wacca.marv-games.jp/web/option/${prop}Color/exec`, {
				  "headers": {
				    "content-type": "application/x-www-form-urlencoded",
				  },
				  "referrer": `https://wacca.marv-games.jp/web/option/${prop}Color`,
				  "body": `optionValue=${preset[prop]}`,
				  "method": "POST",
				  "mode": "cors",
				  "credentials": "include",
				  "cookie": document.cookie,
				  "redirect": error
				});
			}

			return preset;
		}
		
		console.log(raw);
	}

	window.grabColors = async function() {
		preset = {
			my: 0,
			touchNote: 0,
			chainNote: 0,
			slideNoteLeft: 0,
			slideNoteRight: 0,
			snapNoteUp: 0,
			snapNoteDown: 0,
			holdNote: 0
		};

		cookie = "";

		for (const prop in preset) {

			var selectedColor = 0;
			
			await fetch(`https://wacca.marv-games.jp/web/option/${prop}Color`, {
			  "referrer": `https://wacca.marv-games.jp/web/option/designSetting`,
			  "method": "GET",
			  "mode": "cors",
			  "credentials": "include",
			  "cookie": document.cookie,
			  "redirect": "error"
			}).then(response => response.text())
			  .then(text => {
			    const parser = new DOMParser();
			    const htmlDocument = parser.parseFromString(text, "text/html");
			    if (prop == "my") {
			    	// NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE NIGHTMARE 
			    	selectedColor = htmlDocument.documentElement.querySelector("div.current-mycolor__icon img").src.split('/').pop().split('.')[0];
			    } else {
			    	selectedColor = htmlDocument.documentElement.querySelector('.option_image_select_content.selected #option_value').value;
			    }
			    console.log("got "+selectedColor);

			    if(selectedColor == 0) throw new Error("");

				preset[prop] = selectedColor;

				console.log(`${prop}: ${preset[prop]}`);
			  });

		}

		return preset;
	}

	// this is stupid
	window._generating = false;

	window.generatePreset = function(preset) {
		if(window._preset != null || _generating) {
			return;
		}
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