import React, { useState, useEffect } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import BurgerMenu from './Components/BurgerMenu'
import useWindowSize from './Helpers/useWindowSize'
import io from 'socket.io-client'
import Dashboard from './Pages/Dashboard'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import './App.css'
import '../node_modules/react-grid-layout/css/styles.css'
import '../node_modules/react-resizable/css/styles.css'

function App() {
  const size = useWindowSize() // This hook is listening page size changes, heigth and width
  const [socket, setSocket] = useState(null) // This hook is responsible for socket connection
  const [isMenuOpen, setIsMenuOpen] = useState(true) // Holding left hamburger menu status
  const [allDevices, setAllDevices] = useState([]) // Holding devices data coming from socket
  const [layouts, setLayouts] = useState({ lg: [] }) // This hook is holding locations of the card at the dashboard
  const [toolbox, setToolbox] = useState({ lg: [] }) // This hook is holding items at the hambuger menu
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg') // Holding current breakpoint for react grid layout
  const [currentTab, setCurrentTab] = useState(0) // Holding selected tab, by default card view is open.

  // On selected tab changed handler
  const handleChange = (event, newValue) => {
    setCurrentTab(newValue)
  }
  // If some of the cards removed from the dashboard this method rearranges toolbox and layout.
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
  // On click deselect all from the menu, this clears dashboard
  const handleDeselectAll = () => {
    layouts[currentBreakpoint].forEach((item) => {
      onPutItem(item)
    })
  }
  // Connecting to middleware
  useEffect(() => {
    const newSocket = io(`http://localhost:3333`)
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
      <main id='page-wrap'>
        <CssBaseline />
        <Container maxWidth='lg'>
          <div className='App'>
            <header className='app-header'>Wipelot Dashboard</header>
            <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
              <Tabs value={currentTab} onChange={handleChange} centered>
                <Tab label='Card View' />
                <Tab label='Table View' />
              </Tabs>
            </Box>
            {socket ? (
              <Dashboard
                size={size}
                socket={socket}
                layouts={layouts}
                allDevices={allDevices}
                setAllDevices={setAllDevices}
                setToolbox={setToolbox}
                currentBreakpoint={currentBreakpoint}
                onPutItem={onPutItem}
                currentTab={currentTab}
              />
            ) : (
              <h5>Not Connected</h5>
            )}
          </div>
        </Container>
      </main>
    </>
  )
}

export default App
