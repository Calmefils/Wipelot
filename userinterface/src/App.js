import React, { useState, useEffect } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import BurgerMenu from './Components/BurgerMenu'
import { Responsive, WidthProvider } from 'react-grid-layout'
import useWindowSize from './Helpers/useWindowSize'
import generateLayout from './Helpers/generateLayout'
import io from 'socket.io-client'
import Messages from './Components/Messages'
import MessageInput from './Components/MessageInput'
import './App.css'
import '../node_modules/react-grid-layout/css/styles.css'
import '../node_modules/react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

function App() {
  const size = useWindowSize()
  const [socket, setSocket] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [layouts, setLayouts] = useState({ lg: generateLayout() })

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:3000`)
    setSocket(newSocket)
    return () => newSocket.close()
  }, [setSocket])

  return (
    <>
      <BurgerMenu
        pageWrapId={'page-wrap'}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        size={size}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
      <main
        id='page-wrap'
        className={isMenuOpen === true ? 'openMenuSize' : 'closeMenuSize'}
      >
        <CssBaseline />
        <Container maxWidth='lg'>
          <div className='App'>
            <header className='app-header'>React Chat</header>
            {socket ? (
              <div className='chat-container'>
                <Messages socket={socket} />
                <MessageInput socket={socket} />
              </div>
            ) : (
              <div>Not Connected</div>
            )}
          </div>
          <ResponsiveGridLayout
            className='layout'
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          >
            {layouts.lg.map((l, i) => (
              <div
                key={i}
                className={l.static ? 'static' : ''}
                style={{ backgroundColor: 'blue' }}
              >
                {l.static ? (
                  <span
                    className='text'
                    title='This item is static and cannot be removed or resized.'
                  >
                    Static - {i}
                  </span>
                ) : (
                  <span className='text'>{i}</span>
                )}
              </div>
            ))}
          </ResponsiveGridLayout>
        </Container>
      </main>
    </>
  )
}

export default App
