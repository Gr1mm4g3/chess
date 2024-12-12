#!/bin/bash

# Create pieces directory if it doesn't exist
mkdir -p public/pieces

# Download pieces from Lichess's GitHub repository
PIECES=("white_king" "white_queen" "white_rook" "white_bishop" "white_knight" "white_pawn" "black_king" "black_queen" "black_rook" "black_bishop" "black_knight" "black_pawn")
BASE_URL="https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett"

for piece in "${PIECES[@]}"
do
  # Convert piece name to lichess format (e.g., white_king.svg -> wK.svg, white_knight.svg -> wN.svg)
  color="${piece:0:1}"
  piece_type="${piece#*_}"
  
  case "$piece_type" in
    "king") type="K" ;;
    "queen") type="Q" ;;
    "rook") type="R" ;;
    "bishop") type="B" ;;
    "knight") type="N" ;;  # Knights use 'N' in chess notation
    "pawn") type="P" ;;
    *) echo "Unknown piece type: $piece_type"; continue ;;
  esac
  
  filename="$color$type.svg"
  curl -o "public/pieces/${piece}.svg" "$BASE_URL/$filename"
done
