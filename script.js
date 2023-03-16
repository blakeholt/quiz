// Get a reference to the "Load" button
const loadButton = document.getElementById('load-button');

let params = (new URL(document.location)).searchParams;

var debugMode = params.get("debug");

// Add an event listener for the "click" event
loadButton.addEventListener('click', event => {
    // Get the selected quiz number from the combo box
    const quizSelect = document.getElementById('quiz-select');
    const quizNumber = quizSelect.value;

    if (document.querySelector("#quiz").classList.contains("hidden"))
        document.querySelector("#quiz").classList.remove("hidden");

    if (document.getElementById('submit-button').classList.contains("hidden"))
        document.getElementById('submit-button').classList.remove("hidden");

    if (document.getElementById("results"))
        document.getElementById("results").innerHTML = "";

    // Load the quiz data from the corresponding file
    fetch(`${quizNumber}.json`)
        .then(response => response.json())
        .then(data => {
            // Clear any existing quiz questions
            const quizDiv = document.getElementById('quiz');
            quizDiv.innerHTML = '';
            let i = 0;
            //document.getElementById("quiz-title").innerHTML = "Quiz (" + data.length + " Questions)";

            // Display the quiz questions
            data.forEach(question => {
                console.log(question);
                const quizDiv = document.getElementById('quiz');
                const questionDiv = document.createElement('div');

                questionDiv.innerHTML = returnPretty(question);

                /*
                                    questionDiv.innerHTML = `
                    <h2>${(debugMode) ? question.answer : ""}     ${question.text}</h2>
                    <ul id="q-options" msg="${question.text}">
                        ${question.options.map((option, index) => `
                            
                                <input name="question-${question.number}" type="radio" id="question-${question.number}-option-${index}${isCorrect(question.answer, option)}" ${(debugMode && isCorrect(question.answer, option) == " correct") ? "checked='true'": ""} value="${option}">
                                <label for="question-${question.number}-option-${index}">${option}</label><br>
                            
                        `).join('')}
                    </ul>
                `;*/
                quizDiv.appendChild(questionDiv);
            });
            updateToast(event);
        });
});

// Add an event listener for the "click" event
document.getElementById('submit-button').addEventListener('click', OnClickSubmit);

const inputs = document.querySelectorAll('#q-options');

inputs.forEach(input => {
    input.addEventListener('click', updateToast);
});

// Functions

function isCorrect(answer, option) {
    return (answer.charAt(0).toLowerCase() == option.charAt(0).toLowerCase()) ? " correct" : "";
}

function OnClickSubmit(event) {


    let missingAnswers = [];
    var incorrectAnswers = [];
    var questionString = "";

    const inputs = document.querySelectorAll('#q-options');

    inputs.forEach(input => {
        checked = false;
        input.querySelectorAll('input').forEach(y => {
            if (y.checked) checked = true;
            else questionString = y.name;
        });
        if (!checked) {
            missingAnswers.push(questionString.charAt(0).toUpperCase() + questionString.slice(1).replace("-", " "));
        }
    });

    if (missingAnswers.length > 0) {
        alert('Please answer all of the questions before submitting.');
        return;
    }

    document.getElementById('submit-button').classList.add("hidden");

    // Tally up the correct answers
    let correct = 0;
    var qCorrect = false;
    var selected = "";
    var answer = "";
    inputs.forEach(input => {
        qCorrect = false;
        input.querySelectorAll('input').forEach(y => {
            if (y.checked) {
                selected = y.value;
            }
            if (y.id.includes("correct")) {
                answer = y.value;
            }
            questionString = y.name;
            if (y.checked && y.id.includes("correct")) {
                qCorrect = true;
                correct++;
            }
        });


        incorrectAnswers.push({
            question: questionString.charAt(0).toUpperCase() + questionString.slice(1).replace("-", " "),
            selected: selected,
            answer: answer,
            text: input.getAttribute("msg"),
            correct: qCorrect
        });

    });

    let output = "<h2>" + `You answered ${correct} out of ${inputs.length} questions correctly.` + "</h2>";
    output += `<button onClick="window.location.reload();">Reset Page</button>`;

    incorrectAnswers.forEach(question => {
        if (question.correct) {
            output += `
        <h3 Style="Color:Green">Question ${question.text}</h3>
        <p>You answered correctly: ${question.selected}</p>
      `;
        } else {
            output += `
        <h3 Style="Color:Red">Question ${question.text}</h3>
        <p>You answered: ${question.selected}</p>
        <p>Correct answer: ${question.answer}</p>
      `;
        }

    });


    if (output) {
        const incorrectDiv = document.createElement('div');
        output += `<button onClick="window.location.reload();">Reset Page</button>`;
        incorrectDiv.innerHTML = output;
        incorrectDiv.id = "results"
        document.body.appendChild(incorrectDiv);
    }

    document.querySelector("#quiz").classList.add("hidden");
}


function returnPretty(q) {
    return `
  
  <div class="row mb-5">
  <div class="col-2"></div>
  <div class="col-8">
      <div class="card">
          <div class="card-header">
              Question ${q.number}
          </div>
          <div class="card-body">
              <h5 class="card-title">${q.text}</h5>
              <div id="q-options" msg="${q.text}">
                ${returnPrettyOptions(q.options, q.number, q.answer)}
              </div>

          </div>

      </div>
  </div>
  <div class="col-2"></div>
</div>
  `
}

function returnPrettyOptions(o, n, a) {
    let returnValue = "";
    o.forEach((op, index) => {
        returnValue += `
          <input name="question-${n}" type="radio" id="question-${n}-option-${index}${isCorrect(a, op)}" ${(debugMode && isCorrect(a, op) == " correct") ? "checked='true'": ""} value="${op}">
          <label for="question-${n}-option-${index}">${op}</label><br>
    `
    });

    return returnValue;
}


function updateToast(event) {
    const temps = document.querySelectorAll('#q-options');
    let answered = 0;
    let total = temps.length;

    temps.forEach(input => {
        checked = false;
        input.querySelectorAll('input').forEach(y => {
            if (y.checked) answered++;
        });

    });

    document.getElementById("total-label").innerHTML = `${answered} / ${total} Answered`;
}