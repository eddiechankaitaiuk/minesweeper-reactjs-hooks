import {useRef, useEffect, useMemo} from 'react'

const Button = ({id, mode, setting, buttonClick, toggleFlag}) => {
  const className = useMemo(() => { 
    console.log("button outside")    
    const tempClassName =
    mode === "GAMEOVER" ? (
            setting.state === "o" ? 
            (setting.mark === "*" ? "open bomb clicked" : "open mark" + setting.mark)
            : setting.state === "f" ?
            (setting.mark === "*" ? "closed flag" : "closed wrong_flag") 
            : (setting.mark === "*" ? "open bomb" : "closed") 
    ) : (
        setting.state === "o" ? 
        (setting.mark === "*" ? "open bomb clicked" : "open mark" + setting.mark)
        : setting.state === "f" ?
        "closed flag" 
        : "closed" 
    )
    return tempClassName
  }, [mode, setting.state, setting.mark])

  const buttonRef = useRef()

  useEffect(() => {
    if(setting.isPressed) {
        //console.log("setting isPressed is true")
        buttonRef.current.className += " pressed";
        setTimeout(function() {
            buttonRef.current.className = buttonRef.current.className.replace(/\bpressed\b/, "")
        } 
        , 500)
    }
  }, [setting.pressedTime])

  return (
    <button ref={buttonRef} onContextMenuCapture={(e) => {e.preventDefault(); toggleFlag(id)}} onClick={(e)=> {e.preventDefault(); if(setting.state!=="f") {buttonClick(id)}}} className={className}></button>
  )
}

export default Button