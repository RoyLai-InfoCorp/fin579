const { expect } = require("chai");
describe("Test ERC20", () => {
  let erc20;
  let accounts;
  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ERC20");
    erc20 = await factory.deploy(
      "ERC20",
      "ERC20",
      ethers.utils.parseUnits("1000", "ether"),
      accounts[0].address
    );
  });

  it("Should call name() and get ERC20", async () => {
    let name = await erc20.name();
    expect(name).to.equals("ERC20");
  });

  it("Should transfer 1 ERC20 from accounts[0] to accounts[1]", async () => {
    const before = await erc20.balanceOf(accounts[1].address);

    // Transfer
    const response = await erc20.transfer(accounts[1].address, 1);
    const receipt = await response.wait();
    console.log("transfer: gasUsed=", receipt.gasUsed);

    // Assert
    const after = await erc20.balanceOf(accounts[1].address);
    expect(before.add(1).toNumber()).equals(after.toNumber());
  });

  it("Should approve and transferFrom 1 ERC20 from accounts[0] to accounts[1]", async () => {
    const before = await erc20.balanceOf(accounts[1].address);

    // Approve and TransferFrom
    let response = await erc20.approve(accounts[1].address, 1);
    let receipt = await response.wait();
    console.log("approve: gasUsed=", receipt.gasUsed);

    response = await erc20
      .connect(accounts[1])
      .transferFrom(accounts[0].address, accounts[1].address, 1);

    receit = await response.wait();
    console.log("transferFrom: gasUsed=", receipt.gasUsed);

    // Assert
    const after = await erc20.balanceOf(accounts[1].address);
    expect(before.add(1).toNumber()).equals(after.toNumber());
  });

  it("Should transfer 1 ERC20 and receive Transfer event", async () => {
    // Transfer
    const response = await erc20.transfer(accounts[1].address, 1);
    const receipt = await response.wait();
    const transfer = receipt.events.find((x) => x.event === "Transfer");
    expect(transfer.args._from).to.equals(accounts[0].address);
    expect(transfer.args._to).to.equals(accounts[1].address);
    expect(transfer.args._value.toNumber()).to.equals(1);
  });
});