// ==UserScript==
// @name         AMQ-UI-Rearranger
// @namespace    https://github.com/blissfulyoshi
// @version      0.3.3
// @description  Create a Song Counter in AMQ
// @match        https://animemusicquiz.com/
// @grant        GM_xmlhttpRequest
// @connect      pastebin.com
// @require      https://raw.githubusercontent.com/blissfulyoshi/AMQ-UI-Rearranger/master/AmqUtilityFunctions.js
// @require      https://raw.githubusercontent.com/blissfulyoshi/AMQ-UI-Rearranger/master/PlayerInfoBox.js
// @require      https://raw.githubusercontent.com/blissfulyoshi/AMQ-UI-Rearranger/master/SongCounter.js
// @require      https://raw.githubusercontent.com/blissfulyoshi/AMQ-UI-Rearranger/master/SecondarySongInfo.js
// ==/UserScript==

var devKey = "pastebin_dev_key";
var userKey = "pastebin_user_key";

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
    let firstPlayerName = playerList[0].querySelector('.qpAvatarNameContainer span').innerText;
    let resetPlayerArray = firstSong || playerList.length !== answerInformation.length || (answerInformation[0].playerName !== firstPlayerName);
    if (resetPlayerArray) {
        let playerName = playerList[playerIndex].querySelector('.qpAvatarNameContainer span').innerText;
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
    let players = document.querySelectorAll('.qpAvatarCenterContainer');
  
    //check if the player array needs to be resetted for a new game
    //playerName check is a pretty safe check if you're moving inbetween games, but definitely not the most robust
    for (var i=0; i < players.length; i++) {
        let playerScore = parseInt(players[i].querySelector('.qpAvatarPointText').innerText);
        let onPlayerList = !players[i].querySelector('.qpAvatarStatus').classList.contains('hide');
        let playerAnswer = players[i].querySelector('.qpAvatarAnswerText').innerText;
        let rightAnswer = players[i].querySelector('.qpAvatarAnswerContainer').classList.contains('rightAnswer');

        playerScores[i] = playerScore;
        updatePlayerAnswerArray(i, players, playerScore, onPlayerList, playerAnswer, rightAnswer);
    }

    updateAnswerList();
    updateSongCounters();
    updateCorrectPlayers();
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

// Put Song data in textarea and copy to clipboard
function CopySongData() {
    document.querySelector('#songDataHolder').value = JSON.stringify(songData, null, 2);
    document.querySelector('#songDataHolder').select();
    document.execCommand('copy');
}

// Upload the song data and copy to clipboard
function UploadSongData() {
    //sketchy way to calculate ranked dates
    var offset = -6;
    var shouldBeSafeTimeForRankedDate = new Date( new Date().getTime() + offset * 3600 * 1000);
    var rankedLocation = shouldBeSafeTimeForRankedDate.getUTCHours() < 14 ? "Central" : "Western"
    var formattedRankedDate = shouldBeSafeTimeForRankedDate.toISOString().split('T')[0];
    var fileName = rankedLocation + " Ranked song List: " + formattedRankedDate;
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
			"&api_paste_code=" + JSON.stringify(songData, null, 2),
		onload:     function (response) {
            document.querySelector('#songDataHolder').value = response.response;
            document.querySelector('#songDataHolder').select();
            document.execCommand('copy');
            console.log(response.response);
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
    songDataUploadButton.id = 'uploadSongData'
    songDataUploadButton.innerHTML = 'Upload';
    document.querySelector("#gameChatPage").appendChild(songDataUploadButton);

    document.querySelector("#copySongData").addEventListener('click', function() {
        CopySongData();
    });

    document.querySelector("#uploadSongData").addEventListener('click', function() {
        UploadSongData();
    });
}

function secondSongCounterCallback(result) {
    copyToSecondarySongInfo(result);
    updateSongData(result);
    checkForSongType(result);
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

        //pastebin = window.open('https://pastebin.com', '_blank');
    }
}

document.querySelector("#mpPlayMultiplayer").addEventListener('click', function() {
    StartAmqScript();
});

document.querySelector("#mpPlaySolo").addEventListener('click', function() {
    StartAmqScript();
});

document.querySelector("#mpRankedButton").addEventListener('click', function() {
    StartAmqScript();
});
