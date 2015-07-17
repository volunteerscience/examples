  

var subNum = Math.floor(Math.random() * Math.pow(10,9));

//function saveTheData(filename,filedata){
//  submit(filedata);
////    $.ajax({
////        type: 'post',
////        cache: false,
////        url: 'save_data.php',
////        data: {filename: filename, filedata: filedata}
////    });
//}

var n_trials = 72; //max 72 for now
var nreps = 4;
var setSizes = [6,11,16,21,26,31,36,41,46];
var stimuli = [];

for (var i=0; i<setSizes.length; i++) {
    for (var j=1; j<=nreps; j++){
        stimuli.push("/attachment/" + setSizes[i] + "present" + j + ".png");
        stimuli.push("/attachment/" + setSizes[i] + "absent" + j + ".png");
    }
}

var stimuli_random_order = [];

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }   

    return array;
}
var shuffledStims = shuffle(stimuli);

for (var i=0; i < n_trials; i++) {
    stimuli_random_order.push(stimuli[i]);
};

//add final trial for numerical estimation
var final_ss = [6,16,26,36,46];
var random_ss = Math.floor(Math.random() * final_ss.length);
var random_choice = Math.floor(Math.random() * nreps) + 1;
stimuli_random_order.push("/attachment/final" + final_ss[random_ss] + "present" + random_choice + ".png");

var count_message = ["Please select how many items were on the last screen.<br><br><em>(Hint: the number is at least 6 and no more than 46)</em>"];
var debrief = "<div id='instructions'><p>Thank you for participating!</p>";

var instruction_block = {
    type: "html",
    pages: [{url: "/attachment/welcome.html?ver=1", cont_key: 13},{url: "/attachment/instructions.html?ver=1",cont_key: 13},{url: "/attachment/practice.html?ver=1",cont_key: 77}]
};
var test_block = {type: "single-stim", stimuli: stimuli_random_order, choices: [90,77], timing_post_trial: 500};
var count_block = {
    type: "num-estimate", 
    questions: [count_message],
    on_finish: function(data){
      submit(jsPsych.data.dataAsCSV());
      if (IS_AMT && !IS_AMT_PREVIEW) {
        payAMT(true,0);        
      } else {
        experimentComplete();
      }
    }    
};
var debrief_block = {};

function initialize() {
  if (IS_AMT && !IS_AMT_PREVIEW) {
    debrief += "<p>Press Complete Hit to finish.</div>";
  }
  
  debrief_block = {
    type: "text", 
    text: [debrief]
  };
  
  jsPsych.init({
      display_element: $('#jspsych_target'),
      experiment_structure: [instruction_block, test_block, count_block, debrief_block],
      on_trial_start: function() {
        var p = jsPsych.progress();
        if (p.current_chunk == 2) {
          $(".i_reminder").hide();
        }
//        log(p.current_chunk);
//        var o = jsPsych.currentTrial();
      }
  });
}
