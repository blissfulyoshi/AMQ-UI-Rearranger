// Upload the song data
function UploadSongData() {
    var gistSongDataSubmissionRequest = UploadSongDataGist();
    gistSongDataSubmissionRequest.done(function (songDataResponse) {
        //save the url to the global variable to be able to fetch the JSON by button click
        rankedJsonUrl = songDataResponse.html_url;

        // write the url to chat
        client.say(twitchChannel, `Ranked song data: ` + rankedJsonUrl);
		
		// Write misc stuff to chat
		client.say(twitchChannel, `All song data: https://docs.google.com/spreadsheets/d/1g0jW7k-GJiHueQ0ZVYe4WilupnUkBYLVlbB9GEdqQ98/edit?usp=sharing`);
		client.say(twitchChannel, `VODs: https://www.youtube.com/user/blissfulyoshi/videos`);

        UploadGistUrlToSheets(rankedJsonUrl)
    });
}

function UploadSongDataGist(){
	//way to calculate ranked that works for me
    var shouldBeSafeTimeForRankedDate = new Date();
    var rankedLocation = getRankedLocation(false);
    var formattedRankedDate = shouldBeSafeTimeForRankedDate.toISOString().split('T')[0];
    var songDataFileName = rankedLocation + " Ranked Song List: " + formattedRankedDate + ".json";
    var summaryFileName = rankedLocation + " Ranked Summary: " + formattedRankedDate + ".txt";

    //To get a custom fileName, decare the object first and then edit it like a normal js object
    var gistData = {
        'public': true,
		'files': {}
    }
	gistData.files[songDataFileName] = {"content":JSON.stringify(songData, null, 2)};
    gistData.files[summaryFileName] = {"content":GetEndGameSummary()};
    var githubGistUrl = 'https://api.github.com/gists';
    var gistSongDataSubmissionRequest = $.ajax({
        url: githubGistUrl,
        type: 'POST',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", 'token ' + githubToken);
        },
        data: JSON.stringify(gistData)
    });
}

//Save the gist url to gdocs
//partially copied from https://github.com/YokipiPublic/AMQ/blob/master/FTFRemoteUpdate.user.js
function UploadGistUrlToSheets(urlToUpload) {
	var data = {jsonUrl: urlToUpload};
	var url = gSheetUrl;
	var submitRequest = $.ajax({
		url: url,
		type: "post",
		data: data
	});

	submitRequest.done(function (response) {
		if (response.result == "ERROR") {
			console.log("Rejected by GAS.");
			console.error(response);
		} else {
			console.log("Submission attempt successful!");
		}
	});

	submitRequest.fail(function (jqXHR, textStatus, errorThrown) {
		console.error("Submission attempt failed: " + textStatus, errorThrown);
	});
}