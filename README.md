# Jeoparty!
[jeoparty.io](http://jeoparty.io)

Display the board on your computer and use your mobile device as your controller to select clues, buzz in, and answer questions. Play alone, or with friends!

# What's New?
* Rebuilt network code from the ground up eliminating lots of infamous bugs along the way including:
    * Players not being able to rejoin and/or losing their progress upon rejoining if their phone dies or falls asleep, or they navigate away from their browser to use a different app
    * Game timers (like the ones dictating how long you have to buzz in or answer) randomly stopping or restarting and crashing the game
    * Browser reading aloud clues that were beyond a certain number of words crashing the game
    * Game getting stuck while the scoreboard is being displayed showing one or more players continually losing money
* Answer checker improvements
    * Fixed an issue where number answers were marked incorrect depending on their form (i.e. ‘Twelve Angry Men’ will be marked correct when the answer is ‘12 Angry Men’ and the same for similar questions)
    * Fixed an issue where answers were marked incorrect if they were part of the category but that category enumerated the possible answers (i.e. if the category was ‘NBA, NFL, or NHL’ and you correctly answered ‘NBA’ it will now be marked correct and won’t be flagged for being part of the category)
    * Added more acronyms to check answers against although it isn’t exhaustive (i.e. ‘Kennedy’ and ‘John F. Kennedy’ will be marked correct when the answer is ‘JFK’ and the same for similar answers that feature acronyms)
    * Made it so that the correct answer to a question is always shown whether a player answered correctly or not. This works both so that the player can be fact-checked by other players and so that answer checker errors can be identified more easily
* Complete UI overhaul
    * Rebuilt UI code from scratch, adding lots of new features and fixing many known issues along the way including:
        * Added board and category reveal animations
        * Added scoreboard animations showing players rising/falling above and below one another based on their updated score after a round of play
        * Player information is now always available on their mobile device (in other words, they can always see their name, signature, and current score)
        * Category and dollar amount are now visible while a player is answering so they don’t have to worry about remembering what category was selected as they’re answering
        * New and improved timer that takes up less space and is much more visually appealing
        * Removed ‘Show Clue’ button from clue selection screen to make it less confusing and more seamless
        * New and improved champion announcement screen including a drumroll and firework animations once the champion is announced
        * Made the visual style more consistent across the entire game to reflect the classic Jeopardy! aesthetic
        * Fixed an issue where the animation showing the clue expanding out of the board screen was shaky and/or blurry
* Added answer streaks
    * Added new voice lines and player titles visible on the scoreboard screen to celebrate players when they get multiple answers correct in a row
* Daily double and final jeoparty wagering makeover
    * Added new voice lines whenever a player is wagering to inform them of their minimum and maximum wagers, allowing the player to do less math in their head while they’re considering their wager
    * Added new visuals for final jeoparty wagering and answering so players and audience members can see how many players have locked in their wagers/answers
* New and improved sketchpad for signatures
    * Added undo button to remove last stroke instead of having to erase the entire canvas if you make a mistake
    * Made the canvas background white and added a color picker to allow for more colorful and detailed signatures
* Added email button to the homepage so players can easily send feedback/comments/bug reports to me directly
* Fixed leaderboard
    * Previous leaderboard database was deprecated, switched over to a new database and re-instated global leaderboard
* Fixed text-to-speech language issue
    * Fixed an issue where the text-to-speech voice used to read clues aloud randomly used a different language than English
* Added encryption to jeoparty.io
    * Added SSL certificates so the website is completely encrypted and safe from malicious attacks

# How to Play

1. Go to [jeoparty.io](http://jeoparty.io) on your computer and plug it in to a TV screen or monitor

2. Go to [jeoparty.io](http://jeoparty.io) on your mobile device(s). There will be a form prompting your for the "session name" which will be displayed on your computer screen

3. Enter a name and signature

4. Once everyone has joined, press the 'Start Game' button on your computer. The game will begin, but any number of extra players can join later

5. Select clues on your phone by choosing a category and dollar value

6. The rest of the game proceeds like the Jeopardy! TV series. Have fun and good luck!

# Contributions

If you'd like to contribute to Jeoparty! feel free to clone this repository and make a pull request

# Credits
## Tools used
* [Heroku](https://www.heroku.com)
* [mongoDB Atlas](https://www.mongodb.com/cloud/atlas)
* [Express](https://expressjs.com)
* [React](https://reactjs.org/)
* [Node](https://nodejs.org/en/)
* [jService](http://jservice.io)
* [socket.io](https://socket.io)

## Special thanks to
* Matt Morningstar
* Max Thomsen
* Matt Baldwin
* Pranit Nanda
* [Attic Stein Beats](https://www.youtube.com/user/AtticStein)

# Copyright
The Jeopardy! game show and all elements thereof, including but not limited to copyright and trademark thereto, are the property of Jeopardy Productions, Inc. and are protected under law. This repository is not affiliated with, sponsored by, or operated by Jeopardy Productions, Inc.

Jeoparty! is not and never will be for profit; there are NO advertisements, and there is NO price to pay. If this game is distributed elsewhere with either of those costs, it is without my knowledge, and without my consent
