import { useEffect, useState } from 'react'
import { push as Menu, slide as MobileMenu } from 'react-burger-menu'
import './BurgerMenu.css'
import ToolBox from './ToolBox'

function BurgerMenu(props) {
  /*   function handleKeyPress(e) {
    e = e || window.event
    if (e.key === 'Tab' || e.keyCoda === 9) {
    }
  } */

  useEffect(() => {
    if(props.size.width > 992){
      props.setIsMenuOpen(true)
    }
  },[props.size])

  return (
    <>
      {props.size.width > 992 && (
        <Menu
          {...props}
          noOverlay
          isOpen={props.isMenuOpen}
          onClose={() => props.setIsMenuOpen(false)}
          onOpen={() => props.setIsMenuOpen(true)}
          disableCloseOnEsc
          disableAutoFocus
          customBurgerIcon={ false }
          customCrossIcon={ false }
          //customOnKeyDown={handleKeyPress}
        >
          <h3 style={{ paddingTop: '1rem', textAlign: 'center' }}>
            {' '}
            Connected Devices{' '}
          </h3>
          <ToolBox
            items={props.toolbox[props.currentBreakpoint] || []}
            toolbox={props.toolbox}
            setToolbox={props.setToolbox}
            currentBreakpoint={props.currentBreakpoint}
            layouts={props.layouts}
            setLayouts={props.setLayouts}
            allDevices={props.allDevices}
            handleDeselectAll={props.handleDeselectAll}
          />
        </Menu>
      )}
      {props.size.width <= 992 && (
        <MobileMenu
          {...props}
          isOpen={props.isMenuOpen}
          onClose={() => props.setIsMenuOpen(false)}
          onOpen={() => props.setIsMenuOpen(true)}
          disableAutoFocus
        >
          <h3 style={{ paddingTop: '1rem' }}> Connected Devices </h3>
          <ToolBox
            items={props.toolbox[props.currentBreakpoint] || []}
            toolbox={props.toolbox}
            setToolbox={props.setToolbox}
            currentBreakpoint={props.currentBreakpoint}
            layouts={props.layouts}
            setLayouts={props.setLayouts}
            allDevices={props.allDevices}
            handleDeselectAll={props.handleDeselectAll}
          />
        </MobileMenu>
      )}
    </>
  )
}

export default BurgerMenu
