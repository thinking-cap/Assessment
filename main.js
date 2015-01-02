// JavaScript source code

var question = {
    init: function () {
        console.log('initialized');
        console.log('getting question');
        parent.Assessment.showNav();
        var assessment = parent.Assessment;
        var questionObj = assessment.answers[(assessment.currentQuestion - 1)];
        console.log(questionObj);
        console.log(assessment.currentQuestion);
       
      
        $('.submit').on('click', function () {
            question.checkAnswer();
        });
        var qtype = ($('.choices li.correct').length > 1) ? 'multi' : 'single';
        console.log("question type : ", qtype);
        $('.choices li').each(function (num) {
            if (qtype === 'multi') {
                var input = $('<input type="checkbox" id="q_'+num+'"/>');
                $(this).prepend(input);
            } else {
                var input = $('<input type="radio"  id="q_' + num + '"/>')
                $(this).prepend(input);
            }
            $(this).data('input', input);
            if ($(this).hasClass('correct')) {
                $(this).data('correct', true);
            } else {
                $(this).data('correct', false);
            }
            $(this).removeClass('correct');
            
            $(this).on('click', { type: qtype }, function (event) {
                if (event.data.type === 'single') {
                    $('.choices li').removeClass('selected');
                    console.log($('.choices li').data('input'));
                    $('.choices li').each(function () { $(this).data('input').prop('checked',false); });

                }
                $(this).toggleClass('selected');
                if ($(this).hasClass('selected')) {
                    $(this).data('input').prop('checked', true);
                } else {
                    $(this).data('input').prop('checked',false);
                }
                console.log($(this).data('correct'));

            });

        });
        if (questionObj && typeof questionObj !== 'undefined') {
            console.log(questionObj.selected_number);
            for (var xx = 0; xx < questionObj.selected_number.length; xx++){
                $('.choices li:nth-child(' + (questionObj.selected_number[xx] + 1) + ')').toggleClass('selected');
                $('.choices li:nth-child(' + (questionObj.selected_number[xx] + 1) + ')').data('input').prop('checked', true);
            }

        }
    },
    checkAnswer: function (question) {
        var correct = 1;
        var selected_choices = [];
        var selected_number = [];
        var sel = 0;
        $('.choices li').each(function (num) {
            if ($(this).hasClass('selected')) {
                sel++;
                selected_choices.push((num + 1) + '. ' + $(this).text());
                selected_number.push(num);
                if ($(this).data('correct') === false)
                    correct = 0;
            } else {
                if ($(this).data('correct') === true)
                    correct = 0;
            }
        });
        if (sel > 0) {
            var questionObj = {
                qtext: $('.qtext').text(),
                correct: correct,
                selected: selected_choices,
                selected_number: selected_number
            }
            if ($('.feedback').length > 0) {
                var fb = (correct === 1) ? $('.feedback .correct') : $('.feedback .incorrect');
                parent.Assessment.updateAnswer($(this), questionObj, fb);
            } else {
                parent.Assessment.updateAnswer($(this), questionObj)
            }
        } else {
            alert('You have not selected an answer.');
        }
        
    }

}

$(document).ready(function () {
    question.init();
});