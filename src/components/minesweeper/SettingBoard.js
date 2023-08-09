import React, {useContext, useEffect, useRef} from 'react'
import { GAMEOPTION, MinesweeperContext } from './Minesweeper'

const SettingBoard = ({changeLevel, resetGame}) => {
  const gameState = useContext(MinesweeperContext)

  const timeSpent = useRef()
  const selRef = useRef()

  const flagsSet = gameState.buttons.reduce((acc, obj) => (obj.state === "f" ? (acc+1): acc), 0)
  const remainingBombs = gameState.gameOption.bombNo - flagsSet

  let objShowTimeHandler = null

  const showTime = function() {
    console.log("showTime", gameState.mode)
    const duration = gameState.mode === 'PLAY' || gameState.mode === 'GAMEOVER' ? Math.floor(((new Date()) - gameState.startTime)/1000) : 0

    timeSpent.current.innerText = ("00" + duration + "").slice(-3)
    //$("#txtTimeSpent").text(("00" + duration + "").slice(-3))
    
    if(gameState.mode === "PLAY") {
      objShowTimeHandler = setTimeout(showTime, 1000)
    }

    
  }

  useEffect( () => {
    showTime()
    console.log("settingBoard:", gameState.mode)
    
    return () => { if (objShowTimeHandler!= null) clearTimeout(objShowTimeHandler) }
  }
  , [gameState.mode])


  return (
    <div id="top">
    Level: <select ref={selRef} id="selLevel" onChange={(e) => {changeLevel(e.target.value)}}>
        <option value="BEGINNER">BEGINNER</option>
        <option value="INTERMEDIATE">INTERMEDIATE</option>
        <option value="EXPERT">EXPERT</option>
    </select>
    <button id="btnReset" onClick={() => {resetGame(selRef.current.value)}}>Reset</button><br />
    Bombs remaining: <span id="txtBombRemaining" className="red">{remainingBombs}</span><br />
    TIme spent: <span ref={timeSpent} id="txtTimeSpent" className="red">000</span>
    </div>
  )
}

export default SettingBoard