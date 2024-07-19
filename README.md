Author (by letter):Beibei Tu, Jiancheng Yu, Yuchen Teng, Zheyuan Wu, Zijie Liu

<img width="384" alt="image" src="https://github.com/user-attachments/assets/cd2efc71-b4b6-4cdc-af10-ce69b4ed2726">

User manual
Technical requirements
Minimum technical requirements that the system needs to be able to operate as desired
1. An up-to-date docker installation.
2. A modern, working browser (e.g. Chrome, Edge)
3. Access to OS terminal


Installation instructions
Detailed explanation of how the developed system can be put into operation on a computer in a fully functional manner.
1. Load the requiring tar files to docker repository:
docker load < *.tar
2. Open folder:
cd /folder
3. Run docker container:
docker compose up
4. (optional) Ensure every component (backend, frontend, mysql) is up and running
Operating instructions
Detailed explanation of how the developed system is to be operated.

After successfully starting up the docker container, open your browser and browse localhost:4200, this is the main login page. You should click “register” to register a new account as a user. In the registration page, you should fill in the blanks and make sure your repeated password matches. If you want to register for Admin, you need a special invitation code.


After registration, you will be redirected to the login page, where you can sign in. Input your email address and your password, click “Sign In”, you will be redirected to the Second-Factor-Authentication Page. You should be received an E-mail by now, input your security code from the e-mail, click “Next”, and you are good to go.

On the main homepage, you can browse your profile and change your avatar by clicking “Profile”. All player information and match history can be found in the Profile, and players can also change their password here.
By clicking “Decks” in the center, you can add decks and edit them, but notice there’s a max limit of 3 decks and each deck contains max. 30 cards. You can add a card in only one deck, before adding it to other decks, you should remove it from the deck first.

By clicking “Friend” button on the top-right corner, you can search other users and ask them to add you as a friend. Besides, you can set your friend list to either “private” or “public”. Users should be able to send friend requests, after requests confirmed by the other user, you can now start to chat. In the chat window you can delete or edit the sent message if the other user has not read them. You can also start a group chat by giving this group a name and  selecting friends. Users who are invited to this group can find them in this group chat.

To use the project, click on a friend from the friend list. Then, click on the chat button to navigate to the chat interface. In the chat interface, you will be able to see the friend list, the input box, and the message area.

When the user types a message in the chat box and clicks send, if the recipient has not read the message yet, the user can see the ‘löschen’ and ‘bearbeiten’ buttons below the message.

Clicking the ‘löschen’ button will directly remove the message, while clicking the ‘bearbeiten’ button will bring up a dialog box with a new input field to modify the sent message.

By clicking on the group chat option, the user can create a new group, select users to join the group chat, and name the group chat.

After creating the group, clicking on the group chat allows the user to send messages, which will be displayed in real-time to other users in the group.

Users can go to the lootbox page and use their sep-points to buy lootboxes, there are three kinds of lootboxes users can buy. Gold and Rare lootboxes are more expensive because they have a bigger chance to receive rare and legendary cards. After buying a lootbox, users can open the lootboxes they bought and receive different cards according to the type of lootbox they bought. 

In the leaderboard page users can see the ranking of all the users. Users can use their cards to duel with other users by sending duel requests in the leaderboard, users have thirty seconds time to accept the duel request or the request will be rejected. Users can also decline the request by clicking the decline button. After accepting the request, both users can go to the dual page by clicking the enter game button. Users can start the game by clicking the start game button. One user will get a random card from the deck they created, if the card is common, user can summon the card immediately and if it is a rare card, the user can only summon the rare card by sacrificing two cards on the table and if it is a legendary card, he user can only summon the legendary card by sacrificing three cards on the table. the User can only summon the card in the first round and use the card to attack in the second card or after.A user can only summon or attack in one round. A game is ended if one user has no health points left and the winner will be rewarded 50 leaderboard points and the loser will have 50 leaderboard points less in their account.

In the Clan List, players can create a Clan. After creation, the system will automatically redirect to the Clan page, where all members can be seen, and Tournaments and Bets can be initiated for each round of the Tournament. All members of the Clan will be randomly paired to compete in matches. The player who wins the final round of the tournament will receive 700 SEP coins. Other members can also bet on which player will win the match. Each bet will cost 50 SEP coins, and if the bet is successful, the bettor will receive 50 SEP coins and a Gold-Lootbox.

On the homepage, clicking "Play with Robot" allows players to battle against a robot, which will follow game rules to compete with the player.

On the homepage, players can also click on SEP-TV to watch live battles. Viewers of the live stream can see both players' hands.

