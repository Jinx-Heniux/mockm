const util = require('./util.js')

with (util) {
  allTestBefore()

  after(() => {
    console.log('测试完成')
    allTestAfter()
  })

  afterEach(() => {
  })
}
