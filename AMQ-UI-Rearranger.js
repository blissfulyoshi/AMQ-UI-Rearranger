// ==UserScript==
// @name         AMQ-UI-Rearranger
// @namespace    https://github.com/blissfulyoshi
// @version      0.1
// @description  Create a Song Counter in AMQ
// @match        https://animemusicquiz.com/
// @grant        none
// ==/UserScript==

var openingCounter = 0;
var endingCounter = 0;
var insertCounter = 0;
var songData = [];
var answerInformation = [];

//separate array to track player scores only so I don't have to sort an array
var playerScores = [];

function ResetSongCounter() {
	openingCounter = 0;
	endingCounter = 0;
	insertCounter = 0;
	songData = [];
    answerInformation = [];
    updateSongCounter();
}

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
				<b>Avg Score</b>
			</h5>
			<p id="AvgScore">0</p>
		</div>
        <div class="row">
			<h5>
				<b>40th</b>
			</h5>
			<p id="Cutoff">n/a</p>
		</div>
	</div>`;

	var songCounterContainer = document.createElement('div');
	songCounterContainer.id = 'songCounterContainer';
	songCounterContainer.innerHTML = fullSongCounter;
	document.querySelector("#quizPage").appendChild(songCounterContainer);
}

//check for song type
function checkForSongType() {
	var songType = document.querySelector('#qpSongType').innerText;
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

//check for song type
function updateSongCounter() {
	document.querySelector('#SongCounter').innerText = document.querySelector('#qpCurrentSongCount').innerText;
	document.querySelector('#OpeningCounter').innerText = openingCounter;
	document.querySelector('#EndingCounter').innerText = endingCounter;
	document.querySelector('#InsertCounter').innerText = insertCounter;
    document.querySelector('#AvgScore').innerText = GetAverageScore();
    document.querySelector('#Cutoff').innerText = GetScoreOfPlace(40);
}

function updateSongCounterLabels() {
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
}

function updateSongData() {
	var currentSongData = {
        anime: document.querySelector('#qpAnimeName').innerText,
		name: document.querySelector('#qpSongName').innerText ,
		artist: document.querySelector('#qpSongArtist').innerText,
		type: document.querySelector('#qpSongType').innerText,
        correctCount: document.querySelectorAll('.qpAvatarAnswerContainer.rightAnswer').length,
        link: document.querySelector('#qpSongVideoLink').href
	}
	songData.push(currentSongData);

    //To avoid having songdata being lost because of various incidents, print it in the console after each guess
    var totalPlayers = document.querySelectorAll('#qpScoreBoardEntryContainer .qpStandingItem').length;
    console.log(currentSongData.anime + ': ' + currentSongData.artist + ' - ' + currentSongData.name + ' (' + currentSongData.type + ') ' + currentSongData.correctCount + ' (' + Math.round(currentSongData.correctCount * 100/totalPlayers) + '%)');
}

function updateUserCount() {
	var correctCount = document.querySelectorAll('.qpAvatarAnswerContainer.rightAnswer').length;
	var totalPlayers = document.querySelectorAll('#qpScoreBoardEntryContainer .qpStandingItem').length
	var activePlayers = document.querySelectorAll('#qpScoreBoardEntryContainer .qpStandingItem:not(.disabled)').length
	var totalPercentage = Math.round(correctCount * 100 / totalPlayers);
	var activeCorrectPercentage = Math.round(correctCount * 100 / activePlayers);
	document.querySelector('#qpStandingCorrectCount').innerText = 'Active: ' + correctCount + ' / ' + activePlayers + ' ' + activeCorrectPercentage + '%\nAll: ' + correctCount + ' / ' + totalPlayers + ' ' + totalPercentage + '%';
}

function AddSecondarySongInfo() {
	var secondarySongInfo =
	`<div class="row">
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
		<p id="SecondarySongType">0</p>
	</div>`;

	var secondarySongInfoContainer = document.createElement('div');
	secondarySongInfoContainer.id = 'SecondarySongInfoContainer';
	secondarySongInfoContainer.innerHTML = secondarySongInfo;
	document.querySelector("#qpAnimeNameContainer").appendChild(secondarySongInfoContainer);
}

function CopyToSecondarySongInfo() {
    document.querySelector('#SecondarySongName').innerText = document.querySelector('#qpSongName').innerText;
	document.querySelector('#SecondaryArtistName').innerText = document.querySelector('#qpSongArtist').innerText;
	document.querySelector('#SecondarySongType').innerText = document.querySelector('#qpSongType').innerText;
}

function GetAnswerInformation() {
    var players = document.querySelectorAll('.qpAvatarCenterContainer');

    //check if the player array needs to be resetted for a new game
    //playerName check is a pretty safe check if you're moving inbetween games, but definitely not the most robust
    var firstSong = parseInt(document.querySelector('#qpCurrentSongCount').innerText) === 1;
    var firstPlayerName = players[0].querySelector('.qpAvatarNameContainer span').innerText;
    var resetPlayerArray = firstSong || players.length !== answerInformation.length || (answerInformation[0].playerName !== firstPlayerName);
    for (var i=0; i < players.length; i++) {
        let playerScore = parseInt(players[i].querySelector('.qpAvatarPointText').innerText);
        let onPlayerList = !players[i].querySelector('.qpAvatarStatus').classList.contains('hide');
        let playerAnswer = players[i].querySelector('.qpAvatarAnswerText').innerText;
        let rightAnswer = players[i].querySelector('.qpAvatarAnswerContainer').classList.contains('rightAnswer');
        if (resetPlayerArray) {
            let playerName = players[i].querySelector('.qpAvatarNameContainer span').innerText;
            playerScores[i] = playerScore;
            answerInformation[i] = {
                playerName: playerName,
                playerScore: playerScore,
                onPlayerList: [onPlayerList],
                playerAnswer: [playerAnswer],
                rightAnswer: [rightAnswer]
            }
        }
        else {
            answerInformation[i].playerScore = playerScore;
            answerInformation[i].onPlayerList.push(onPlayerList);
            answerInformation[i].playerAnswer.push(playerAnswer);
            answerInformation[i].rightAnswer.push(rightAnswer);
            playerScores[i] = playerScore;
        }
    }
}

function GetRig(playerInformation) {
    return playerInformation.onPlayerList.filter(rig => rig === true).length;
}

function WriteRigToChat() {
    var enterEvent = new KeyboardEvent('keypress', {altKey:false,
                                           bubbles: true,
                                           cancelBubble: false,
                                           cancelable: true,
                                           charCode: 0,
                                           code: "Enter",
                                           composed: true,
                                           ctrlKey: false,
                                           currentTarget: null,
                                           defaultPrevented: true,
                                           detail: 0,
                                           eventPhase: 0,
                                           isComposing: false,
                                           isTrusted: true,
                                           key: "Enter",
                                           keyCode: 13,
                                           location: 0,
                                           metaKey: false,
                                           repeat: false,
                                           returnValue: false,
                                           shiftKey: false,
                                           type: "keydown",
                                           which: 13});
    var chatInput = document.querySelector('#gcInput');
    //to prevent errors, make sure there is an entry for player 2
    if (answerInformation[1]) {
        chatInput.value = answerInformation[0].playerName + ' vs ' + answerInformation[1].playerName +
            " score: " + answerInformation[0].playerScore + " - " + answerInformation[1].playerScore +
            " rig: " + GetRig(answerInformation[0]) + " - " + GetRig(answerInformation[1]);
    }
    else {
        chatInput.value = answerInformation[0].playerName +
            " score: " + answerInformation[0].playerScore +
            " rig: " + GetRig(answerInformation[0]);
    }
    chatInput.dispatchEvent(enterEvent);
}

function WriteRigToLevel() {
    //There are 2 lvl fields for every character
    let levelField = document.querySelectorAll('.qpAvatarLevelText');
    for (var i=0; i < levelField.length; i++) {
        levelField[i].innerText = GetRig(answerInformation[Math.round((i - 1)/2)]);
    }
}

function IfRoundIsOver() {
    let currentSongCount = parseInt(document.querySelector('#qpCurrentSongCount').innerText);
    let totalSongCount = parseInt(document.querySelector('#qpTotalSongCount').innerText);
    return currentSongCount === totalSongCount;
}

function PrintSongInfomration() {
    console.log(JSON.stringify(songData, null, 2));
}

function EndRoundStuff() {
    if(IfRoundIsOver()) {
        console.log(JSON.stringify(answerInformation))
        PrintSongInfomration();
    }
}

function GetAverageScore() {
    var players = document.querySelectorAll('.qpAvatarCenterContainer');
    var totalScore = 0;
    if (players && answerInformation[0]) {
        for (var j = 0; j < players.length; j++) {
            totalScore += answerInformation[j].playerScore;
        }

         //use round * 10  / 10 to get 1 decimal point
        return Math.round(totalScore/players.length * 10) / 10
    }

    return 0;
}

function GetScoreOfPlace(place) {
    if (playerScores.length > place) {
        playerScores.sort(function(a, b){return b-a});
        return playerScores[place - 1];
    }

    return 'n/a';
}

const SongCounterCallback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
        if (mutation.type === 'attributes') {
			if (document.querySelector('#qpAnimeNameHider').classList.contains('hide'))
			{
				checkForSongType();
                GetAnswerInformation();
				updateSongCounter();
				updateUserCount();
				updateSongData();
                CopyToSecondarySongInfo();
                // WriteRigToLevel();
                // WriteRigToChat();
                EndRoundStuff();
			}
        }
    }
};

function MirrorTimerText() {
	var timerText = document.querySelector('#qpHiderText').innerText;
    document.querySelector('#qpAnimeNameHider').innerText = timerText
}

// Mutation Observer for countdown timer dropping
const CountodwnChangeCallback = function(mutationsList, observer) {
	MirrorTimerText();
};

// Mutation Observer for countdown timer dropping
const StartGameCallback = function(mutationsList, observer) {
	updateSongCounterLabels();
    ResetSongCounter();
};

function SetupMirrorTimer() {
    var countdown = document.querySelector('#qpHiderText');
    var countdownConfig = { characterData: true, childList: true};
    var countdownObserver = new MutationObserver(CountodwnChangeCallback);
    countdownObserver.observe(countdown, countdownConfig);
}

// Observe when the answer is revealed
function ObserveAnswerShowing() {
    var countdown = document.querySelector('#qpAnimeNameHider');
    var countdownConfig = { attributes: true};
    var countdownObserver = new MutationObserver(SongCounterCallback);
    countdownObserver.observe(countdown, countdownConfig);
}

// Observe when the game starts
function ObserveGameStart() {
    var countdown = document.querySelector('#quizPage');
    var countdownConfig = { attributes: true};
    var countdownObserver = new MutationObserver(StartGameCallback);
    countdownObserver.observe(countdown, countdownConfig);
}

function StartAmqScript() {
    //check if script is already running to avoid running it twice
    if (!document.querySelector('#SongCounter')) {
        console.log("HAI");
        ObserveGameStart();
        AddSongCounter();
        ObserveAnswerShowing();
        SetupMirrorTimer();
        AddSecondarySongInfo();
    }
}

document.querySelector("#mpPlayButton").addEventListener('click', function() {
    StartAmqScript();
});

document.querySelector("#mpRankedButton").addEventListener('click', function() {
    StartAmqScript();
});
