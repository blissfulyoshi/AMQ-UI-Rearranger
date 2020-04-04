function AddSecondarySongInfo() {
	var secondarySongInfo =
	`<div class="SecondaryLeft">
		<div class="row">
			<h5>
				<b>Romaji</b>
			</h5>
			<p id="SecondaryRomaji">0</p>
		</div>
        <div class="row">
			<h5>
				<b>Song Name</b>
			</h5>
			<p id="SecondarySongName">0</p>
		</div>
		<div class="row">
			<h5>
				<b>Artist</b>
			</h5>
			<p id="SecondaryArtistName">0</p>
		</div>
        <div class="row">
			<h5>
				<b>Type</b>
			</h5>
			<p><span id="SecondarySongType">0</span> (<span id="SecondaryStartTime">0</span>)</p>
		</div>
	</div>`;

	var secondarySongInfoContainer = document.createElement('div');
	secondarySongInfoContainer.id = 'SecondarySongInfoContainer';
	secondarySongInfoContainer.innerHTML = secondarySongInfo;
	document.querySelector("#qpAnimeNameContainer").appendChild(secondarySongInfoContainer);
}

//quizVideoController is a global variable in AMQ
function copyToSecondarySongInfo(result) {
    document.querySelector('#SecondarySongName').innerText = result.songInfo.songName;
	document.querySelector('#SecondaryArtistName').innerText = result.songInfo.artist;
	document.querySelector('#SecondarySongType').innerText = convertSongTypeToText(result.songInfo.type, result.songInfo.typeNumber);
    document.querySelector('#SecondaryRomaji').innerText = result.songInfo.animeNames.romaji;
    document.querySelector('#SecondaryStartTime').innerText = sec2time(quizVideoController.moePlayers[quizVideoController.currentMoePlayerId].startPoint) + ' / ' + sec2time(quizVideoController.moePlayers[quizVideoController.currentMoePlayerId].$player.find("video")[0].duration);
}

function sec2time(timeInSeconds) {
    var pad = function(num, size) { return ('000' + num).slice(size * -1); },
    minutes = Math.floor(timeInSeconds / 60) % 60,
    seconds = Math.floor(timeInSeconds - minutes * 60);

    return minutes + ':' + pad(seconds, 2);
}

// Copied from AMQ's js
// Translates type to the correct output
function convertSongTypeToText(type, typeNumber) {
    switch (type) {
		case 1: return "Opening " + typeNumber;
		case 2: return "Ending " + typeNumber;
		case 3: return "Insert Song";
	}
}