sequent
=======

JavaScript async flow control

How to use
----------

### Wait (Join) ###

Execute after expected number of seq.done() are executed.

    var Sequent = require('sequent');
    var seq = new Sequent;

    setTimeout(function(){
        seq.done("done 1"); // Arguments are optional
    }, 500);

    setTimeout(function(){
        seq.done("done 2", "end");
    }, 1000);

    // Wait for two seq.done()
    seq.wait(2, function(arg1, arg2){
        // arg1 == "done 2", arg2 == "end"
        console.log("all done");
    });

### Break (as in `for` loops) ###

Exit waiting earlier than planned.

    var Sequent = require('sequent');
    var seq = new Sequent;

    seq.wait(100, function(arg){
        // arg == "matured"
    });

    for (var i=0; i<100; i++) {
        if (i == 5) {
            // Break here and go to callback of wait()
            seq.mature("matured");
        }

        // seq.done() after seq.mature() are ignored
        seq.done("done " + i);
    }

### Queue (execute in order) ###

Execute functions in queued order when it becomes available.

    var Sequent = require('sequent');
    var seq = new Sequent;

    var funcs = [];
    var results = [];
    for (var i=1; i<=10; i++) {
        // Functions will be executed in seq.queue()'d order.
        // seq.queue() returns a wrapped function.
        funcs.push(seq.queue(
            (function(_i){
                return function(){
                    results.push(_i);
                }
            })(i)
        ));
    }

    funcs.reverse();

    // Mark queued functions as available
    for (var i=0, l=funcs.length; i<l; i++) {
        funcs[i]();
    }

    // Wait for all queued functions to be executed
    seq.flush(function(){
        // results is [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    });

Installation
------------

    npm install sequent
