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
