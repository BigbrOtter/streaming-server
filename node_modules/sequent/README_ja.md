sequent
=======

JavaScript非同期フロー制御ライブラリ

使い方
------

### 待機とジョイン ###

`done()`が一定の回数実行された後で、`wait()`のコールバックを実行します。待つ回数は`wait()の第1引数で指定します。`

    var Sequent = require('sequent');
    var seq = new Sequent;

    setTimeout(function(){
        seq.done("done 1"); // 引数は任意
    }, 500);

    setTimeout(function(){
        seq.done("done 2", "end");
    }, 1000);

    // 2回のdone()を待つ
    seq.wait(2, function(arg1, arg2){
        // arg1 == "done 2", arg2 == "end"
        console.log("all done");
    });

### forループのようなbreak ###

当初の予定よりも早く切り上げるには`mature()`を実行します。

    var Sequent = require('sequent');
    var seq = new Sequent;

    seq.wait(100, function(arg){
        // arg == "matured"
    });

    for (var i=0; i<100; i++) {
        if (i == 5) {
            // ここでbreakしてwait()のコールバックを実行する
            seq.mature("matured");
        }

        // mature()が呼ばれた後のdone()は無視される
        seq.done("done " + i);
    }

### キュー（順番に実行する） ###

実行可能になった関数を、キューに入った順番で即座に実行します。

    var Sequent = require('sequent');
    var seq = new Sequent;

    var funcs = [];
    var results = [];
    for (var i=1; i<=10; i++) {
        // 関数はqueue()された順序で実行される。
        // queue()はラップされた関数を返す。
        funcs.push(seq.queue(
            (function(_i){
                return function(){
                    results.push(_i);
                }
            })(i)
        ));
    }

    funcs.reverse();

    // キューに入れた関数が実行可能になった事を伝える
    for (var i=0, l=funcs.length; i<l; i++) {
        funcs[i]();
    }

    // キューに入っているすべての関数が実行されるまで待つ
    seq.flush(function(){
        // 結果は [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    });

インストール
------------

    $ npm install sequent
