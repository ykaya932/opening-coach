# Opening Coach

Analyse and practise the chess openings you actually play on chess.com.

- **Dashboard**: rating curve, score by colour, the opening lines where you lose most, most played openings
- **Openings**: explore your own opening tree move by move, with results and a Stockfish evaluation
- **Mistakes**: moves you keep repeating that the engine rates clearly worse than the best move
- **Practice**: drill your repertoire against the replies your real opponents play, weighted towards your weak spots

Games are fetched from the public chess.com API and cached in the browser; finished months are never downloaded again and engine results are stored, so only new games are analysed.

Install on a phone: open the site, then *Share → Add to Home Screen* (iPhone) or *Install app* (Android).

## Credits
- Chess pieces: "cburnett" set by Colin M.L. Burnett, GPLv2+
- Engine: [Stockfish.js](https://github.com/nmrugg/stockfish.js) (Stockfish 11), GPLv3 — see `engine/COPYING-stockfish.txt`
