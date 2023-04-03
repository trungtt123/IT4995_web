//https://stackoverflow.com/questions/20926551/recommended-way-of-making-react-component-div-draggable
import React, { useState, useEffect, useRef } from 'react'
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';
var Draggable = props => {
  const [pressed, setPressed] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [touchStartPosition, setTouchStartPosiotion] = useState({ x: 0, y: 0 })
  const ref = useRef()

  // Monitor changes to position state and update DOM
  useEffect(() => {
    if (ref.current) {
      ref.current.style.transform = `translate(${position.x}px, ${position.y}px)`
    }
  }, [position])

  // Update the current position if mouse is down
  const onMouseMove = (event) => {
    console.log('isMobile', isMobile)
    if (isMobile) {
      const touch = event.touches[0];
      const movementX = touch.clientX - touchStartPosition.x;
      const movementY = touch.clientY - touchStartPosition.y;
      console.log(`Movement X: ${movementX}, Movement Y: ${movementY}`);
      setTouchStartPosiotion({
        x: touch.clientX,
        y: touch.clientY,
      });
      if (pressed) {
        console.log(position.x, position.y);
        setPosition({
          x: position.x + movementX,
          y: position.y + movementY
        })
      }
    }
    if (pressed && isBrowser) {
      setPosition({
        x: position.x + event.movementX,
        y: position.y + event.movementY
      })
    }
  }

  return (
    <>
      <BrowserView>
        <div
          style={props.style}
          ref={ref}
          onMouseMove={onMouseMove}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}>
          {props.children}
        </div>
      </BrowserView>
      <MobileView>
        <div
          style={props.style}
          ref={ref}
          onTouchMove={onMouseMove}
          onTouchStart={(e) => {
            setTouchStartPosiotion({
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            });
            setPressed(true)}
          }
          onTouchEnd={() => setPressed(false)}>
          {props.children}
        </div>
      </MobileView>
    </>
  )
}

export default Draggable