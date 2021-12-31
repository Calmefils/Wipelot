import * as React from 'react'
import { DataGrid } from '@mui/x-data-grid'

const columns = [
  { field: 'id', headerName: 'ID', description: "Socket Unique Number", type:"number", width: 70 },
  { field: 'value', headerName: 'Value', type:"number", width: 130 },
  { field: 'timestamp', headerName: 'Timestamp', sortable: false, width: 130 },
  { field: 'std', headerName: 'Std. Dev.', description: "Standard Deviation", type:"number", width: 130 },
  { field: 'mean', headerName: 'Mean', type:"number", width: 130 },

  /*{
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 90,
  },
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (params) =>
      `${params.getValue(params.id, 'firstName') || ''} ${
        params.getValue(params.id, 'lastName') || ''
      }`,
  },*/
]

const rows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
]

export default function DataTable({layouts, currentBreakpoint, allDevicesData, onPutItem }) {
  return (
    <div style={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={allDevicesData}
        columns={columns}
        //pageSize={5}
        //rowsPerPageOptions={[5]}
        //checkboxSelection
      />
    </div>
  )
}
