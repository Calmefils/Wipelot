import { push as Menu, slide as MobileMenu } from 'react-burger-menu'
import './BurgerMenu.css'

function BurgerMenu(props) {
  function handleKeyPress(e) {
    e = e || window.event
    if (e.key === 'Tab' || e.keyCoda === 9) {
    }
  }
  function MenuList() {
    return (
      <>
        {' '}
        <h1> Selam </h1>
      </>
    )
  }
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
          noTransition
          customOnKeyDown={handleKeyPress}
        >
          <MenuList />
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
          <MenuList />
        </MobileMenu>
      )}
    </>
  )
}

export default BurgerMenu
