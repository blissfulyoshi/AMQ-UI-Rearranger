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

function clearSongCounterAfterPrevSong() {
	document.querySelector('#CurrentStarmyuAnswerCount').innerText = '0';
	document.querySelector('#CurrentAikatsuAnswerCount').innerText = '0';
	document.querySelector('#CurrentPriparaAnswerCount').innerText = '0';
    document.querySelector('#CurrentAvgScore').innerText = '0';
}