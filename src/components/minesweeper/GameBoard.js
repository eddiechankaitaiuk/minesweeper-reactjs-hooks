import { useContext } from 'react'
import { GAMEOPTION, MinesweeperContext } from './Minesweeper'
import Button from './Button'


const GameBoard = ({buttonClick, toggleFlag}) => {
  const gameState = useContext(MinesweeperContext)
  const buttons = gameState.buttons
  const gameboardCSS = {
    gridTemplateColumns: "repeat(" + gameState.gameOption.column + ", 1fr)",
    gridTemplateRows: "repeat(" + gameState.gameOption.row + ", 1fr)",
  }
  return (
    <div id="gameboard" style={gameboardCSS}>
      {buttons.map((button, index) => (<Button key={index} id={index} mode={gameState.mode} setting={button} buttonClick={buttonClick} toggleFlag={toggleFlag} />))}
    </div>
  )
}

export default GameBoard