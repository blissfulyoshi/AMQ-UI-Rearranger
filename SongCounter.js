//add the Song Counter
function AddSongCounter() {
	var fullSongCounter =
	`<div class="leftColumn">
		<div class="row">
			<h5>
				<b id="SongCounterLabel">Songs</b>
			</h5>
			<p id="SongCounter">0</p>
		</div>
		<div class="row">
			<h5>
				<b id="OpeningCounterLabel">Openings</b>
			</h5>
			<p id="OpeningCounter">0</p>
		</div>
		<div class="row">
			<h5>
				<b id="EndingCounterLabel">Endings</b>
			</h5>
			<p id="EndingCounter">0</p>
		</div>
		<div class="row">
			<h5>
				<b id="InsertCounterLabel">Inserts</b>
			</h5>
			<p id="InsertCounter">0</p>
		</div>
	</div>
    	<div class="rightColumn">
        	<div class="row">
			<h5>
				<b>STARMYU</b>
			</h5>
			<p><span id="TotalStarmyuCount">0</p> (<span id="CurrentStarmyuAnswerCount">0</span>)</p>
		</div>
        	<div class="row">
			<h5>
				<b>Aikatsu!</b>
			</h5>
			<p><span id="TotalAikatsuCount">0</span> (<span id="CurrentAikatsuAnswerCount">0</span>)</p>
		</div>
		<div class="row">
			<h5>
				<b>Pripara</b>
			</h5>
            		<p><span id="TotalPriparaCount">0</span> (<span id="CurrentPriparaAnswerCount">0</span>)</p>
		</div>
		<div class="row">
			<h5>
				<b id="AvgScoreLabel">Avg Score</b>
			</h5>
            		<p><span id="AvgScore">0</span> (<span id="CurrentAvgScore">0</span>) | E:<span id="ExpectedAvgScore">0</span></p>
		</div>
	</div>
    	<div class="row">
        	<h5>
		    <b>0-10%</b>
		</h5>
        	<p id="score0010Counter">0</p>
        	<h5>
		    <b>10-20%</b>
		</h5>
		<p id="score1020Counter">0</p>
		<h5>
		    <b>20-30%</b>
		</h5>
		<p id="score2030Counter">0</p>
		<h5>
		    <b>30-40%</b>
		</h5>
		<p id="score3040Counter">0</p>
		<h5>
		    <b>40-50%</b>
		</h5>
		<p id="score4050Counter">0</p>
    	</div>
    	<div class="row">
        	<h5>
		    <b>50-60%</b>
		</h5>
        	<p id="score5060Counter">0</p>
        	<h5>
		    <b>60-70%</b>
		</h5>
		<p id="score6070Counter">0</p>
		<h5>
		    <b>70-80%</b>
		</h5>
		<p id="score7080Counter">0</p>
		<h5>
		    <b>80-90%</b>
		</h5>
		<p id="score8090Counter">0</p>
		<h5>
		    <b>90%+</b>
		</h5>
        	<p id="score90100Counter">0</p>
    	</div>`;

	var songCounterContainer = document.createElement('div');
	songCounterContainer.id = 'songCounterContainer';
	songCounterContainer.innerHTML = fullSongCounter;
	document.querySelector("#quizPage").appendChild(songCounterContainer);
}

// After the answering phase is over, clear the values irrelevant to the next song
function clearSongCounterAfterPrevSong() {
	document.querySelector('#CurrentStarmyuAnswerCount').innerText = '0';
	document.querySelector('#CurrentAikatsuAnswerCount').innerText = '0';
	document.querySelector('#CurrentPriparaAnswerCount').innerText = '0';
    	document.querySelector('#CurrentAvgScore').innerText = '0';
}

