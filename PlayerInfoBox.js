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

function clearAnsSumBoxAfterPrevSong() {
    displayAnswerOccurence([], "Correct");
    displayAnswerOccurence([], "Wrong");
    document.querySelector('#OtherAnswer').innerText = '';
    document.querySelector('#OtherCount').innerText = '';
    document.querySelector('#InvalidAnswer').innerText = '';
    document.querySelector('#InvalidAnswerCount').innerText = '';
    document.querySelector('#NoAnswer').innerText = '';
    document.querySelector('#NoAnswerCount').innerText = '';
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