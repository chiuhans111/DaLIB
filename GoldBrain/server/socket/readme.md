# Socket IO events for client
use this document to write a client work with my server  

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
|-----:|:---------|----|-----------|
|__`emit`__|`login`|__`String`__ key|send team `key` in `string` format|
|__`on`__|`state`|__`JSON`__ [state](#state)|full information in `json`, you will get this state update after login successfully, or other player login state changed|
|__`emit`__|`race`|__`String`__ answer|race with `answer` in `string`, can be `choice.id` or `null`|
|__`on`__|`racestart`|__`Number`__ time|race will start in `time` millisecond|
|__`on`__|`round`|__`JSON`__ [round](#round)|a new round is started|
|__`on`__|`problem`|__`JSON`__ [problem](#problem)|this problem is showing on the main screen, prepare buttons for player|
|__`on`__|`showinfo`|__`JSON`__ [info](#info)| the server want to display some information on client|
|__`emit`__|`hey`|__`any`__| say hey to the server|
|__`on`__|`hey`|__`Number`__ time| after you say hey, server will reply hey with server `time` in millisecond|

## object schema
### state
``` javascript
{
  page: String // "round", "problem", "race", "info".  the current page need to be show
  round: {
    no: Number // round id
    title: String
    usebutton: Boolean // require physical button
  }
  problem: {  // current problem, could be null if problem have not set yet
    no: Number // problem id
    info: {
      title: String // problem title
      choice: [{ // array, or null if this is not a choice problem
        value: String // A, B, C.... the id of the choice
        content: String // the content of the choice
      }]
    }
  }
  info:{ // is info page is showing
    content: String // html code
    backgroundColor: String // hex code #FFFFFF
  }
  team: Number // my team number
  teams: [{ // array of teams
    name: String
    no: Number // team id
    score: Number
    online: Boolean
  }]
}
```
### round
```javascript
{
  no: Number // round id
  title: String
  usebutton: Boolean // require physical button
}
```

### problem
``` javascript
{
  no: Number // problem id
  title: String // problem title, not include content
  choice: [{ // array, or null if this is not a choice problem
    value: String // A, B, C.... the id of the choice
    content: String // the content of the choice
  }]
}
```
### info
``` javascript
{
  content: String // html code
  backgroundColor: String // hex code #FFFFFF
}
```
