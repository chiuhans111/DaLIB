// this file specifies the ranking algorithm

/**
 * WARING: will modify teams
 * @param teams {Array<{no:Number, name:String, round:Number, score:Number, record:Array<{ round:Number, problem:Number, correct:Boolean,  time:Number,  score:Number}>}>} 
 * @param rounds {Number}
 * */
function rank(teams, rounds) {


    // calculate every round average answer speed, only count for correct answer
    teams.map(team => {
        team.time = [];
        team.scores = [];
        for (var i = 0; i < rounds; i++) {
            try {

                var t = team.record.filter(r => r.round == i && r.correct)

                var ts = t.map(x => x.time).reduce((a, b) => a + b, 0);
                var s = t.map(x => x.score).reduce((a, b) => a + b, 0);
                ts /= t.length;

                team.time[i] = ts;
                team.scores[i] = s;
                //console.log('time', team.time);

            } catch (e) {
                team.time[i] = null;
            }
        }
    })

    // actuall sorting part
    return teams.sort((a, b) => {
        // most important ranking: the round this team is in
        var rank = b.round - a.round;
        // second important ranking: score
        if (rank == 0) rank = b.score - a.score;
        if (rank == 0) {
            try {
                var i = 0;
                while (rank == 0 && i <= a.round) {
                    rank = a.time[a.round - i] - b.time[a.round - i];
                    if (isNaN(rank)) throw new Error("speed not valid");
                    i++;
                }
            } catch (e) {
                rank = 0;
                if (e.message != 'speed not valid')
                    console.error(e)
            }
        }

        // last ranking key: the team number
        if (rank == 0) rank = a.no - b.no;

        return rank;
    });
}

exports.rank = rank;