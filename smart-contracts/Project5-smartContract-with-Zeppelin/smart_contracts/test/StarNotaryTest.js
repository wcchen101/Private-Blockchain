const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {

    beforeEach(async function() {
        this.contract = await StarNotary.new({from: accounts[0]})
    })

    describe('can create a star', () => {
        it('can create a star and get its name, coordinators, story', async function () {
            //
            await this.contract.createStar('awesome star!', '1', '2', '3', 'story', 1, {from: accounts[0]})
            let star = await this.contract.tokenIdToStarInfo(1)
            console.log(star[0])
            assert.equal(star[0], 'awesome star!')
            assert.equal(star[1], '123')
            assert.equal(star[2], 'story')
        })
    })

    describe('buying and selling stars', () => {
        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]

        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar('awesome star!', '1', '2', '3', 'story', starId, {from: user1})
        })

        it('user1 can put up their star for sale', async function () {
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})

            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => {
            beforeEach(async function () {
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() {
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () {
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })

    describe('check create a star exist', () => {

        it('can check if a star exists or not', async function () {

            await this.contract.createStar('awesome star!', '1', '2', '3', 'story', 1, {from: accounts[0]})
            let isExist1 = await this.contract.checkIfStarExist('1', '2', '3')
            let isExist2 = await this.contract.checkIfStarExist('2', '3', '4')

            console.log(isExist1, isExist2)
            assert.equal(isExist1, true)
            assert.equal(isExist2, false)
        })
    });

    describe('check mint function ', () => {
        let user1 = accounts[1]
        let user2 = accounts[2]
        let tokenId = 1;
        let tx;

        beforeEach(async function () {
            await this.contract.mint(tokenId, {from: user1})
            tx = await this.contract.transferFrom(user1, user2, tokenId, {from: user1})
        })

        it('token has new owner', async function() {
          assert.equal(await this.contract.ownerOf(tokenId), user2)
        })

        it('emits this correct event', async function () {
          assert.equal(tx.logs[0].event, 'Transfer')
          assert.equal(tx.logs[0].args.tokenId, tokenId)
          assert.equal(tx.logs[0].args.to, user2)
          assert.equal(tx.logs[0].args.from, user1)
        })
    });

    describe('can create a token', () => {
      let user1 = accounts[1]
      let tokenId = 1;
      let tx;

      beforeEach(async function () {
          tx = await this.contract.mint(tokenId, {from: user1})
      });

      it('ownerOf tokenId is user1', async function() {
        assert.equal(await this.contract.ownerOf(tokenId), user1)
      });

      it('balance of user 1 is incremented by 1', async function() {
        let balance = await this.contract.balanceOf(user1)
        assert.equal(balance.toNumber(), 1)
      });

      it('emits the correct event during creation of a new token', async function() {
        assert.equal(tx.logs[0].event, 'Transfer')
      });
    })
})
