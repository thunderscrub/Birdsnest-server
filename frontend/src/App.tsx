import { useEffect, useState } from 'react'
import './App.css'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from '@mui/material/styles';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:8000/getData');
      const json = await response.json();
      setData(json);
    };
    fetchData()
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {data ? (
        <pre>{makeTable(data)}</pre>
      ) : (
        'Loading...'
      )}
    </div>
  );
}

function makeTable(pilotList: {[key: string]:{[key: string]: any}}){
  return (
    <ThemeProvider theme={darkTheme}>
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
    <TableContainer sx={{ maxHeight: 600 }}>
      <Table stickyHeader sx={{ minWidth: 1000 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Pilot full name</TableCell>
            <TableCell align="right">Email address</TableCell>
            <TableCell align="right">Phone number</TableCell>
            <TableCell align="right">Closest distance</TableCell>
            <TableCell align="right">Data valid until</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(pilotList).reverse().map((pilot) => (
            <TableRow
              key={pilot[0]}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {pilot[1].pilotData.firstName+" "+pilot[1].pilotData.lastName}
              </TableCell>
              <TableCell align="right">{pilot[1].pilotData.email}</TableCell>
              <TableCell align="right">{pilot[1].pilotData.phoneNumber}</TableCell>
              <TableCell align="right">{(pilot[1].distance/1000).toFixed(2)+" m"}</TableCell>
              <TableCell align="right">{(new Date(pilot[1].persistUntil)).toUTCString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Paper>
    </ThemeProvider>
  );
}

export default App;
