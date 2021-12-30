import React, { useState, useEffect } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import BurgerMenu from './Components/BurgerMenu'
import useWindowSize from './Helpers/useWindowSize'
import io from 'socket.io-client'
import Dashboard from './Components/Dashboard'
import generateLayout from './Helpers/generateLayout'
import './App.css'
import '../node_modules/react-grid-layout/css/styles.css'
import '../node_modules/react-resizable/css/styles.css'

function App() {
  const size = useWindowSize()
  const [socket, setSocket] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [allDevices, setAllDevices] = useState([])
  const [layouts, setLayouts] = useState({ lg: [] })
  const [toolbox, setToolbox] = useState({ lg: [] })
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg')

  const onPutItem = (item) => {
    setToolbox((prev) => {
      return {
        ...prev,
        [currentBreakpoint]: [...(prev[currentBreakpoint] || []), item],
      }
    })
    setLayouts((prev) => {
      return {
        ...prev,
        [currentBreakpoint]: prev[currentBreakpoint].filter(
          ({ i }) => i !== item.i
        ),
      }
    })
  }
  const handleDeselectAll = () => {
    layouts[currentBreakpoint].forEach((item) => {
      onPutItem(item)
    })
  }

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
        socket={socket}
        toolbox={toolbox}
        setToolbox={setToolbox}
        currentBreakpoint={currentBreakpoint}
        layouts={layouts}
        setLayouts={setLayouts}
        allDevices={allDevices}
        setAllDevices={setAllDevices}
        handleDeselectAll={handleDeselectAll}
      />
      <main
        id='page-wrap'
        className={isMenuOpen === true ? 'openMenuSize' : 'closeMenuSize'}
      >
        <CssBaseline />
        <Container maxWidth='lg'>
          <div className='App'>
            <header className='app-header'>Wipelot Dashboard</header>
            {socket ? (
              <Dashboard
                socket={socket}
                layouts={layouts}
                allDevices={allDevices}
                setAllDevices={setAllDevices}
                setToolbox={setToolbox}
                currentBreakpoint={currentBreakpoint}
                onPutItem={onPutItem}
              />
            ) : (
              <div>Not Connected</div>
            )}
          </div>
        </Container>
      </main>
    </>
  )
}

export default App
