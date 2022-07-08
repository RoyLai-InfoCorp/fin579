import React, { useState, useRef } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
    CssBaseline,
    Container,
    Grid,
    Button,
    TextField,
    CircularProgress,
} from "@mui/material";
import {distill, CHRONIUM_ADDRESS, getTimeBalance, balanceOf, sellTokens, buyTokens, tokens} from './dapp.js';

const Row = ({symbol,tokenAddress,tokenBalance})=>{
    const inputRef = useRef({});

    const handleBuy = async (e)=>{
        const quantity = inputRef.current['quantity'].value;
        await buyTokens(quantity,tokenAddress, CHRONIUM_ADDRESS);
        console.log(`Buy ${quantity} of ${symbol}`);
    }

    const handleSell = async (e)=>{
        const quantity = inputRef.current['quantity'].value;
        await sellTokens(quantity,tokenAddress, CHRONIUM_ADDRESS);
        console.log(`Sell ${quantity} of ${symbol}`);
    }

    return (<form onSubmit={() => inputRef.current.value}>

        <Grid container columns={16} spacing={2} sx={{ mb: 2 }} alignItems='center' justifyContent='space-between'>
            <Grid item xs={2}>
                {symbol}
            </Grid>
            <Grid item xs={5} sx={{fontSize:'14px'}}>
                {tokenAddress}
            </Grid>
            <Grid item xs={3} sx={{fontSize:'14px'}}>
                {tokenBalance}
            </Grid>
            <Grid item xs={2}>
                <TextField inputRef={el=>inputRef.current['quantity']=el}></TextField>
            </Grid>
            <Grid item xs={2}>
                <Button onClick={handleBuy}>Buy</Button>
            </Grid>
            <Grid item xs={1}>
                <Button onClick={handleSell}>Sell</Button>
            </Grid>
        </Grid>
    </form>)
}

const App = () => {
    const [chroniumBalance,setChroniumBalance] = useState(0);
    const [timeBalance,setTimeBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenBalances,setTokenBalances]=useState([]);

    const handleDistill = async (e)=>{
        setIsLoading(true);
        await distill(timeBalance);
        setIsLoading(false);
    }
    const handleCheckBalance = async (e)=>{
        setIsLoading(true);
        let balanceA = await balanceOf(CHRONIUM_ADDRESS);
        setChroniumBalance(balanceA);
        let balanceB = await getTimeBalance();
        setTimeBalance(balanceB);
        setIsLoading(false);

        const tokenBalances = []
        for (const token of tokens)
        {
            var tokenBalance = (await balanceOf(token.tokenAddress)).toString();
            tokenBalances.push(tokenBalance);
        }
        setTokenBalances(tokenBalances);
    }

    const theme = createTheme({
        palette: {
            mode: "dark",
        },
    });

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Container>
                    <h1>GBA Exchange</h1>
                    <h2>Chronium Balance</h2>
                    <Grid container justifyContent='space-between' alignItems='center' >
                        <Grid item xs={2}>
                            Chronium (CHRON):
                        </Grid>
                        <Grid item xs={3}>
                            <TextField value={chroniumBalance}/>
                        </Grid>
                        <Grid item xs={1}>
                            Time:
                        </Grid>
                        <Grid item xs={3}>
                            <TextField value={timeBalance}/>
                        </Grid>
                        {isLoading ? (<Grid container item xs={2} justifyContent='center' ><CircularProgress /></Grid>) : (
                            <>
                            <Grid container item xs={2} justifyContent='space-evenly' >
                                <Button variant='contained' onClick={handleCheckBalance}>Balance</Button>
                                <Button variant='contained' onClick={handleDistill}>Distill</Button>
                            </Grid>
                            </>
                        )}
                    </Grid>
                    <hr></hr>
                    <h2>Trade</h2>
                    <Grid container columns={16} sx={{ mb: 2 }} alignItems='center' justifyContent='space-between'>
                        <Grid item xs={2}>
                            Token
                        </Grid>
                        <Grid item xs={5}  >
                            Token Address
                        </Grid>
                        <Grid item xs={3}>
                            Balance (Token)
                        </Grid>
                        <Grid item xs={2}>
                            Amount (Token)
                        </Grid>
                        <Grid item xs={3}>
                        </Grid>
                    </Grid>
                    {tokens.map((x,idx)=>(
                        <Row key={idx} symbol={x.symbol} tokenAddress={x.tokenAddress} tokenBalance={tokenBalances[idx]} />
                    ))}
                </Container>
            </ThemeProvider>
        </>
    );
};

export default App;
