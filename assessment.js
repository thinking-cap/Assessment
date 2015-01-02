// JavaScript source code
var Assessment = {
    totalQuestions: 0,
    answers: [],
    complete : false,
    score : 0.0,
    currentQuestion: 0,
    nextQuestion: function () {
        if (this.currentQuestion < this.totalQuestions) {
            this.currentQuestion++;
            if (this.currentQuestion === 1)
                $('.navigation').show();
            $("iframe").attr('src', 'question_' + this.currentQuestion + '.htm');
            set_val('cmi.location', 'question_' + this.currentQuestion + '.htm');
        } else {
            this.currentQuestion = -1;
            $("iframe").attr('src', 'summary.htm')
            set_val('cmi.location', 'summary.htm');
        }
        console.log(this.currentQuestion);
        this.updateCounter();
    },
    previousQuestion: function () {
        if (this.currentQuestion > 1) {
            this.currentQuestion--;
            $("iframe").attr('src', 'question_' + this.currentQuestion + '.htm');

        } else {
            if (this.currentQuestion === -1) {
                this.currentQuestion = this.totalQuestions;
                $("iframe").attr('src', 'question_' + this.currentQuestion + '.htm');
                this.updateCounter();
            }else{
            $("iframe").attr('src', 'intro.htm');
            this.currentQuestion = 0;
            }
        }
        this.updateCounter();
        console.log(this.currentQuestion);
    },
    jumpToQuestion: function () { },
    startAssessment: function () { },
    summary: null,
    updateCounter: function () {
        switch (this.currentQuestion) {
            case 0: $('.counter').html("Intruduction"); break;
            case -1: $('.counter').html("Summary"); break;
            default: $('.counter').html('Question ' + this.currentQuestion + ' of ' + this.totalQuestions); break;
        }
    },
    review: function () {
        this.currentQuestion = 1;
        this.updateCounter();
        $("iframe").attr('src', 'question_' + this.currentQuestion + '.htm');
    },
    updateAnswer: function (pos, options,fb) {
        Assessment.answers[this.currentQuestion - 1] = options;
        set_val('cmi.interactions.' + (this.currentQuestion - 1) + '.learner_response', options.selected.toString());
        var correct = (options.correct === 1) ? 'correct' : 'incorrect';
        set_val('cmi.interactions.' + (this.currentQuestion - 1) + '.result', correct);
        set_val('cmi.suspend_data', JSON.stringify(Assessment.answers));
        console.log(Assessment.answers);
        if (fb) {
            fb.toggleClass('hidden');
            fb.parent().toggleClass('hidden');
            fb.on('click', function () { Assessment.nextQuestion();})
        }else{
            Assessment.nextQuestion();
        }
        
    },
    init: function () {
        var initialize = initSco();

        var entry = get_val('cmi.entry');
        if (entry === 'ab-initio') {
            for (var xx = 0; xx < this.totalQuestions; xx++) {
                this.answers[xx] = null;
                set_val('cmi.interactions.' + xx + '.id', 'question_' + (xx + 1));
                set_val('cmi.interactions.' + xx + '.type', 'choice');
            }
        } else {
            var location = get_val('cmi.location');
            var answersobj = get_val('cmi.suspend_data');
            answersobj = JSON.parse(answersobj);
            this.answers = answersobj;
            // bookmarking
            switch (location) {
                case 'summary.htm': this.currentQuestion = this.totalQuestions;
                    this.nextQuestion(); break;
                default: this.loadpage(location); break;
            }            
        }
        set_val('cmi.exit', 'suspend');

        
    },
    loadpage : function(loc){
        var num = loc.split('_')[1].split('.')[0];
        this.currentQuestion = num * 1;
        if (this.currentQuestion > 1)
            $('.navigation').show();
        $("iframe").attr('src', 'question_' + this.currentQuestion + '.htm');
        this.updateCounter();
    },
    showNav : function(){
        $('.navigation').show();
    },
    summarize: function (el) {
        var totalCorrect = 0;
        var list = $('<ol></ol>');
        $('.navigation').hide();
        for (var xx = 0; xx < this.answers.length; xx++) {
            var li = $('<li></li>');
            var text = (this.answers[xx] && typeof this.answers[xx] !== 'undefined' && this.answers[xx].qtext !== '') ? $('<div class="qtext">' + this.answers[xx].qtext + '</div>') : $('<div class="qtext">Question ' + (xx + 1) + '</div>');
            text.data('question', (xx + 1));
            text.on('click', function () {
                Assessment.goto($(this).data('question'));
            })
            var correct = (this.answers[xx] && typeof this.answers[xx] !== 'undefined' && this.answers[xx].correct === 1) ? $('<div class="correct">correct</div>') : $('<div class="incorrect">incorrect</div>');
            var selected = (this.answers[xx] && typeof this.answers[xx] !== 'undefined') ? this.answers[xx].selected.toString() : '';
            set_val('cmi.interactions.'+xx+'.learner_response',selected);
            if (this.answers[xx] && typeof this.answers[xx] !== 'undefined' && this.answers[xx].correct === 1) {
                totalCorrect++;
                set_val('cmi.interactions.' + xx + '.result', 'correct');
            } else {
                set_val('cmi.interactions.' + xx + '.result', 'incorrect');
            }
            li.append(text,correct);
            list.append(li);
        }
        this.score = (totalCorrect / this.totalQuestions).toFixed(2);
        el.append('<div class="perc">Your score: ' + Math.round((totalCorrect / this.totalQuestions) * 100) + '%</div>');
        el.append('<h2>Your answers</h2>');
        el.append(list);
        set_val('cmi.completion_status', 'completed');
        set_val('cmi.score.scaled', this.score);

    },
    goto: function (num) {
        this.currentQuestion = num;
        $('iframe').attr('src', 'question_' + num + '.htm');
        this.updateCounter();

    }

};


///API Code//
var findAPITries = 1;
var API = null;

function FindAPI(win) {
    while ((win.API_1484_11 == null) && (win.parent != null) && (win.parent != win)) {
        findAPITries++;
        // Note: 7 is an arbitrary number, but should be more than sufficient
        if (findAPITries > 7) {
            parent.status = "Error finding API -- too deeply nested.";
            return null;
        }
        win = win.parent;
    }
    return win.API_1484_11;
}


function GetAPI() {
    if (API == null) {
        API = FindAPI(window);
    }
    if ((API == null) && (window.opener != null) && (typeof (window.opener) != "undefined")) {
        API = FindAPI(window.opener);
    }
    if (API == null) {
        parent.status = "You are not connected to the Thinking Cap ";
    }
    return API;
}

function initSco() {
    var myAPI = GetAPI();
    if (myAPI != null) {
        var init = myAPI.Initialize("");
        set_val("cmi.completion_status", "incomplete");
        commit();
        return init;
    } else {
        console.log('not connected to LMS');
    }
}



function set_val(gname, gvalue) {
    var myAPI = GetAPI();
    if (myAPI != null) {
        myAPI.SetValue(gname, gvalue);
    }
}

function get_val(gname) {
    var myAPI = GetAPI();
    if (myAPI != null) {
        return myAPI.GetValue(gname);
    }
}

function commit() {
    var myAPI = GetAPI();
    if (myAPI != null) {
        myAPI.Commit("");
    }
}

function finish() {
    var myAPI = GetAPI();
    if (myAPI != null) {
        myAPI.Finish("");
    }
}


$(document).ready(function () { Assessment.init(); });