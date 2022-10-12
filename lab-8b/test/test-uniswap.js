const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("test uniswap", () => {
    let factory, uniswap, tokenA, tokenB, pool, poolAddr, account;

    it("test add liquidity", async () => {
        account = await ethers.getSigner();

        // Deploy uniswap contracts
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await Factory.deploy(account.address);
        const Weth = await ethers.getContractFactory("WETH9");
        const weth = await Weth.deploy();
        const Uniswap = await ethers.getContractFactory("UniswapV2Router02");
        uniswap = await Uniswap.deploy(factory.address, weth.address);

        // Deploy TokenA and TokenB
        const ERC20 = await ethers.getContractFactory("ERC20");
        tokenA = await ERC20.deploy(ethers.utils.parseEther("2"));
        tokenB = await ERC20.deploy(ethers.utils.parseEther("2"));

        // Add Liquidity (10,000 TokenA and 10,000 TokenB)
        await tokenA.approve(uniswap.address, 10_000);
        await tokenB.approve(uniswap.address, 10_000);
        const ts = (await ethers.provider.getBlock()).timestamp + 1000;
        await uniswap.addLiquidity(
            tokenA.address,
            tokenB.address,
            10_000,
            10_000,
            0,
            0,
            account.address,
            ts
        );

        const logs = await factory.queryFilter(
            factory.filters.PairCreated(null)
        );
        poolAddr = logs[0].args.pair;
        console.log(poolAddr);
    });

    getReserves = async (tokenA, tokenB) => {
        pool = await ethers.getContractAt("UniswapV2Pair", poolAddr);
        const { _reserve0, _reserve1 } = await pool.getReserves();
        return tokenA.address < tokenB.address
            ? { reserveA: _reserve0, reserveB: _reserve1 }
            : { reserveA: _reserve1, reserveB: _reserve0 };
    };

    it("check pool reserves", async () => {
        const reserves = await getReserves(tokenA, tokenB);
        console.log(reserves);
    });

    const GetAmountOut = (amountIn, reserveIn, reserveOut) => {
        amountIn = BigNumber.from(amountIn);
        const amountInWithFee = amountIn.mul(997);
        const numerator = amountInWithFee.mul(reserveOut);
        const denominator = reserveIn.mul(1000).add(amountInWithFee);
        amountOut = numerator / denominator;
        return BigNumber.from(Math.floor(amountOut));
    };

    it("Pay 2000 TokenA for TokenB", async () => {
        const amtA = 2000;

        // Create a mock trader and transfer some tokenA and tokenB to it
        const trader = await ethers.getSigner(1);
        await tokenA.transfer(trader.address, ethers.utils.parseEther("1"));
        await tokenB.transfer(trader.address, ethers.utils.parseEther("1"));
        console.log(
            `Trader: tokenA before=`,
            await tokenA.balanceOf(trader.address)
        );
        console.log(
            `Trader: tokenB before=`,
            await tokenB.balanceOf(trader.address)
        );

        // Find TokenB Amount to Receive
        const reservesBefore = await getReserves(tokenA, tokenB);
        console.log("trade: reservesBefore=", reservesBefore);
        const amtB = GetAmountOut(
            amtA,
            reservesBefore.reserveA,
            reservesBefore.reserveB
        );

        // Reserves Before

        // Approve router to withdraw 2000 TokenA from trader account
        await tokenA.connect(trader).approve(uniswap.address, amtA);

        // Trade 2000 TokenA for 1662 TokenB using trader account
        const ts = (await ethers.provider.getBlock()).timestamp + 1000;
        await uniswap
            .connect(trader)
            .swapExactTokensForTokens(
                amtA,
                amtB,
                [tokenA.address, tokenB.address],
                trader.address,
                ts
            );

        // Check Balance After
        console.log(
            `Trader: tokenA after=`,
            await tokenA.balanceOf(trader.address)
        );
        console.log(
            `Trader: tokenB after=`,
            await tokenB.balanceOf(trader.address)
        );

        // Check reserves after
        const reservesAfter = await getReserves(tokenA, tokenB);
        console.log("trade: reservesAfter=", reservesAfter);
    });

    it("liquidate pool", async () => {
        // Check LP's liquidity token balance
        const lpBefore = await pool.balanceOf(account.address);
        console.log("LP: liquidity before=", lpBefore);
        const lpTokenABefore = await tokenA.balanceOf(account.address);
        console.log("LP: tokenA before=", lpTokenABefore);
        const lpTokenBBefore = await tokenB.balanceOf(account.address);
        console.log("LP: tokenB before=", lpTokenBBefore);
        const reservesBefore = await getReserves(tokenA, tokenB);
        console.log("Pool: reserves before=", reservesBefore);

        // Approve router to withdraw all LP tokens
        await pool.approve(uniswap.address, lpBefore);

        // Remove Liquidity. Liquidate all LP's liquidity tokens
        const ts = (await ethers.provider.getBlock()).timestamp + 1000;

        await uniswap.removeLiquidity(
            tokenA.address,
            tokenB.address,
            lpBefore,
            0,
            0,
            account.address,
            ts
        );

        // Check balance after
        console.log("AFTER--------");
        const lpAfter = await pool.balanceOf(account.address);
        console.log("LP: liquidity After=", lpAfter);
        const lpTokenAAfter = await tokenA.balanceOf(account.address);
        console.log("LP: tokenA After=", lpTokenAAfter);
        const lpTokenBAfter = await tokenB.balanceOf(account.address);
        console.log("LP: tokenB After=", lpTokenBAfter);
        const reservesAfter = await getReserves(tokenA, tokenB);
        console.log("Pool: reserves After=", reservesAfter);
    });

    it("test add liquidity again", async () => {

        // Check reserves
        const reservesBefore = await getReserves(tokenA, tokenB);
        console.log(
            "Reserves Before funding 20,000 TokenA and 50,000 TokenB:",
            reservesBefore
        );

        // Add Liquidity (10,000 TokenA and 10,000 TokenB)
        await tokenA.approve(uniswap.address, 20_000);
        await tokenB.approve(uniswap.address, 50_000);
        const ts = (await ethers.provider.getBlock()).timestamp + 1000;
        await uniswap.addLiquidity(
            tokenA.address,
            tokenB.address,
            20_000,
            50_000,
            0,
            0,
            account.address,
            ts
        );

        const logs = await factory.queryFilter(
            factory.filters.PairCreated(null)
        );
        poolAddr = logs[0].args.pair;
        console.log(poolAddr);

        // Check reserves after
        const reservesAfter = await getReserves(tokenA, tokenB);
        console.log(
            "Reserves After funding 20,000 TokenA and 50,000 TokenB:",
            reservesAfter
        );
    });
});