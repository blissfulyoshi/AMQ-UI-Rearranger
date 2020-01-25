// ==UserScript==
// @name         AMQ-UI-Rearranger
// @namespace    https://github.com/blissfulyoshi
// @version      0.2.1
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
	</div>
	<div class="SecondaryRight">
		<div class="row">
			<h5>
				<b>Type</b>
			</h5>
			<p id="SecondarySongType">0</p>
		</div>
		<div class="row">
			<h5>
				<b>Start Time</b>
			</h5>
			<p id="SecondaryStartTime">0</p>
		</div>
	</div>`;

	var secondarySongInfoContainer = document.createElement('div');
	secondarySongInfoContainer.id = 'SecondarySongInfoContainer';
	secondarySongInfoContainer.innerHTML = secondarySongInfo;
	document.querySelector("#qpAnimeNameContainer").appendChild(secondarySongInfoContainer);
}

function GetAnswerInformation() {
    var players = document.querySelectorAll('.qpAvatarCenterContainer');
    var correctPlayers = [];

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
                // onPlayerList: [onPlayerList],
                // playerAnswer: [playerAnswer],
                // rightAnswer: [rightAnswer]
            }
        }
        else {
            answerInformation[i].playerScore = playerScore;
            // answerInformation[i].onPlayerList.push(onPlayerList);
            // answerInformation[i].playerAnswer.push(playerAnswer);
            // answerInformation[i].rightAnswer.push(rightAnswer);
            playerScores[i] = playerScore;
        }
        if (rightAnswer) {
            correctPlayers.push(players[i].querySelector('.qpAvatarNameContainer span').innerText);
        }
    }

    if (correctPlayers.length <= 5 && correctPlayers.length > 0) {
        songData[songData.length-1].correctPlayers = correctPlayers;
        console.log(correctPlayers);
    }
}

function GetRig(playerInformation) {
    return playerInformation.onPlayerList.filter(rig => rig === true).length;
}

function IfRoundIsOver() {
    let currentSongCount = parseInt(document.querySelector('#qpCurrentSongCount').innerText);
    let totalSongCount = parseInt(document.querySelector('#qpTotalSongCount').innerText);
    return currentSongCount === totalSongCount;
}

function PrintSongInformation() {
    console.log(JSON.stringify(songData, null, 2));
}

function PrintRanking() {
    answerInformation.sort(function(a, b){return b.playerScore-a.playerScore});
    let ranking = '';
    for (var i = 0; i < answerInformation.length; i++) {
        ranking += (i + 1) + ': ' + answerInformation[i].playerName + ' (' + answerInformation[i].playerScore + ')\n'
    }
    console.log(ranking)
}

function EndRoundStuff() {
    if(IfRoundIsOver()) {
        //console.log(JSON.stringify(answerInformation))
        PrintRanking();
        PrintSongInformation();
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
                EndRoundStuff();
			}
        }
    }
};

// Copied from AMQ's js
// Translates type to the correct output
function convertSontTypeToText(type, typeNumber) {
    switch (type) {
		case 1: return "Opening " + typeNumber;
		case 2: return "Ending " + typeNumber;
		case 3: return "Insert Song";
	}
}

function sec2time(timeInSeconds) {
    var pad = function(num, size) { return ('000' + num).slice(size * -1); },
    minutes = Math.floor(timeInSeconds / 60) % 60,
    seconds = Math.floor(timeInSeconds - minutes * 60);

    return minutes + ':' + pad(seconds, 2);
}

function copyToSecondarySongInfo(result) {
    document.querySelector('#SecondarySongName').innerText = result.songInfo.songName;
	document.querySelector('#SecondaryArtistName').innerText = result.songInfo.artist;
	document.querySelector('#SecondarySongType').innerText = convertSontTypeToText(result.songInfo.type, result.songInfo.typeNumber);
    document.querySelector('#SecondaryRomaji').innerText = result.songInfo.animeNames.romaji;
    document.querySelector('#SecondaryStartTime').innerText = sec2time(quizVideoController.moePlayers[quizVideoController.currentMoePlayerId].startPoint) + ' / ' + sec2time(quizVideoController.moePlayers[quizVideoController.currentMoePlayerId].$player.find("video")[0].duration);
}

function updateSongData(result) {
    var videoLink = (result.songInfo.urlMap.catbox && result.songInfo.urlMap.catbox['720']) ? result.songInfo.urlMap.catbox['720'] :
                   (result.songInfo.urlMap.animethemes && result.songInfo.urlMap.animethemes['720']) ? result.songInfo.urlMap.animethemes['720'] :
                   (result.songInfo.urlMap.openingsmoe && result.songInfo.urlMap.openingsmoe['720']) ? result.songInfo.urlMap.openingsmoe['720'] :
                    (result.songInfo.urlMap.catbox && result.songInfo.urlMap.catbox['480']) ? result.songInfo.urlMap.catbox['480'] : ""
    var currentSongData = {
        animeEng: result.songInfo.animeNames.english,
        animeRomaji: result.songInfo.animeNames.romaji,
		songName: result.songInfo.songName,
		artist: result.songInfo.artist,
		type: convertSontTypeToText(result.songInfo.type, result.songInfo.typeNumber),
        correctCount: result.players.filter((player) => player.correct).length,
        startTime: quizVideoController.moePlayers[quizVideoController.currentMoePlayerId].startPoint, //quizVideoController seems to be a global variable that AMQ populateds to
        songDuration: quizVideoController.moePlayers[quizVideoController.currentMoePlayerId].$player.find("video")[0].duration,
        LinkVideo: videoLink,
        LinkMp3: result.songInfo.urlMap.catbox['0']
	}
	songData.push(currentSongData);

    //To avoid having songdata being lost because of various incidents, print it in the console after each guess
    var totalPlayers = result.players.length;
    console.log(currentSongData.animeEng + ': ' + currentSongData.artist + ' - ' + currentSongData.songName + ' (' + currentSongData.type + ') ' + currentSongData.correctCount + ' (' + Math.round(currentSongData.correctCount * 100/totalPlayers) + '%)');
}

function secondSongCounterCallback(result) {
    copyToSecondarySongInfo(result);
    updateSongData(result);
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

        document.addEventListener('answer results', e => console.log(e));
        new Listener("answer results", function (result) {
            secondSongCounterCallback(result)
        }).bindListener();
    }
}

document.querySelector("#mpPlayButton").addEventListener('click', function() {
    StartAmqScript();
});

document.querySelector("#mpRankedButton").addEventListener('click', function() {
    StartAmqScript();
});
