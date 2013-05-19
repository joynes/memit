function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}
data = null;
app = getURLParameter("app");
dataPath = app + "/data.js";
$.getScript(dataPath, function () {
	stringsPath = app + "/strings.js";
	$.getScript(stringsPath, function () {
		
		$("#practice").click(practice);
		$("#guess").click(playGrid);
		$("#take10").click({"count": 10}, play);
		$("#exam").click({"count": dataFull.length}, play);
		$("#inputtext").submit(playValidate);

		score = 0;
		$("#description").text(descrtext);
		$("#image").replaceWith('<img id="image" src="' + app + "/" + startImage + '" class="centerImage">');


	});
});

function init() {
	score = 0;
	dataIndex = 0;
	data = [].concat(dataFull);
	data.sort(function() { return 0.5 - Math.random(); });
	$("#inputtext").addClass("hidden");
	$("#score").addClass("hidden");
	$("#playgrid").addClass("hidden");

	$("#image").removeClass("centerImage").addClass("hidden");
}

function practice() {
	init();
	// Load next image and a name
	practiceNext();

}

function practiceNext() {
	if (dataIndex < data.length) {
		$("#description").text(nextItem + '[' + dataIndex + ']');

		$("#image").replaceWith('<img id="image" src="' + app + "/" + data[dataIndex][1] + '" class="centerImage">');
		$("#name").text(data[dataIndex][0]);

		dataIndex++;
		$("#image").click(practiceNext);
	}
	else {
		alert("End of practice");
	}
}

function playGrid() {
	init();
	data = data.slice(0, 10);
	$("#playgrid").removeClass("hidden");
	playGridNext();
}

function playGridNext() {
	if (dataIndex < data.length) {
		$("#description").text('Click on the image that corresponds to text' + '[' + dataIndex + ']');
		$("#name").text(data[dataIndex][0]);

		gridData = [].concat(data);
		// remove the correct item to not get duplicates
		gridData.splice(dataIndex, dataIndex + 1);
		gridData.sort(function() { return 0.5 - Math.random(); });

		correct = Math.floor(Math.random() * 6);

		for (i = 0; i < 6; i++) {
			if (i == correct) image = data[dataIndex][1];
			else image = gridData[i][1];

			$("#grid" + i).removeClass('redBorder');
			$("#grid" + i).addClass('blackBorder');
			$("#grid" + i).attr("src", app + "/" + image);
			$("#grid" + i).off('click');
			$("#grid" + i).click({"choice": i, "correct": correct}, validatePlayGrid);
		}
	}
	else {
		alert("Done! Your score is " + score + '/' + data.length);
	}
}

function validatePlayGrid(event) {
	if (event.data.choice == event.data.correct) {
		score++;
		$("#score").replaceWith('<p id="score" class="success" style="text-align:center">CORRECT! score: ' + score + '/' + data.length + '</p>');
		dataIndex++;
		playGridNext();
	}
	else {
		$("#score").replaceWith('<p id="score" class="wrong" style="text-align:center">WRONG! Click on correct answer!');
		$("#grid" + event.data.choice).removeClass('blackBorder');
		$("#grid" + event.data.choice).addClass('redBorder');
		score--;
	}
}

function play(event) {
	init();
	data = data.splice(0, event.data.count);
	$("#name").text("");
	$("#inputtext").removeClass("hidden");
	$("#score").removeClass("hidden");
	$("#score").text("");

	$("input").focus();
	// Load next question
	playNext();
}

function playNext() {
	if (dataIndex < data.length) {
		$("#description").text(enterName + ' ' + dataIndex);
		$("#image").replaceWith('<img id="image" src="' + app + "/" + data[dataIndex][1] + '" class="centerImage">');
	}
	else {
		if (score == data.length) {
			alert(perfectScore);
		}
		else {
			alert(finishGame + score + "!");
		}
	}
}

function playValidate() {
	answer = $("input").val().toLowerCase().replace(" ", "");
	correct = data[dataIndex][0].toLowerCase().replace(" ", "");
	if (answer == correct) {
		score++;
		$("#score").replaceWith('<p id="score" class="success" style="text-align:center">CORRECT! score: ' + score.toFixed(2)+ '/' + data.length + '</p>');
		dataIndex++;
	}
	else {
		// use levenshtein to check if there should be any points
		distance = levenshtein(correct, answer);
		points = 0.0;
		extra = "";
		if (distance < correct.length) {
			points = 1 - distance / correct.length;
			if (points < 0.5) points = 0;
			else extra = "Points for similarity: " + points.toFixed(2);
		}
		$("#score").replaceWith('<p id="score" class="wrong" style="text-align:center">Your answer: ' + $("input").val() + '<br>Correct answer: ' + data[dataIndex][0] + '<br>Rewrite it!' + extra + '</p>');
		score = score + points - 1;
	}
	$("input[type='text']").val('');
	playNext();
	return false;
}
