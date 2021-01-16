// process.env.LANG = 'en_US.UTF-8' // 统一语言环境, 以避免产生不同结果
process.on('uncaughtException', err => {
  console.log(err)
  allTestAfter()
  process.exit()
})
process.on('SIGINT', err => {
  console.log('中途退出测试')
  allTestAfter()
  process.exit()
})
const fs = require('fs')
const os = require('os')
const assert = require('assert')
const axios = require('axios')
const shelljs = require('shelljs')
const isWin = os.type() === 'Windows_NT'
const child_process = require('child_process')
const {
  exec,
} = child_process
const packgeAdmin = shelljs.which('cnpm') ? 'cnpm' : 'npm'

function obj2str(obj) {
  return JSON.stringify(obj, null, 2)
}

function getType(data, type) {
  const dataType = Object.prototype.toString.call(data).replace(/(.* )(.*)\]/, '$2').trim().toLowerCase()
  return type ? (dataType === type.trim().toLowerCase()) : dataType
}

/**
 * 判断命令的输出是否含有匹配的正则
 * @param {*} cmd 命令
 * @param {*} param1.re 正则
 * @param {*} param1.timeOut 超时, 默认 5000
 * @param {*} param1.fn 运行后执行的函数, 接收 kill(), res, outText, pid
 */
async function testRun(cmd, {
  re = ``,
  timeOut = 5000,
  fn = (kill, res, outText, pid) => {
    kill()
    return res
  },
} = {}) {
  console.log(`cmd:`)
  console.log(cmd)
  let pid = 0
  let outText = ``
  const { exec } = require('child_process')
  const res = await new Promise((resolve, reject) => {
    const process = exec(cmd)
    pid = process.pid
    const outFn = data => {
      console.log(data)
      outText += data
      if(data.match(re)) {
        resolve(true)
      }
    }
    process.stdout.on('data', outFn)
    process.stderr.on('data', outFn)
    setInterval(() => {
      timeOut = timeOut - 100
      if(timeOut <= 0) {
        resolve(false)
      }
    }, 100);
  })
  return fn(() => {

    const cmd = `fkill -f ${pid}`
    console.log(`cmd`, cmd)
    exec(cmd)
  }, res, outText, pid)
}

function execSync(cmd, option, out = true) {
  if(getType(option, 'boolean')) {
    out = option
    option = {}
  }
  console.log(`cmd:\r\n${cmd}\r\n`)
  let str = child_process.execSync(cmd, option).toString().trim()
  out && console.log(str)
  return str
}

function spawn(arr, option = {}) {
  console.log(`arr:\r\n${obj2str(arr)}\r\n`)
  console.log(`cmd:\r\n${arr.join(' ')}\r\n`)
  let [arg1, ...argMore] = arr
  child_process.spawn(arg1, argMore, {
    stdio: 'inherit',
    ...option
  })
}

function requireUncached(filePath) { // 避免 require 使用缓存
  delete require.cache[require.resolve(filePath)]
  return require(filePath)
}

function uuid(sep = '') {
  let increment = process.increment === undefined ? (process.increment = 1) : (process.increment = (process.increment + 1))
  // let str = `${increment}_${process.pid}_${('' + (Math.random() + Math.random()))}`
  // console.log('increment', increment)
  // return str.replace('.', '').replace(/_/g, sep)
  return `${Number(String(Date.now()).slice(-5))}_${String(Math.random()).slice(-2)}_${process.pid}_${increment}`.replace(/_/g, sep)
}

function sleep(time = 1000) { return new Promise((res, rej) => setTimeout(res, time)) }

function clearRequireCache() { // 清除 require 缓存, 使用场景: 当 require 同一个 json 文件, 但这文件改变后再 require 时并没有改变
  Object.keys(require.cache).forEach(key => delete require.cache[key])
}

function absPath(file = '') { return require('path').resolve(__dirname, file) }

function allTestBefore() {
  console.log('备份用户配置')
}

function allTestAfter() {
  console.log('恢复用户配置')
  setTimeout(() => {
    process.exit()
  }, 0);
}

function mockm() {
  async function testConfig({
    cfgPath = `${os.tmpdir()}/test.${uuid()}.config.js`, // 配置文件路径
    rootTemplate = `object`, // object function
    configText = ``, // 指定内容时忽略 rootTemplate 和 mmConfig
    mmConfig = {
      port: 9010,
    },
    testRunOption = {},
  } = {}) {
    if(getType(testRunOption, `regexp`)) {
      testRunOption = {
        re: testRunOption
      }
    }

    const fs = require(`fs`)
    let str
    if(rootTemplate === `object`) {
      str = `module.exports = ${JSON.stringify(mmConfig, null, 2)}`
    }
    if(rootTemplate === `function`) {
      str = `module.exports = () => {
        return ${JSON.stringify(mmConfig, null, 2)}
      }`
    }
    if(configText) {
      str = `module.exports = ${configText}`
    }
    fs.writeFileSync(cfgPath, str)
    let res = await testRun(`node ${absPath(`../run.js`)} config=${cfgPath}`, testRunOption)
    return res
  }
  return {
    testConfig,
  }
}

module.exports = {
  axios,
  mockm: mockm(),
  testRun,
  exec,
  os,
  packgeAdmin,
  allTestAfter,
  allTestBefore,
  fs,
  assert,
  shelljs,
  isWin,
  execSync,
  spawn,
  requireUncached,
  uuid,
  sleep,
  clearRequireCache,
  absPath,
}
