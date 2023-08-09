import React, {useReducer, useEffect} from 'react'
import '../../css/minesweeper.css'
import GameBoard from './GameBoard'
import SettingBoard from './SettingBoard'
import { unhover } from '@testing-library/user-event/dist/hover'

export const MinesweeperContext = React.createContext()


export const GAMEOPTION = {
  BEGINNER: {column: 9, row: 9, bombNo: 10},
  INTERMEDIATE: {column: 16, row: 16, bombNo: 40},
  EXPERT: {column: 30, row: 16, bombNo: 99}
}

const Minesweeper = () => {
  const INITIAL_GAMESTATE = {
    gameOption: GAMEOPTION.BEGINNER,
    mode: 'START', //'START', 'PLAY', 'GAMEOVER'   
    bombsLocation: [],
    //buttons is an array of object in format of {mark:[012345678*], status:[cofi] which "o:open, c:close, f:flag, i:button that trigger ignition" }
    buttons: [],
    startTime: null,
    endTime: null
  }

  const fnGetSurroundingIndex = (index, gameOption) => {
    const totalButton = gameOption.column * gameOption.row
    const arrPossibleSurroundingIndex = [index - gameOption.column - 1, index - gameOption.column, index - gameOption.column + 1, index - 1, index, index + 1, index + gameOption.column - 1, index + gameOption.column, index + gameOption.column + 1]
    
    let arrSurroundingIndex = []
    arrPossibleSurroundingIndex.forEach((n, i) => {
      if(n === index || n < 0 || n >= totalButton) {
          //Ignore if top row or bottom row
      } else if((index % gameOption.column === 0 && i % 3 === 0) || (index % gameOption.column === gameOption.column - 1 && i % 3 === 2)) {
          //Ignore if leftmost or rightmost column
      } else {
        arrSurroundingIndex.push(n)
      }
    })
    return arrSurroundingIndex
  }

  const fnUnveilButton = (buttonID, buttonsSetting, gameOption) => {

    let newButtonsSetting = [...buttonsSetting]

    //Get Surrouding button Index
    const arrSurroundingButtonsIndex = fnGetSurroundingIndex(buttonID, gameOption)
    
    //Clear all isPressed attribute
    newButtonsSetting = newButtonsSetting.map((button) => ({...button, isPressed:null}) ) 

    //Count surrouding Flags 
    const totalFlags = arrSurroundingButtonsIndex.reduce(
      (acc, index) => {
        //console.log(acc)
        return newButtonsSetting[index].state === "f" ? (acc+1) : acc
      }, 0
    )

    //console.log("totalFlags", totalFlags)
    
    const originalState = newButtonsSetting[buttonID].state  
    newButtonsSetting[buttonID].state = "o"

    if(newButtonsSetting[buttonID].mark === 0 || newButtonsSetting[buttonID].mark === totalFlags) {
      arrSurroundingButtonsIndex.forEach((buttonIndex, index) => {
        if(newButtonsSetting[buttonID].mark === 0 && newButtonsSetting[buttonIndex].state === "f") {
         newButtonsSetting[buttonIndex].state = "c";
        }

        if(newButtonsSetting[buttonIndex].state === "c") {
          newButtonsSetting[buttonIndex].state = "o"
          if(newButtonsSetting[buttonIndex].mark === 0) {
            newButtonsSetting = fnUnveilButton(buttonIndex, newButtonsSetting, gameOption)
          }
        }


      })
    } else if (originalState === "o") {

      const pressedTime = new Date() 
      arrSurroundingButtonsIndex.forEach((buttonIndex) => {
        if(newButtonsSetting[buttonIndex].state === "c") {
          newButtonsSetting[buttonIndex].isPressed = true
          newButtonsSetting[buttonIndex].pressedTime = pressedTime
          console.log("pressed: ", buttonIndex) 
        }
      })
    }

    //Check if remaining closed buttons are all bombs
    const noOfClosedButtons = newButtonsSetting.reduce((acc, button) => {return (button.state === "c" || button.state === "f") ? (acc+1) : acc}, 0)
    if(noOfClosedButtons === gameOption.bombNo) {
      newButtonsSetting.forEach(button => {if(button.state === "c") button.state = "f" })
    }

    return newButtonsSetting
  }

  const gameStateReducer = (prevGameState, action) => {
    console.log(action.type)
    switch(action.type) {
      case "renderBoard" : 
        //console.log("buttons.length ", buttons.length)
        const level = action.payload && action.payload.level ? action.payload.level : "BEGINNER"
        const gameOption = level === "EXPERT" ? GAMEOPTION.EXPERT : level === "INTERMEDIATE" ? GAMEOPTION.INTERMEDIATE : GAMEOPTION.BEGINNER
        const buttons = Array(gameOption.column * gameOption.row).fill(0).map(obj => {return {mark:0, state:'c'}})
        console.log("renderBoard", prevGameState.mode)
        return { ...INITIAL_GAMESTATE, mode:"START", gameOption:gameOption, buttons: buttons }
      case "setupBomb":
        const firstPressedButtonID = action.payload.firstPressedButtonID

        const totalButton = prevGameState.gameOption.column * prevGameState.gameOption.row;
    
        //Setting Bomb
        let arrBombsLocation = Array(prevGameState.gameOption.bombNo).fill(-1)
        let bRedundantBomb = false

        arrBombsLocation.forEach((val, index) => {
          do {
            const bombIndex = Math.floor(Math.random() * totalButton)
            bRedundantBomb = bombIndex === firstPressedButtonID || arrBombsLocation.some(n => n === bombIndex)
            arrBombsLocation[index] = bombIndex
          } while (bRedundantBomb)
        })
        const arrBombsLocation2 = arrBombsLocation

        let arrTempButtons = prevGameState.buttons.map(obj => obj)

        arrBombsLocation2.forEach((val) => {
            const arrSurroundingButtonsIndex = fnGetSurroundingIndex(val, prevGameState.gameOption)
             arrTempButtons[val].mark = "*"
             //arrTempButtons[val].state = "o"
             
             arrSurroundingButtonsIndex.forEach(sIndex => {
              if(!arrBombsLocation.some(bIndex => bIndex === sIndex )) {                
                arrTempButtons[sIndex].mark = isNaN(arrTempButtons[sIndex].mark) ? 1 : (arrTempButtons[sIndex].mark+1)
                //arrTempButtons[sIndex].state = "o"
              }
            })
        })

        arrTempButtons = fnUnveilButton(action.payload.firstPressedButtonID, arrTempButtons, prevGameState.gameOption)
        return { ...prevGameState, startTime:new Date(), mode:"PLAY", bombsLocation: arrBombsLocation, buttons: arrTempButtons}
      case "buttonClick":
        const buttonsSetting = fnUnveilButton(action.payload.buttonID, prevGameState.buttons, prevGameState.gameOption)

        //Either
        //1. a bomb is clicked (i.e. button.mark is a bomb and button.state is opened)
        //or
        //2. all buttons are opened or marked as flag (aka no buttons are closed)
        const newGameMode = buttonsSetting.some((obj) => obj.mark === "*" && obj.state ==="o") || !buttonsSetting.some((obj) => obj.state === "c") ? "GAMEOVER" : "PLAY"

        return {...prevGameState, mode:newGameMode, buttons: buttonsSetting}
        
      case "toggleFlag":
        
        const originalState = prevGameState.buttons[action.payload.buttonID].state
        const newState = originalState === "f" ? "c" : originalState === "c" ? "f" : originalState
        const newButtons = prevGameState.buttons.map((obj, index) => index === action.payload.buttonID ? {...obj, state:newState} : obj)

        return {...prevGameState, buttons: newButtons}
      default: 
        return prevGameState
    }

  }


  const [gameState, dispatch] = useReducer(gameStateReducer, INITIAL_GAMESTATE)

  const changeLevel = (level) => {
    dispatch({type:"renderBoard", payload:{level:level}})
  }

  const buttonClick = (id) => {
    if(gameState.mode === "START") {
      dispatch({type:"setupBomb", payload:{firstPressedButtonID: id}})
    }
    if(gameState.mode === "PLAY") {
      dispatch({type:"buttonClick", payload:{buttonID: id}})
    }

  }

  const toggleFlag = (id) => {
    if(gameState.mode === "START" || gameState.mode === "PLAY") {
      dispatch({type:"toggleFlag", payload:{buttonID: id}})
    }
  }

  const resetGame = (level) => {
    dispatch({type:"renderBoard", payload:{level: typeof level === "undefined" ? "BEGINNER" : level}})
  }


  useEffect(() => {dispatch({type:"renderBoard"})}, [])

  return (
    <>
    <MinesweeperContext.Provider value={gameState} >
      <SettingBoard changeLevel={changeLevel} resetGame={resetGame} />
      <GameBoard buttonClick={buttonClick} toggleFlag={toggleFlag} />
    </MinesweeperContext.Provider>
    </>
)
}

export default Minesweeper