// Update the text values of the fields in the Song Counter box with the information from the current song
// Maybe upgrade it to be more flexible in the future
// 2020-08-02 change, update labels with current op/ed/ins percentages + update Avg with expected Value
// GetAverageScore() is a utility function
function updateSongCounter(opCount, edCount, isCount, ppCount, akCount, stCount, percentageCountArray) {
	// Get the various bits of information to populate the box
	var songCount = document.querySelector('#qpCurrentSongCount').innerText;
	let openingPercentage = Math.round(opCount / songCount * 100);
        let endingPercentage = Math.round(edCount / songCount * 100);
        let insertPercentage = Math.round(isCount / songCount * 100);
	// Expected value is just for ranked, so this will just be hardcoded for now
	let expectedValue = 20/75 * songCount
	
	//Populate the box
	document.querySelector('#SongCounter').innerText = songCount;
	document.querySelector('#OpeningCounter').innerText = opCount;
	document.querySelector('#OpeningCounterLabel').innerText = "Openings (" + openingPercentage + '%)';
	document.querySelector('#EndingCounter').innerText = edCount;
	document.querySelector('#EndingCounterLabel').innerText = "Endings (" + endingPercentage + '%)';
	document.querySelector('#InsertCounter').innerText = isCount;
	document.querySelector('#InsertCounterLabel').innerText = "Inserts (" + insertPercentage + '%)';
    	for (var i = 0; i < percentageCountArray.length; i++) {
        	document.querySelector('#score' + i + '0' + (i + 1) + '0Counter').innerText = percentageCountArray[i];
    	}
	document.querySelector('#TotalPriparaCount').innerText = ppCount;
    	document.querySelector('#TotalAikatsuCount').innerText = akCount;
	document.querySelector('#TotalStarmyuCount').innerText = stCount;
    	document.querySelector('#AvgScore').innerText = GetAverageScore();
	document.querySelector('#ExpectedAvgScore').innerText = expectedValue.toFixed(1)
}

// Updates the labels in the song counter box to show the expected values of ops/eds/ins
// No longer in use since this information wasn't very engaging to the user base
function updateSongCounterLabels() {
    setTimeout(function() {
        // There are effectively 2 song counts: the one set in the options, and the actual song count on the ingame counter
        // use the actual song count for display but use the options value to set the predicted percentages
        // Bug: however the actualSongCount remains a ? until the game fully loads, so it needs another trigger
        let songCount = parseInt(document.querySelector('#mhNumberOfSongs').value);
        let actualSongCount = document.querySelector('#qpTotalSongCount').innerText;
        let openingCount = parseInt(document.querySelector('#mhOpenings').value);
        let endingCount = parseInt(document.querySelector('#mhEndings').value);
        //let insertCount = parseInt(document.querySelector('#mhInserts').value);
        let randomCount = parseInt(document.querySelector('#mhRandomType').value);

        // Get the estimate distribution for op/ed/ins as a percentage
        // Assume random songs are evenly distributed among all types
        // Bug: Does not take into account that op/ed/ins might be disabled
        let openingPercentage = Math.round((openingCount + (randomCount / 3))/ songCount * 100);
        let endingPercentage = Math.round((endingCount + (randomCount / 3))/ songCount * 100);
        // To make sure insert percentage makes the total add up to 100%, just subtract the other 2 percentages from 100
        let insertPercentage = 100 - openingPercentage - endingPercentage;
        document.querySelector('#SongCounterLabel').innerText = "Songs (" + songCount + ')';
        document.querySelector('#OpeningCounterLabel').innerText = "Openings (" + openingPercentage + '%)';
        document.querySelector('#EndingCounterLabel').innerText = "Endings (" + endingPercentage + '%)';
        document.querySelector('#InsertCounterLabel').innerText = "Inserts (" + insertPercentage + '%)';
    }, 500);
}

//check for song type
function checkForSongType(result) {
    var songType = convertSongTypeToText(result.songInfo.type, result.songInfo.typeNumber)
	if (songType.includes('Opening')) {
		openingCounter++;
	}
	if (songType.includes('Ending')) {
		endingCounter++;
	}
	if (songType.includes('Insert')) {
		insertCounter++;
	}
}
