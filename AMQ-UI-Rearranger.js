// ==UserScript==
// @name         AMQ-UI-Rearranger
// @namespace    https://github.com/blissfulyoshi
// @version      0.4.2
// @description  Create a Song Counter in AMQ
// @match        https://animemusicquiz.com/
// @grant        GM_xmlhttpRequest
// @connect      pastebin.com
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @require      https://raw.githubusercontent.com/blissfulyoshi/AMQ-UI-Rearranger/master/AmqUtilityFunctions.js
// @require      https://raw.githubusercontent.com/blissfulyoshi/AMQ-UI-Rearranger/master/PlayerInfoBox.js
// @require      https://raw.githubusercontent.com/blissfulyoshi/AMQ-UI-Rearranger/master/SongCounter.js
// @require      https://raw.githubusercontent.com/blissfulyoshi/AMQ-UI-Rearranger/master/SecondarySongInfo.js
// ==/UserScript==

var devKey = "pastebin_dev_key";
var userKey = "pastebin_user_key";
var gSheetUrl = "google_sheets_script_url";
var debugMode = false;

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
var pastebinUrl = '';

//separate array to track player scores only so I don't have to sort an array
var playerScores = [];

function debugLog(text) {
    if (debugMode) {
        console.log(text)
    }
}

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
    updateSongCounter(openingCounter, endingCounter, insertCounter, priparaCounter, aikatsuCounter, starmyuCounter, scorePercentageCounter);
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
function previousSongClear() {
    clearSongCounterAfterPrevSong();
    document.querySelector('#correctPlayers').innerText = '';
    clearAnsSumBoxAfterPrevSong();
}

