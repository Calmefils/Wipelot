import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: 'rgb(57, 62, 70)',
    color: 'rgb(238, 238, 238)',
    borderRadius: '0',
    padding: '8px',
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    backgroundColor: 'rgb(57, 62, 70)',
    color: 'rgb(238, 238, 238)',
    padding: '8px',
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

export default function MeanAndStdTable(props) {
  return (
    <TableContainer
      component={Paper}
      style={{ borderRadius: '0', boxShadow: 'none' }}
    >
      <Table aria-label='customized table'>
        <TableHead>
          <TableRow>
            <StyledTableCell align='center'>Mean</StyledTableCell>
            <StyledTableCell align='center'>Std. Dev.</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <StyledTableRow>
            <StyledTableCell align='center'>
              {props.device?.mean}
            </StyledTableCell>
            <StyledTableCell align='center'>
              {props.device?.std}
            </StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}
