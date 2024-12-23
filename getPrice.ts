import { Connection, PublicKey } from "@solana/web3.js";
import { LIQUIDITY_STATE_LAYOUT_V4 } from "@raydium-io/raydium-sdk";

const SOL_USDC_POOL_ID = "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2";
// const SOL_USDC_POOL_ID = "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj";
// const SOL_USDC_POOL_ID = "CYbD9RaToYMtWKA7QZyoLahnHdWq553Vm62Lh6qWtuxq";

async function getTokenBalance(
  connection: Connection,
  vault: PublicKey,
  decimals: number
): Promise<number> {
  const balance = await connection.getTokenAccountBalance(vault);
  return parseFloat(balance.value.amount) / Math.pow(10, decimals);
}

async function parsePoolInfo() {
  try {
    console.log("Fetching WSOL/USDC price...");
    const startTime = Date.now();
    const connection = new Connection(
      "https://api.mainnet-beta.solana.com",
      "confirmed"
    );

    const info = await connection.getAccountInfo(
      new PublicKey(SOL_USDC_POOL_ID)
    );
    if (!info) return;

    // Assuming the structure was successfully decoded
    const poolState = LIQUIDITY_STATE_LAYOUT_V4.decode(info.data);

    // Directly use the specific decimals for SOL and USDC
    const baseTokenDecimals = 9; // Decimals for SOL
    const quoteTokenDecimals = 6; // Decimals for USDC

    const baseTokenBalance = await getTokenBalance(
      connection,
      poolState.baseVault,
      baseTokenDecimals
    );
    const quoteTokenBalance = await getTokenBalance(
      connection,
      poolState.quoteVault,
      quoteTokenDecimals
    );

    const priceOfBaseInQuote = quoteTokenBalance / baseTokenBalance;
    const endTime = Date.now();
    const duration = endTime - startTime; // Calculate duration

    //   console.log("Decoded Pool Data:", poolState);
    console.log(`Price of 1 SOL in USDC: ${priceOfBaseInQuote.toFixed(4)}`); // Adjusted for decimals
    console.log(`Fetch took ${duration} milliseconds`);
  } catch (err) {
    console.error("Error fetching price:", err);
  }
}

parsePoolInfo();
