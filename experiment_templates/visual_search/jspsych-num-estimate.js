/**
 * jspsych-num-estimate
 * a jspsych plugin for making numeric estimates
 *  
 * 
 * 
 */
 
(function( $ ) {
	jsPsych["num-estimate"] = (function(){

		var plugin = {};

		plugin.create = function(params) {
			params = jsPsych.pluginAPI.enforceArray(params, ['data']);

			var trials = [];
			for(var i = 0; i < params.questions.length; i++)
			{
				trials.push({
					type: "num-estimate",
					questions: params.questions[i]
				});
			}
			return trials;
		};
				

		plugin.trial = function(display_element, trial) {

           	trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
			
			//add questions
			for (var i=0; i < trial.questions.length; i++) {
				//create div
				display_element.append($('<div>',{
					"id": 'jspsych-num-estimate-' + i,
					"class": 'jspsych-num-estimate-question'
				}));
                
                //add question text
				$("#jspsych-num-estimate-" + i).append('<p class="jspsych-num-estimate">' + trial.questions[i] + '</p>');
				
				
                // add text box
               	if (i==0){
                    $("#jspsych-num-estimate-" + i).append('<input type="text" name="#jspsych-num-estimate-response-' + i + '" autofocus><p></p>');
                }
                else {
                    $("#jspsych-num-estimate-" + i).append('<input type="text" name="#jspsych-num-estimate-response-' + i + '"></input><p></p>');
                }
           	}
            
            	// add submit button
            	display_element.append($('<button>', {
                		'id': 'jspsych-num-estimate-next',
                		'class': 'jspsych-num-estimate'
           	 }));

			$("#jspsych-num-estimate-next").html('Submit');
            	$("#jspsych-num-estimate-next").click(function() {
                	$("#error").remove();
				var inputcheck = 1;
				$("div.jspsych-num-estimate-question").each(function(index) {
                     		var val = $(this).children('input').val();
		       		if (isNaN(val) | val < 6 | val > 46){
						$(this).children('input').css('border-color','red');
						$(this).children('input').after('<p id="error" style=color:red>Please enter a numeric value between 6 and 46</p>');
						inputcheck=0;
						return;
					}
                });
				
				if(inputcheck==0){
					return;
				}

				// measure response time
                		

					var endTime = (new Date()).getTime();
                		var response_time = endTime - startTime;

                		// create object to hold responses
               		var question_data = {};
               		$("div.jspsych-num-estimate-question").each(function(index) {
                    		var id = "Q" + index;
                    		var val = $(this).children('input').val();
                    		var obje = {};
                    		obje[id] = val;
                    	$.extend(question_data, obje);
                });

                // save data
                jsPsych.data.write($.extend({}, {
                    "rt": response_time,
                    "responses": JSON.stringify(question_data)
                }, trial.data));

                display_element.html('');

                // next trial
        				if(trial.timing_post_trial > 0){
                	setTimeout(function(){ jsPsych.finishTrial(); }, trial.timing_post_trial);
        				} else {
        					jsPsych.finishTrial();
        				}
            });

            var startTime = (new Date()).getTime();
        };

        return plugin;
    })();
})(jQuery);

