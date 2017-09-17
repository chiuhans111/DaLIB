# Socket IO events for client
use this document to write a client work with my server  
[json objects](#json-objects)
#### main
1. login
2. get state
3. get problem
4. racing, send answer
5. back to `2` or `3`

#### other
1. ping
2. desplay something


# Socket methods

|method|event name|data|description|
|------|----------|----|-----------|
|__`emit`__|`login`|__`String`__ key|send team `key` in `string` format|
|__`on`__|`state`|__`JSON`__ state|full information in `json`, you will get this state update after login successfully|
|__`emit`__|`race`|__`String`__ answer|race with `answer` in `string`, can be `choice.id` or `null`|
|__`on`__|`racestart`|__`Number`__ time|race will start in `time` millisecond|
|__`on`__|`setproblem`|__`Number`__ id|the problem is changed, with this `id`|
|__`on`__|`showproblem`|__`JSON`__ problem|this problem is showing on the main screen, prepare buttons for player|
|__`on`__|`showinfo`|__`JSON`__ info| the server want to display some information on client|

# JSON objects
asdasd


