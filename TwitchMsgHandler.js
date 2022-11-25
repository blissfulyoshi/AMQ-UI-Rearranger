// Copied from https://github.com/jimmycuadra/shellwords/blob/master/lib/shellwords.js
function shellWordScan(string, pattern, callback) {
    var match, result;
    result = "";
    while (string.length > 0) {
      match = string.match(pattern);
      if (match) {
        result += string.slice(0, match.index);
        result += callback(match);
        string = string.slice(match.index + match[0].length);
      } else {
        result += string;
        string = "";
      }
    }
    return result;
}

// Copied from https://github.com/jimmycuadra/shellwords/blob/master/lib/shellwords.js
function shellWordSplit(line) {
    var field, words;
    if (line == null) {
        line = "";
    }
    words = [];
    field = "";
    // Honestly no idea how this regex works
    shellWordScan(line, /\s*(?:([^\s\"]+)|'((?:[^\'\\]|\\.)*)'|"((?:[^\"\\]|\\.)*)"|(\\.?)|(\S))(\s|$)?/, function(match) {
        var dq, escape, garbage, raw, seperator, sq, word;
        raw = match[0], word = match[1], sq = match[2], dq = match[3], escape = match[4], garbage = match[5], seperator = match[6];
        if (garbage != null) {
            throw new Error("Unmatched quote");
        }
        field += word || (sq || dq || escape).replace(/\\(?=.)/, "");
        if (seperator != null) {
            words.push(field);
            return field = "";
        }
    });
    if (field) {
        words.push(field);
    }
    return words;
}

var percentileScoreboardCooldown = false;
var percentileRulesCooldown = false;

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commandName === '!h' || commandName === '!help') {
      client.say(target, 'Commands: !psb, !song (!s) || Arguments:  -num (-n), -songname (-sn), -artist (-sa), -anime (-an), -cat || Use Quotes if you need spaces');
  }
  else if (commandName.length == 1 && !isNaN(commandName)) {
	  recordGuesses(context['display-name'], commandName);
  }
  else if (commandName === '!psb') {
		if (!percentileScoreboardCooldown) {
			client.say(twitchChannel, 'The current percentile scoring is: ' + GetPercentileScoreboardString());
			percentileScoreboardCooldown = true
			setTimeout(() => {
              percentileScoreboardCooldown = false;
			}, (60 * 1000));
		}
  }
  else if (commandName === '!pggr') {
		if (!percentileRulesCooldown) {
			client.say(twitchChannel, "Welcome to the Percentile Guessing Game, where you can guess how well players in a lobby know a song. During a song's guessing phase, put a number between 0-9 where 0 means 0-10% of players will get it right, 1 means 10-20%, and 9 means 90%+. Each right answer will net you 1 point, and your total will be shown at the end of the round.");
			percentileRulesCooldown = true
			setTimeout(() => {
              percentileRulesCooldown = false;
			}, (240 * 1000));
		}
	  
  }
  else if (commandName === '!s' || commandName.startsWith('!s ') || commandName.startsWith('!song')) {
      if (songData.length) {
          var songNumber = songData.length; //default to the last song that played
          var arguments = shellWordSplit(commandName);
          var catbox = false;
          var urlLocation = 'MAL';
          var animeUrl = '';
          var filteredSongList = songData;

          // Handle command arguments
          if (arguments.length > 1) {
              for (var i = 1; i < arguments.length; i++) {
                  // Parse the argument and its value
                  var argument = arguments[i].toString().toLowerCase();
                  var argumentValue;
                  if (arguments.length > i + 1) {
                      argumentValue = arguments[i+1].toString().toLowerCase();
                  }

                  // Handle each argument
                  switch (argument) {
                      case 's': // session (which ranked session is this, not implemented yet as it needs a db)
                          break;
                      case '-n': //number
                      case '-num':
                          if (!isNaN(argumentValue)) {
                              songNumber = parseInt(argumentValue);
                          }

                          i++;
                          break;
                      case '-sn': //song name
                      case '-songname':
                          filteredSongList = filteredSongList.filter(song => song.songName.toString().toLowerCase().includes(argumentValue));
                          i++;
                          break;
                      case '-sa': // song artist
                      case '-artist': // song artist
                          filteredSongList = filteredSongList.filter(song => song.artist.toString().toLowerCase().includes(argumentValue));
                          i++;
                          break;
                      case '-an':
                      case '-anime':
                          filteredSongList = filteredSongList.filter(song => song.animeEng.toString().toLowerCase().includes(argumentValue) || song.animeRomaji.toString().includes(argumentValue));
                          i++;
                          break;
                      case '-cat':
                          catbox = true;
                          break;
                      case '-al': // anime link to select ann, mal, anilist arguments (not implemented yet)
                          break;
                      default:
                          break;
                  }
              }
          }

          //In the case that no filtering happened
          if (filteredSongList === songData) {
              filteredSongList = [songData[songNumber - 1]];
          }

          if (filteredSongList && filteredSongList.length > 0) {
              // Only get the first filtered song for now. (Probably set to loop it in the future)
              var selectedSong = filteredSongList[0];

              //Get the url for the anime series
              if (urlLocation === 'ANN') {
                  animeUrl = ' (https://www.animenewsnetwork.com/encyclopedia/anime.php?id=' + selectedSong.annId + ')';
              }
              else if(urlLocation == "MAL") {
                  var malId = selectedSong.malId
                  animeUrl = ' (https://myanimelist.net/anime/' + malId + ')';
              }

              if (catbox) {
                  client.say(target, 'Song ' + selectedSong.songNumber + ' catbox link is ' + selectedSong.LinkMp3);
              }
              else {
                  client.say(target, 'Song ' + selectedSong.songNumber + ': ' + selectedSong.songName + ' by ' + selectedSong.artist + ' from ' + selectedSong.animeEng + animeUrl + ' started at ' + timeFormat(selectedSong.startTime) + ' and ' + selectedSong.correctCount + '/' + selectedSong.activePlayerCount + ' got it correct');
              }
          }
          else {
              client.say(target, 'No songs have played with those values');
          }
      }
      else {
          client.say(target, 'No songs have played');
      }
  }
}

// Convert time in seconds to 0:00
function timeFormat(duration)
{
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    ret += mins + ":" + (secs < 10 ? "0" : "");
    ret += secs;
    return ret;
}

let currentPercentileGuesses = {}
let percentileScoreboard = {}

function recordGuesses(submitter, response) {
	currentPercentileGuesses[submitter] = response;
}

function evaluateGuesses(answer) {
	var correctAnswerers = [];
	if (!Object.keys(currentPercentileGuesses).length) {
		return;
	}
	
	// Check all of the guesses to see who got it right
	for (const submitter in currentPercentileGuesses) {
		hasGuesses = true;
		if (currentPercentileGuesses[submitter] === answer.toString()) {
			// Give a point to the answerer and add them to the list to congratulate
			if (percentileScoreboard[submitter]) {
				percentileScoreboard[submitter]++
			}
			else {
				percentileScoreboard[submitter] = 1;
			}
			
			correctAnswerers.push(submitter);
		}
	}
	
	if (correctAnswerers.length === 0) {
		// Verify that round of guessing is over and no one got it right
		client.say(twitchChannel, 'No one guessed the percentile correctly');
	}
	else {
		// Congratulate those who got it right
		client.say(twitchChannel, 'Congratulations to ' + correctAnswerers.join(', ') + ' for guessing the percentile correctly');
	}
}

// Clear the guesses
function clearGuesses() {
	currentPercentileGuesses = {};
}

// Clear the percentile scoreboard
function clearPercentileScoreboard() {
	percentileScoreboard = {};
}

function welcomePercentileGame() {
	client.say(twitchChannel, 'The Percentile Guessing Game has started, type !pggr for more information.');
}

// Print the final scoreboard for the percentile guesses
function printFinalPercentileScoreboard() {
	if (percentileScoreboard.length > 0) {
		client.say(twitchChannel, 'Final percentile scoring is: ' + GetPercentileScoreboardString());
	}
}

// Calculate the scoreboard text
function GetPercentileScoreboardString() {
	var sortedScoreboard = [];	
	for (var submitter in percentileScoreboard) {
		sortedScoreboard.push([submitter, percentileScoreboard[submitter]]);
	}
	
	// End the function if no one is on the scoreboard
	if (sortedScoreboard.length === 0) {
		return;
	}

	sortedScoreboard.sort(function(a, b) {
		return b[1] - a[1];
	});
	
	var printedScoreBoard = "";
	for (var i = 0; i < sortedScoreboard.length; i++) {
		printedScoreBoard = printedScoreBoard + (i +1) + ": " + sortedScoreboard[i][0] + '(' + sortedScoreboard[i][1] + ')' + ', ';
	}
	
	return printedScoreBoard;
}
