function sampleContest() {
    return {
        "name": "新比賽",
        "rounds": [
            {
                "players": 40, // 多少人可以參加這一輪
                "name": "",
                "usebutton": false,
                "problems": [
                    {
                        "title": "",
                        "content": "",
                        "choice": [{
                            "value": "A",
                            "content": ""
                        }],
                        "timeout": 10, // 作答時間
                        "answer": {
                            "value": "", // 答案
                            "description": "" // 原因
                        },
                        "score": 3 // 得分
                    }
                ]
            }
        ],
        "teams": [
            {
                "no": 0,
                "name": "新隊伍",
                "score": 0,
                "round": 0
            }
        ]
    }
}