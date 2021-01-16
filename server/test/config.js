
const util = require('./util.js')

with(util) {
  describe('配置文件功能', () => {
    describe('根结点配置', () => {
      describe('对象写法', () => {
        it('port', async () => {
          assert.ok(
            await util.mockm.testConfig({
              rootTemplate: `object`,
              mmConfig: {
                port: 9010
              },
              testRunOption: /9010/
            })
          )
        })
      })
      describe('函数写法', () => {
        it(`函数配置与接收参数`, async () => {
          const id = uuid()
          assert.ok(
            await util.mockm.testConfig({
              configText: `
                util => {
                  const { toolObj } = util
                  console.log(${id}, typeof(toolObj))
                  return {}
                }
              `,
              testRunOption: new RegExp(`${id} object`)
            })
          )
        })
      })
    })
    describe('配置项', () => {
      it(`disable - false`, async () => {
        let id = uuid()
        assert.ok(
          await util.mockm.testConfig({
            configText: `
              {
                disable: false,
                api: {
                  "/ip": {msg: ${id}}
                }
              }
            `,
            testRunOption: {
              re: /9000/,
              async fn(kill, res) {
                const data = (await axios.get(`http://127.0.0.1:9000/ip`)).data
                kill()
                return Boolean(data.msg) === true
              }
            }
          })
        )
      })
      it(`disable - true`, async () => {
        let id = uuid()
        assert.ok(
          await util.mockm.testConfig({
            configText: `
              {
                disable: true,
                api: {
                  "/ip": {msg: ${id}}
                }
              }
            `,
            testRunOption: {
              re: /9000/,
              async fn(kill, res) {
                const data = (await axios.get(`http://127.0.0.1:9000/ip`)).data
                kill()
                return Boolean(data.msg) === false
              }
            }
          })
        )
      })
      it(`osIp - 127.0.0.1`, async () => {
        assert.ok(
          await util.mockm.testConfig({
            mmConfig: {
              osIp: `127.0.0.1`
            },
            testRunOption: new RegExp(`127.0.0.1`)
          })
        )
      })
      it.only(`port - 9010`, async () => {
        assert.ok(
          await util.mockm.testConfig({
            mmConfig: {
              port: 9010
            },
            testRunOption: new RegExp(`9010`)
          })
        )
      })
    })
  })
}
