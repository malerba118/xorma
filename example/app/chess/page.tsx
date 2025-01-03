"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import wallpaper from "@/public/wallpaper.png";
import { GameModel, PieceModel, store } from "./models";
import { observer } from "mobx-react";
import { cn } from "@/lib/utils";
import { autorun } from "mobx";

const ChessGame = observer(() => {
  const [game, setGame] = useState<GameModel>();

  useEffect(() => {
    const game = GameModel.initialize();
    store.history.commit();
    setGame(game);

    autorun(() => {
      console.log(JSON.parse(JSON.stringify(store.toJSON())));
    });
  }, []);

  if (!game) return null;

  const handleSquareClick = (x: number, y: number) => {
    const clickedPiece = game.getPieceAt({ x, y });

    if (game.selectedPieceId) {
      const selectedPiece = game.pieces.find(
        (p) => p.id === game.selectedPieceId
      );
      if (selectedPiece) {
        // If we have a piece selected, try to move it
        const success = game.movePiece(selectedPiece.position, { x, y });
        if (success) {
          store.history.commit();
        }
      }
      game.selectPiece(null);
    } else if (clickedPiece && clickedPiece.color === game.currentTurn) {
      // If we're clicking a piece of the current player's color, select it
      game.selectPiece(clickedPiece.id);
    }
  };

  const getValidMoves = (x: number, y: number) => {
    if (!game.selectedPieceId) return false;
    const selectedPiece = game.pieces.find(
      (p) => p.id === game.selectedPieceId
    );
    if (!selectedPiece) return false;

    const validMoves = selectedPiece.getValidMoves();
    return validMoves.some((move) => move.x === x && move.y === y);
  };

  const renderPiece = (piece: PieceModel) => {
    const symbol = getPieceSymbol(piece.type);
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center text-4xl",
          piece.color === "white" ? "text-white" : "text-black"
        )}
      >
        {symbol}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Image
        src={wallpaper}
        className="fixed w-full h-full -z-10"
        alt="Wallpaper"
      />

      <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg">
        <div className="grid grid-cols-8 gap-0.5 bg-black/50">
          {Array.from({ length: 8 }, (_, y) =>
            Array.from({ length: 8 }, (_, x) => {
              const isLight = (x + y) % 2 === 0;
              const piece = game.getPieceAt({ x, y });
              const isSelected = piece?.id === game.selectedPieceId;
              const isValidMove = getValidMoves(x, y);

              return (
                <div
                  key={`${x}-${y}`}
                  className={cn(
                    "w-16 h-16 flex items-center justify-center cursor-pointer relative",
                    isLight ? "bg-white/80" : "bg-gray-600/80",
                    isSelected && "ring-4 ring-yellow-400",
                    isValidMove && "ring-4 ring-green-400"
                  )}
                  onClick={() => handleSquareClick(x, y)}
                >
                  {piece && renderPiece(piece)}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-white text-lg">
            Current Turn: {game.currentTurn}
          </div>
          <div className="space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                store.history.undo();
                game.selectPiece(null);
              }}
            >
              Undo
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                store.history.redo();
                game.selectPiece(null);
              }}
            >
              Redo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

function getPieceSymbol(type: string): string {
  switch (type) {
    case "pawn":
      return "♟";
    case "rook":
      return "♜";
    case "knight":
      return "♞";
    case "bishop":
      return "♝";
    case "queen":
      return "♛";
    case "king":
      return "♚";
    default:
      return "";
  }
}

export default ChessGame;
