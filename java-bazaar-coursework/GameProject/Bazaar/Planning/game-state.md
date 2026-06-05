# Game State Memo

**TO**: CEOs  
**FROM**: Team Futatsu  
**DATE**: 10/10/24  
**SUBJECT**: Game state representation and referee abilities.

---

### **Introduction**
The game state holds knowledge and rules of the game. The omniscient referee has access to it for game regulation. The purpose of this memo is to describe how we plan to implement the game state and the important functionality it needs to provide the referee. 
### **Game State Information**
The game state holds knowledge about:
- 10 game equations
- Visible and invisible Cards
- Current bank of pebbles
- Players in game and order of turns
- Number of points each player has
- Number of pebbles each player has

### **Game State Data Representation**
We envision the game state to be represented by its own separate class with a dictionary. The dictionary will have string keys and the values will be lists.
The keys will be:
- "gameEquations"
- "gameCardsVisible"
- "gameCardsInvisible"
- "pebbleBank"
- "gamePlayers"//the order of the list will be turn order and the game state will be able to access player points and pebbles from here.
- "currentPlayerTurn"//index of player whose current turn it is 
### **Functionality Available to Referee**
In a game the referee needs to be able to:
- Initialize game for a player
- Kick player out
- End game with win/loss outcome
- Validate a player’s turn
- Control transfer of pebbles
---
If you have any questions or require further information, please feel free to reach out.

---
