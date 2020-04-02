// ==UserScript==
// @name         AMQ-UI-Rearranger
// @namespace    https://github.com/blissfulyoshi
// @version      0.3.1
// @description  Create a Song Counter in AMQ
// @match        https://animemusicquiz.com/
// @grant        none
// ==/UserScript==

var openingCounter = 0;
var endingCounter = 0;
var insertCounter = 0;
var aikatsuCounter = 0;
var starmyuCounter = 0;
var priparaCounter = 0;
var scorePercentageCounter = [0,0,0,0,0,0,0,0,0,0];
var songData = [];
var answerInformation = [];
var fullAnimeList = [];

//separate array to track player scores only so I don't have to sort an array
var playerScores = [];

function ResetSongCounter() {
	openingCounter = 0;
	endingCounter = 0;
	insertCounter = 0;
    aikatsuCounter = 0;
    starmyuCounter = 0;
    priparaCounter = 0;
    scorePercentageCounter = [0,0,0,0,0,0,0,0,0,0];
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
				<b>Avg Score</b>
			</h5>
            <p><span id="AvgScore">0</span> (<span id="CurrentAvgScore">0</span>)</p>
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

function AddPlayerInfoBox() {
    var playerInfoBox =
    `<div class="leftColumn">
        <div class="row">
			<h4>
				<b>Correct Answer(s)</b>
			</h4>
		</div>
        <div class="row">
			<h5>
				<b id="Correct0"></b>
			</h5>
			<p id="Correct0Count"></p>
		</div>
		<div class="row">
			<h5>
				<b id="Correct1"></b>
			</h5>
			<p id="Correct1Count"></p>
		</div>
		<div class="row">
			<h5>
				<b id="Correct2"></b>
			</h5>
			<p id="Correct2Count"></p>
		</div>
		<div class="row">
			<h5>
				<b id="Correct3"></b>
			</h5>
			<p id="Correct3Count"></p>
		</div>
		<div class="row">
			<h5>
				<b id="Correct4"></b>
			</h5>
			<p id="Correct4Count"></p>
		</div>
        <div class="row">
			<h5>
				<b id=""></b>
			</h5>
			<p id=""></p>
		</div>
        <div class="row">
			<h5>
				<b id=""></b>
			</h5>
			<p id=""></p>
		</div>
        <div class="row">
			<h5>
				<b id=""></b>
			</h5>
			<p id=""></p>
		</div>
	</div>
    <div class="rightColumn">
        <div class="row">
			<h4>
				<b>Wrong Answer(s)</b>
			</h4>
		</div>
        <div class="row">
			<h5>
				<b id="Wrong0"></b>
			</h5>
			<p id="Wrong0Count"></p>
		</div>
		<div class="row">
			<h5>
				<b id="Wrong1"></b>
			</h5>
			<p id="Wrong1Count"></p>
		</div>
		<div class="row">
			<h5>
				<b id="Wrong2"></b>
			</h5>
			<p id="Wrong2Count"></p>
		</div>
		<div class="row">
			<h5>
				<b id="Wrong3"></b>
			</h5>
			<p id="Wrong3Count"></p>
		</div>
		<div class="row">
			<h5>
				<b id="Wrong4"></b>
			</h5>
			<p id="Wrong4Count"></p>
		</div>
        <div class="row">
			<h5>
				<b id="OtherAnswer"></b>
			</h5>
			<p id="OtherCount"></p>
		</div>
        <div class="row">
			<h5>
				<b id="InvalidAnswer"></b>
			</h5>
			<p id="InvalidAnswerCount"></p>
		</div>
        <div class="row">
			<h5>
				<b id="NoAnswer"></b>
			</h5>
			<p id="NoAnswerCount"></p>
		</div>
	</div>`;

	var playerInfoContainer = document.createElement('div');
	playerInfoContainer.id = 'playerInfoContainer';
	playerInfoContainer.innerHTML = playerInfoBox;
	document.querySelector("#qpAnimeCenterContainer").appendChild(playerInfoContainer);
}

//add the Song Counter
function AddCorrectPlayersBox() {
	var correctPlayersListing =
	`<h5><b>Correct</b></h5>
     <div id='correctPlayers'></div>`;

	var correctPlayersContainer = document.createElement('div');
	correctPlayersContainer.id = 'correctPlayersContainer';
	correctPlayersContainer.innerHTML = correctPlayersListing;
	document.querySelector("#qpAnimeContainer .col-xs-3").appendChild(correctPlayersContainer);
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
function previousSongClear() {
	document.querySelector('#CurrentStarmyuAnswerCount').innerText = '0';
	document.querySelector('#CurrentAikatsuAnswerCount').innerText = '0';
	document.querySelector('#CurrentPriparaAnswerCount').innerText = '0';
    document.querySelector('#CurrentAvgScore').innerText = '0';
    document.querySelector('#correctPlayers').innerText = '';
    displayAnswerOccurence([], "Correct");
    displayAnswerOccurence([], "Wrong");
    document.querySelector('#OtherAnswer').innerText = '';
    document.querySelector('#OtherCount').innerText = '';
    document.querySelector('#InvalidAnswer').innerText = '';
    document.querySelector('#InvalidAnswerCount').innerText = '';
    document.querySelector('#NoAnswer').innerText = '';
    document.querySelector('#NoAnswerCount').innerText = '';
}

function updateSongCounter() {
	document.querySelector('#SongCounter').innerText = document.querySelector('#qpCurrentSongCount').innerText;
	document.querySelector('#OpeningCounter').innerText = openingCounter;
	document.querySelector('#EndingCounter').innerText = endingCounter;
	document.querySelector('#InsertCounter').innerText = insertCounter;
    for (var i = 0; i < scorePercentageCounter.length; i++) {
        document.querySelector('#score' + i + '0' + (i + 1) + '0Counter').innerText = scorePercentageCounter[i];
    }
	document.querySelector('#TotalPriparaCount').innerText = priparaCounter;
    document.querySelector('#TotalAikatsuCount').innerText = aikatsuCounter;
	document.querySelector('#TotalStarmyuCount').innerText = starmyuCounter;
    document.querySelector('#AvgScore').innerText = GetAverageScore();
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
    var totalCorrectAverage = correctCount / totalPlayers;
	var totalPercentage = Math.round(totalCorrectAverage * 100);
	var activeCorrectPercentage = Math.round(correctCount * 100 / activePlayers);
    document.querySelector('#CurrentAvgScore').innerText = totalCorrectAverage.toFixed(2);
	document.querySelector('#qpStandingCorrectCount').innerText = 'Active: ' + correctCount + ' / ' + activePlayers + ' ' + activeCorrectPercentage + '%';
    let percentageTier = Math.floor(activeCorrectPercentage / 10);

    //To prevent bugs from 100% and above
    if (percentageTier >= 10) {
        percentageTier = 9
    }
    scorePercentageCounter[percentageTier]++;
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

//counts the number of times Aikatsu is used an answer
function answerTitleCounter(answer, title) {
    return answer.toLowerCase().includes(title) ? 1 : 0
}

function getNameFromAnimeList(playerAnswer) {
    return fullAnimeList.findIndex((animeName) => animeName.toLowerCase() === playerAnswer.toLowerCase());
}

function incrementAnswerList(answerList, animeArrayIndex) {
    //if already defined, just increment
    //else define it with the number 1
    if (answerList[fullAnimeList[animeArrayIndex]]) {
        answerList[fullAnimeList[animeArrayIndex]]++;
    }
    else {
        answerList[fullAnimeList[animeArrayIndex]] = 1;
    }
}

function sortAnswerOccurence(answers) {
    var answersArray = [];
    for (var anime in answers) {
        answersArray.push([anime, answers[anime]]);
    }
    answersArray.sort(function(a, b) {
        return b[1] - a[1];
    });
    return answersArray;
}

function displayAnswerOccurence(answerArray, keyword) {
    for (var j = 0; j < 5; j++) {
        if (answerArray[j]) {
            document.getElementById(keyword + j).innerText = answerArray[j][0];
            document.getElementById(keyword + j + "Count").innerText = answerArray[j][1];
        }
        else {
            document.getElementById(keyword + j).innerText = "";
            document.getElementById(keyword + j + "Count").innerText = "";
        }
    }
}

function GetAnswerInformation() {
    let players = document.querySelectorAll('.qpAvatarCenterContainer');
    let correctPlayers = [];
    let currentSongAikatsuCount = 0;
    let currentSongStarmyuCount = 0;
    let currentSongPriparaCount = 0;
    let currentSongNoAnswerCount = 0;
    let currentSongOtherCount = 0;
    let currentSongInvalidCount = 0;
    let rightAnswers = {};
    let wrongAnswers = {};

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

        //if starting a new game, the player array needs to be restarted to accept clean information
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

        if(playerAnswer === "..."){
            currentSongNoAnswerCount++;
        }
        else {
            var animeIndex = getNameFromAnimeList(playerAnswer);
            //if name in songlist, file the name of the anime and add to its count
            if (animeIndex > -1){
                if (rightAnswer) {
                    incrementAnswerList(rightAnswers, animeIndex);
                }
                else {
                    incrementAnswerList(wrongAnswers, animeIndex);
                }
            }
            else {
                currentSongInvalidCount++;
            }
        }

        //Silly extra code to do with player answers
        currentSongAikatsuCount += answerTitleCounter(playerAnswer, "aikatsu");
        currentSongStarmyuCount += answerTitleCounter(playerAnswer, "starmyu");
        currentSongPriparaCount += answerTitleCounter(playerAnswer, "pripara") + answerTitleCounter(playerAnswer, "prism paradise");

        if (rightAnswer) {
            correctPlayers.push(players[i].querySelector('.qpAvatarNameContainer span').innerText);
        }
    }

    //Show Answer Breakdown
    var rightAnswersArray = sortAnswerOccurence(rightAnswers);
    var wrongAnswersArray = sortAnswerOccurence(wrongAnswers);
    displayAnswerOccurence(rightAnswersArray, "Correct");
    displayAnswerOccurence(wrongAnswersArray, "Wrong");
    if(wrongAnswersArray.length > 5) {
        for (var k = 5; k < wrongAnswersArray.length; k++) {
            currentSongOtherCount = currentSongOtherCount + wrongAnswersArray[k][1];
        }
    }

    document.querySelector('#OtherAnswer').innerText = 'Other';
    document.querySelector('#OtherCount').innerText = currentSongOtherCount;
    document.querySelector('#InvalidAnswer').innerText = 'Invalid Answers';
    document.querySelector('#InvalidAnswerCount').innerText = currentSongInvalidCount;
    document.querySelector('#NoAnswer').innerText = 'No Answer';
    document.querySelector('#NoAnswerCount').innerText = currentSongNoAnswerCount;

    //Update the cumulative totals for fun numbers
    aikatsuCounter += currentSongAikatsuCount;
    starmyuCounter += currentSongStarmyuCount;
    priparaCounter += currentSongPriparaCount;
    document.querySelector("#CurrentAikatsuAnswerCount").innerText = currentSongAikatsuCount;
    document.querySelector("#CurrentStarmyuAnswerCount").innerText = currentSongStarmyuCount;
    document.querySelector("#CurrentPriparaAnswerCount").innerText = currentSongPriparaCount;

    //Print the users who got the song right
    if (correctPlayers.length > 0 && songData.length) {
        document.querySelector("#correctPlayers").innerText = correctPlayers.join(' ');
        if (correctPlayers.length <= 5) {
            songData[songData.length-1].correctPlayers = correctPlayers;
            console.log(correctPlayers);
        }
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
    console.log(ranking);
}

function EndRoundStuff() {
    if(IfRoundIsOver()) {
        console.log("Aikatsu! Guess Count:" + aikatsuCounter);
        console.log("STARMYU Guess Count:" + starmyuCounter);
        console.log("Pripara Guess Count:" + priparaCounter);
        console.log("Average Score:" + GetAverageScore());
        for (var i = 0; i < scorePercentageCounter.length; i++) {
            console.log(i + '0-' + (i + 1) + '0%:' + scorePercentageCounter[i]);
        }
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
                updateUserCount();
				updateSongCounter();
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
    var activePlayers = document.querySelectorAll('#qpScoreBoardEntryContainer .qpStandingItem:not(.disabled)').length;
    var songLink = result.songInfo.urlMap.catbox ? result.songInfo.urlMap.catbox["0"] : '';
    var currentSongData = {
        animeEng: result.songInfo.animeNames.english,
        animeRomaji: result.songInfo.animeNames.romaji,
		songName: result.songInfo.songName,
		artist: result.songInfo.artist,
		type: convertSontTypeToText(result.songInfo.type, result.songInfo.typeNumber),
        correctCount: result.players.filter((player) => player.correct).length,
        startTime: quizVideoController.moePlayers[quizVideoController.currentMoePlayerId].startPoint, //quizVideoController seems to be a global variable that AMQ populateds to
        songDuration: quizVideoController.moePlayers[quizVideoController.currentMoePlayerId].$player.find("video")[0].duration,
        songNumber: parseInt(document.querySelector('#qpCurrentSongCount').innerText),
        activePlayerCount: activePlayers,
        LinkVideo: videoLink,
        LinkMp3: songLink
	}
	songData.push(currentSongData);

    //To avoid having songdata being lost because of various incidents, print it in the console after each guess
    var totalPlayers = result.players.length;
    console.log(currentSongData.animeEng + ': ' + currentSongData.artist + ' - ' + currentSongData.songName + ' (' + currentSongData.type + ') ' + currentSongData.correctCount + ' (' + Math.round(currentSongData.correctCount * 100/totalPlayers) + '%)');
}

// Put Song data in textarea and copy to clipboard
function CopySongData() {
    document.querySelector('#songDataHolder').value = JSON.stringify(songData, null, 2);
    document.querySelector('#songDataHolder').select();
    document.execCommand('copy');
}

function AddSongDataHolder() {
    var songDataHolder = document.createElement('textarea');
	songDataHolder.id = 'songDataHolder';
	document.querySelector("#gameChatPage").appendChild(songDataHolder);
    var songDataCopyButton = document.createElement('button');
    songDataCopyButton.id = 'copySongData'
    songDataCopyButton.innerHTML = 'Copy';
    document.querySelector("#gameChatPage").appendChild(songDataCopyButton);

    document.querySelector("#copySongData").addEventListener('click', function() {
        CopySongData();
    });
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
function StartGameCallback() {
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

function getSongList() {
    let retriveListListener = new Listener("get all song names", function (payload) {
        fullAnimeList = payload.names;
    }).bindListener();
}

function StartAmqScript() {
    //check if script is already running to avoid running it twice
    if (!document.querySelector('#SongCounter')) {
        console.log("HAI");
        getSongList();
        AddSongCounter();
        AddCorrectPlayersBox();
        AddPlayerInfoBox();
        ObserveAnswerShowing();
        SetupMirrorTimer();
        AddSecondarySongInfo();
        AddSongDataHolder();

        new Listener('Game Starting', function () {
            StartGameCallback();
        }).bindListener();

        new Listener("answer results", function (result) {
            secondSongCounterCallback(result);
        }).bindListener();

        new Listener("play next song", function (data) {
            previousSongClear();
        }).bindListener();
    }
}

document.querySelector("#mpPlayButton").addEventListener('click', function() {
    StartAmqScript();
});

document.querySelector("#mpRankedButton").addEventListener('click', function() {
    StartAmqScript();
});
