function sampleContest() {
    return {
        "name": "新比賽",
        "rounds": [
            {
                "players": 40, // 多少人可以參加這一輪
                "name": "新場次",
                "usebutton": false,
                "problems": [
                    {
                        "title": "新題目",
                        "content": "題目敘述",
                        "choice": [ // 選擇題選項
                            {
                                "value": "A", // 選項
                                "content": "選項內容" // 內容
                            }
                        ],
                        "timeout": 0, // 作答時間
                        "answer": {
                            "value": "A", // 答案
                            "description": "作答原因" // 原因
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