function updateUserCount() {
	var correctCount = document.querySelectorAll('.qpAvatarAnswerContainer .rightAnswer').length;
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

function updatePlayerAnswerArray(playerIndex, playerList, playerScore, onPlayerList, playerAnswer, rightAnswer) {
    //if starting a new game, the player array needs to be restarted to accept clean information

    let firstSong = parseInt(document.querySelector('#qpCurrentSongCount').innerText) === 1;
    let firstPlayerName = playerList[0].querySelector('.qpAvatarName').innerText;
    let resetPlayerArray = firstSong || playerList.length !== answerInformation.length || (answerInformation[0].playerName !== firstPlayerName);
    if (resetPlayerArray) {
        let playerName = playerList[playerIndex].querySelector('.qpAvatarName').innerText;
        answerInformation[playerIndex] = {
            playerName: playerName,
            playerScore: playerScore,
            onPlayerList: [onPlayerList],
            playerAnswer: [playerAnswer],
            rightAnswer: [rightAnswer]
        }
    }
    else {
        answerInformation[playerIndex].playerScore = playerScore;
        answerInformation[playerIndex].onPlayerList.push(onPlayerList);
        answerInformation[playerIndex].playerAnswer.push(playerAnswer);
        answerInformation[playerIndex].rightAnswer.push(rightAnswer);
    }
}

function SongTypeRig() {
    return {
        rig: 0,
        correctRig:0,
        correctNonRig: 0,
        wrongNonRig: 0
    }
}

function calculatePlayerRigDetails(){
    var roomName = document.getElementById('mhRoomNameInput').value
    if (roomName !== 'Ranked'){
		for (var j = 0; j < answerInformation.length; j++) {
			var playerName = answerInformation[j].playerName;
			var openings = SongTypeRig();
			var endings = SongTypeRig();
			var inserts = SongTypeRig();
			for (var i = 0; i < songData.length; i++) {
				var rig = answerInformation[j].onPlayerList[i]
				var correct = answerInformation[j].rightAnswer[i]

				if (songData[i].type.includes("Opening")) {
					updateRigData(openings, rig, correct)
				}
				else if (songData[i].type.includes("Ending")) {
					updateRigData(endings, rig, correct)
				}
				else if (songData[i].type.includes("Insert")) {
					updateRigData(inserts, rig, correct)
				}
			}
			updateRigTable(playerName, openings, endings, inserts);
		}
	}
}

function createRigTable(){
    var roomName = document.getElementById('mhRoomNameInput').value;
    if (roomName === 'Ranked'){
        return;
    }

	if (!document.getElementById('rigTrackingHeader')) {
		var standingsContainer = document.getElementById('qpStandingContainer').children[0];

		var rigHeaders = ['Total', 'Openings', 'Endings', 'Inserts'];
		for (var i = 0; i < 4; i++) {
			var rigHeader = document.createElement('div');
			rigHeader.innerText = rigHeaders[i];
			standingsContainer.append(rigHeader);
		}

		var headerRow = document.createElement('div');
		var fillerDiv = document.createElement('div');
		headerRow.append(fillerDiv);
		headerRow.id = "rigTrackingHeader"

		var rigTitles = ['R', 'RC', 'NC', 'NW'];
		for (i = 0; i < 4; i++) {
			for (var j = 0; j < 4; j++) {
				var rigTitle = document.createElement('div');
				rigTitle.innerText = rigTitles[j];
				headerRow.append(rigTitle);
			}
		}

        standingsContainer.append(headerRow);
	}

	if (!document.getElementById('rigExplanationContainer')) {
		var centerContainer = document.getElementById('qpAnimeCenterContainer');
        var rigExplanation = `
			<div class="row">
				<h5>R</h5>
				<p>Rig</p>
			</div>
			<div class="row">
				<h5>RC</h5>
				<p>Rig Correct</p>
			</div>
			<div class="row">
				<h5>NC</h5>
				<p>Nonrig Correct</p>
			</div>
			<div class="row">
				<h5>NW</h5>
				<p>Nonrig Wrong</p>
			</div>`;

        var rigExplanationContainer = document.createElement('div');
	    rigExplanationContainer.id = 'rigExplanationContainer';
	    rigExplanationContainer.innerHTML = rigExplanation;
        centerContainer.append(rigExplanationContainer);
	}

	var players = document.querySelectorAll('.qpStandingItem');
	for (j = 0; j < players.length; j++) {
		//Add the 4*4 fields needed for the rig table
		for (i = 0; i < 16; i++) {
			var rig = document.createElement('div');
			rig.innerText = '0';
			players[j].append(rig);
		}
    }
}

function updateRigQuadrant(player, songTypeRig, typeMultiplier){
    //Add 2 to account for the 2 nodes that start of the row
    player.children[typeMultiplier * 4 + 2].innerText = songTypeRig.rig;
    player.children[typeMultiplier * 4 + 3].innerText = songTypeRig.correctRig;
    player.children[typeMultiplier * 4 + 4].innerText = songTypeRig.correctNonRig;
    player.children[typeMultiplier * 4 + 5].innerText = songTypeRig.wrongNonRig;
}

function updateRigTable(playerName, openings, endings, inserts) {
    //check to see if the rig table exists
    if (document.querySelector('.qpStandingItem').children.length < 3) {
        createRigTable()
    }

    var playerList = document.querySelectorAll('.qpsPlayerName');
    var player;
    for (var i = 0; i < playerList.length; i++) {
        if (playerList[i].innerText == playerName) {
            player = playerList[i].parentElement.parentElement.parentElement;
            break;
        }
    }
    var total = SongTypeRig();
    total.rig = openings.rig + endings.rig + inserts.rig;
    total.correctRig = openings.correctRig + endings.correctRig + inserts.correctRig;
    total.correctNonRig = openings.correctNonRig + endings.correctNonRig + inserts.correctNonRig;
    total.wrongNonRig = openings.wrongNonRig + endings.wrongNonRig + inserts.wrongNonRig;
    updateRigQuadrant(player, total, 0);
    updateRigQuadrant(player, openings, 1);
    updateRigQuadrant(player, endings, 2);
    updateRigQuadrant(player, inserts, 3);
}

function updateRigData(rigData, rig, correct) {
    if (rig) {
        rigData.rig++;
        if (correct) {
            rigData.correctRig ++;
        }
    }
    else{
        if (correct) {
            rigData.correctNonRig ++;
        }
        else {
            rigData.wrongNonRig ++;
        }
    }
}

function updateAnswerList() {
    let currentSongNoAnswerCount = 0;
    let currentSongOtherCount = 0;
    let currentSongInvalidCount = 0;
    let rightAnswers = {};
    let wrongAnswers = {};

    for (var i=0; i < answerInformation.length; i++) {
        let playerAnswerList = answerInformation[i].playerAnswer
        let playerAnswer = playerAnswerList[playerAnswerList.length - 1];
        let rightAnswer = answerInformation[i].rightAnswer[playerAnswerList.length - 1];

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

    debugLog("right answers: " + JSON.stringify(rightAnswersArray));
    debugLog("wrong answers: " + JSON.stringify(wrongAnswersArray));

    document.querySelector('#OtherAnswer').innerText = 'Other';
    document.querySelector('#OtherCount').innerText = currentSongOtherCount;
    document.querySelector('#InvalidAnswer').innerText = 'Invalid Answers';
    document.querySelector('#InvalidAnswerCount').innerText = currentSongInvalidCount;
    document.querySelector('#NoAnswer').innerText = 'No Answer';
    document.querySelector('#NoAnswerCount').innerText = currentSongNoAnswerCount;
}

function updateSongCounters() {
    let currentSongAikatsuCount = 0;
    let currentSongStarmyuCount = 0;
    let currentSongPriparaCount = 0;

    for (var i=0; i < answerInformation.length; i++) {
        let playerAnswerList = answerInformation[i].playerAnswer
        let playerAnswer = playerAnswerList[playerAnswerList.length - 1];

        //Silly extra code to do with player answers
        currentSongAikatsuCount += answerTitleCounter(playerAnswer, "aikatsu");
        currentSongStarmyuCount += answerTitleCounter(playerAnswer, "starmyu");
        currentSongPriparaCount += answerTitleCounter(playerAnswer, "pripara") + answerTitleCounter(playerAnswer, "prism paradise");
    }

    //Update the cumulative totals for fun numbers
    aikatsuCounter += currentSongAikatsuCount;
    starmyuCounter += currentSongStarmyuCount;
    priparaCounter += currentSongPriparaCount;
    document.querySelector("#CurrentAikatsuAnswerCount").innerText = currentSongAikatsuCount;
    document.querySelector("#CurrentStarmyuAnswerCount").innerText = currentSongStarmyuCount;
    document.querySelector("#CurrentPriparaAnswerCount").innerText = currentSongPriparaCount;
}

function updateCorrectPlayers() {
    let correctPlayers = [];

    for (var i=0; i < answerInformation.length; i++) {
        let playerAnswerList = answerInformation[i].playerAnswer
        let rightAnswer = answerInformation[i].rightAnswer[playerAnswerList.length - 1];

        if (rightAnswer) {
            correctPlayers.push(answerInformation[i].playerName);
        }
    }

    //Print the users who got the song right
    if (correctPlayers.length > 0 && songData.length) {
        document.querySelector("#correctPlayers").innerText = correctPlayers.join(' ');
        if (correctPlayers.length <= 5) {
            songData[songData.length-1].correctPlayers = correctPlayers;
            console.log(correctPlayers);
        }
    }
}

function GetAnswerInformation() {
    let players = document.querySelectorAll('.qpAvatarContainerOuter');

    //check if the player array needs to be resetted for a new game
    //playerName check is a pretty safe check if you're moving inbetween games, but definitely not the most robust
    for (var i=0; i < players.length; i++) {
        let playerScore = parseInt(players[i].querySelector('.qpAvatarScore').innerText);
        let onPlayerList = !players[i].querySelector('.qpAvatarStatusInnerContainer').classList.contains('hide');
        let playerAnswer = players[i].querySelector('.qpAvatarAnswerText').innerText;
        let rightAnswer = players[i].querySelector('.qpAvatarAnswerText').classList.contains('rightAnswer');

        playerScores[i] = playerScore;
        updatePlayerAnswerArray(i, players, playerScore, onPlayerList, playerAnswer, rightAnswer);
    }

    debugLog("recorded players (all players in the game should be here):" + JSON.stringify(players));
    debugLog("recorded answers (all answer information should be here):" + JSON.stringify(answerInformation));

    updateAnswerList();
    updateSongCounters();
    updateCorrectPlayers();
    calculatePlayerRigDetails();
}

function GetRig(playerInformation) {
    return playerInformation.onPlayerList.filter(rig => rig === true).length;
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
        //If ranked, automatically upload song data
        var roomName = document.getElementById('mhRoomNameInput').value
        if (roomName === 'Ranked'){
            UploadSongData();
        }

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

const SongCounterCallback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
        if (mutation.type === 'attributes') {
			if (document.querySelector('#qpAnimeNameHider').classList.contains('hide'))
			{
                debugLog("Song Counter started");
                GetAnswerInformation();
                updateUserCount();
				updateSongCounter(openingCounter, endingCounter, insertCounter, priparaCounter, aikatsuCounter, starmyuCounter, scorePercentageCounter);
                EndRoundStuff();
			}
        }
    }
};

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
		type: convertSongTypeToText(result.songInfo.type, result.songInfo.typeNumber),
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

//Experimental way to get mal links
function GetMalLink(result){
    var animeName = result.songInfo.animeNames.english;
    var urlEncodedAnimeName = encodeURIComponent(animeName);
    GM_xmlhttpRequest({
		method: "GET",
		url: "https://api.myanimelist.net/v2/anime" + '?q=' + urlEncodedAnimeName + '&limit=1',
		headers: {
			"Authorization": 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjYwYTU5ZDMwOWMwMTRmNmUwOTgyYWIxM2E2MDI2Mjk2YjBjYmE5OTA1MzAwZjEzY2Q0NDc1MjM3NzAyNmI0MmM4NmM3YzE5NDk3ZTc3NDI5In0.eyJhdWQiOiIyMTVkM2U4YTVlNjQ2OGZiYTdlNjlmMmNkYWNjYTZiMiIsImp0aSI6IjYwYTU5ZDMwOWMwMTRmNmUwOTgyYWIxM2E2MDI2Mjk2YjBjYmE5OTA1MzAwZjEzY2Q0NDc1MjM3NzAyNmI0MmM4NmM3YzE5NDk3ZTc3NDI5IiwiaWF0IjoxNjA0ODc1MDQ0LCJuYmYiOjE2MDQ4NzUwNDQsImV4cCI6MTYwNzQ2NzA0NCwic3ViIjoiNDkwOTc2Iiwic2NvcGVzIjpbXX0.HsL19WpVgpJ4TFsV_Phv--5IwlK9ufoyU8FaTshjhIQ8puebE19iRSeb7DCigl1JP7X_AMIHIFjioIpD1HC8dNHoS1Xb_ESh90yIOfOIgMyqFHiFXiqACfiwLmUPCqfyMCscxOgBQDa81TORCrKAy36aiFdF-07N-BSyBfK2ZY5XJWPIZbwybOEXoecg9eEGaX1YotTdTPhBU4_LAqU9RhQBit_F5XoJtJXkPyiZijrSyMQHtO2rT0JbQzk8BQhu8u4oxIB75rqdrNN5Bkyxy79cKh3gLyqZRrJJlCPFPFIOoevOJIYqhg35hDR-XiFxU-QrmBbUUkQ7xCMPPX7-IA'
		},
		//data: "q=" + 'black rock' +
		//	"&limit=" + '1',
		onload:     function (response) {
            var results = JSON.parse(response.response)
            if (results.data) {
                var id = results.data[0].node.id
                console.log('https://myanimelist.net/anime/' + id)
            }
        }
    });
}

// Put Song data in textarea and copy to clipboard
function CopySongData() {
    document.querySelector('#songDataHolder').value = JSON.stringify(songData, null, 2);
    document.querySelector('#songDataHolder').select();
    document.execCommand('copy');
}

// Upload the song data and copy to clipboard
function UploadSongData() {
    //sketchy way to calculate ranked dates
    var offset = -7;
    var shouldBeSafeTimeForRankedDate = new Date( new Date().getTime() + offset * 3600 * 1000);
    var rankedLocation = shouldBeSafeTimeForRankedDate.getUTCHours() < 15 ? "Central" : "Western"
    var formattedRankedDate = shouldBeSafeTimeForRankedDate.toISOString().split('T')[0];
    var fileName = rankedLocation + " Ranked Song List: " + encodeURIComponent(formattedRankedDate);
    GM_xmlhttpRequest({
		method: "POST",
		url: "https://pastebin.com/api/api_post.php",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		data: "api_dev_key=" + devKey +
			"&api_user_key=" + userKey +
			"&api_option=paste" +
			"&api_paste_private=0" +
			"&api_paste_name=" + fileName +
			"&api_paste_expire_date=N" +
			"&api_paste_format=json" +
			"&api_paste_code=" + encodeURIComponent(JSON.stringify(songData, null, 2)),
		onload:     function (response) {
            pastebinUrl = response.response;

            //Save the pastebin to gdocs
            //Use jquery's ajax because GM_xmlhttpRequest only handles text and jquery is available
            //partially copied from https://github.com/YokipiPublic/AMQ/blob/master/FTFRemoteUpdate.user.js
            var data = {jsonUrl: response.response};
            var url = gSheetUrl;
            var submitRequest = $.ajax({
                url: url,
                type: "post",
                data: data
            });

            // Callback handler that will be called on success
            submitRequest.done(function (response, textStatus, jqXHR) {
                if (response.result == "ERROR") {
                    console.log("Rejected by GAS.");
                    console.error(response);
                } else {
                    console.log("Submission attempt successful!");
                }
            });

            // Callback handler that will be called on failure
            submitRequest.fail(function (jqXHR, textStatus, errorThrown) {
                console.error("Submission attempt failed: " + textStatus, errorThrown);
            });
        }
    });
}

function AddSongDataHolder() {
    var songDataHolder = document.createElement('textarea');
	songDataHolder.id = 'songDataHolder';
	document.querySelector("#gameChatPage").appendChild(songDataHolder);
    var songDataCopyButton = document.createElement('button');
    songDataCopyButton.id = 'copySongData'
    songDataCopyButton.innerHTML = 'Copy';
    document.querySelector("#gameChatPage").appendChild(songDataCopyButton);
    var songDataUploadButton = document.createElement('button');
    songDataUploadButton.id = 'getPastebinUrl'
    songDataUploadButton.innerHTML = 'Pastebin Url';
    document.querySelector("#gameChatPage").appendChild(songDataUploadButton);

    document.querySelector("#copySongData").addEventListener('click', function() {
        CopySongData();
    });

    document.querySelector("#getPastebinUrl").addEventListener('click', function() {
        //save the pastebin to clipboard
        document.querySelector('#songDataHolder').value = pastebinUrl;
        document.querySelector('#songDataHolder').select();
        document.execCommand('copy');
    });
}

function secondSongCounterCallback(result) {
    copyToSecondarySongInfo(result);
    updateSongData(result);
    checkForSongType(result);
    afkKicker.resetTimers();
    //GetMalLink(result);
};

function MirrorTimerText() {
	var timerText = document.querySelector('#qpHiderText').innerText;
    document.querySelector('#qpAnimeNameHider').innerText = timerText
}

// Mutation Observer for countdown timer dropping
const CountodwnChangeCallback = function(mutationsList, observer) {
	MirrorTimerText();
};

// Things to run at the start of the game
function StartGameCallback() {
	// updateSongCounterLabels();
    ResetSongCounter();
    setTimeout(function(){
        createRigTable();
    }, 1000);
    setTimeout(function(){ //Update dropdownlist autocomplete list. Beware, it doesn't work
        quiz.answerInput.autoCompleteController.updateList();
    }, 10000);
    setTimeout(function(){ //Automatically select box 1 of the avatars
        quiz.scoreboard.setActiveGroup("1")
        quiz.avatarContainer.currentGroup = 1
    }, 30000);
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
        if (payload.names && payload.names.length > 0) {
            fullAnimeList = payload.names;
        }
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

new Listener('Host Game', function () {
    StartAmqScript();

}).bindListener();

new Listener('Join Game', function () {
    StartAmqScript();
}).bindListener();

new Listener('Spectate Game', function () {
    StartAmqScript();
}).bindListener();
