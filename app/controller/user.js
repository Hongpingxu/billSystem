'use strict';

function filterData (data, year, month) {
  let filterData = []
  for (let i = 0; i < data.length; i++) {
    let dateArr = data[i].date.split('-')
    if (dateArr[0] === year) {
      if (dateArr[1] === month) {
        filterData.push(data[i])
      }
    }
  }
  return filterData
}

function sortByobj (obj) {
  return function (a, b) {
    return b[obj] - a[obj] // 降序排列
  }
}

const Controller = require('egg').Controller;

class UserController extends Controller {

  async login() {
    const ctx = this.ctx;
    const login = ctx.request.body;
    const dbinfo = await this.app.mysql.get('user', {username:login.username});
    console.log(dbinfo)
    if(!dbinfo) {
      this.ctx.response.body = {
        tips: '该用户不存在',
        showTips: true,
        state: -1
      }
    } else if (dbinfo.username === login.username && dbinfo.password !== login.password) {
      this.ctx.response.body = {
        tips: '密码错误，请重新输入',
        showTips: true,
        state: 0
      }
    } else if (dbinfo.username === login.username && dbinfo.password === login.password){
      // console.log(dbinfo)
      this.ctx.response.body = {
        tips: '登录成功,即将跳转',
        showTips: true,
        state: 1
      };
    }else {
      this.ctx.body = '我们检测不到错误，请联系开发者'
    }
    // ctx.response.body = login;
    // ctx.body = login;
    
    // this.ctx.response.body = {
    //   success: true,
    //   message: "发生不知名错误，导致删除失败",
    //   content: '',
    // };
    console.log('用户登录请求 over')
  }

  async info() {
    const ctx = this.ctx;
    const userId = ctx.params.id;
    const user = await this.app.mysql.get('user', { uid: userId });//查询 /user/finduser/:id
    ctx.body = user;
  }

  async useradd() {
    const ctx = this.ctx;
    const userinfo = ctx.request.body;
    const user = await this.app.mysql.get('user', { username:userinfo.username })
    if (user) {
      ctx.body = {
        msg: '该用户已存在',
        code: 0
      }
    } else {
      const result = await this.app.mysql.insert('user', userinfo);
      ctx.body = {
        msg: '注册成功，即将跳转登录',
        code: 1
      }
      console.log('用户注册请求完成')
    }
  }
  
  async finduser(username) {
    const redata = this.ctx.request.body.username
    console.log(redata)
    const user = await this.app.mysql.get('user', {username: redata})
    if (user) {
      user.state = 1
      user.msg = '成功查找到该用户'
      this.ctx.body = user
    } else {
      const result = {}
      result.state = 0
      result.msg = '该用户不存在'
      this.ctx.body = result
    }
    console.log(user, '登录前校验用户名密码')
  }

  async submitrecord() {
    const ctx = this.ctx
    const billdata = ctx.request.bady
    // console.log(ctx.request.body)
    // ctx.request.body.uid = 4
    // console.log(ctx.request.body)
    // console.log(billdata)
    await this.app.mysql.insert('bill', ctx.request.body)
    // console.log('数据成功写入数据库')
    ctx.body = '数据成功写入数据库'
  }

  async getlist() {
    const body = this.ctx.request.body
    const uname = body.username
    // const result = await this.app.mysql.get('bill', {username: ctx.request.body.username})
    const result = await this.app.mysql.select('bill', {
      where: {username: uname},
      orders: [['date', 'desc']]
    })
    this.ctx.body = result
    // console.log(result, 'getlist调用后打印')
  }

  async getSamedayData () {
    const body = this.ctx.request.body
    const uname = body.username
    const year = body.year
    const month = body.month
    const result = await this.app.mysql.select('bill', {
      where: {username: uname},
      orders: [['date', 'desc']]
    })
    const sameDaydata = filterData(result, year, month)
    // const map = []
    // const dest = []
    // console.log(sameDaydata,'sameday')
    // for (let i = 0; i < sameDaydata.length; i++) {
    //   let time = sameDaydata[i].date
    //   if (map.indexOf(time) === -1) {
    //     dest.push({
    //       sortindex: time.split('-')[2],
    //       date: time,
    //       list: [sameDaydata[i]]
    //     })
    //     map.push(time)
    //   } else {
    //     for (let j = 0; j < dest.length; j++) {
    //       if (dest[j].date === time) {
    //         dest[j].list.push(sameDaydata[i])
    //       }
    //     }
    //   }
    // }
    // dest.sort(sortByobj('sortindex'))
    // console.log(dest)
    this.ctx.body = sameDaydata
  }

  async getSortList() {
    const body = this.ctx.request.body
    const uname = body.username
    const year = body.year
    const month = body.month
    const icontype = body.icontype
    const result = await this.app.mysql.select('bill', {
      where: {username: uname},
      orders: [['date', 'desc']]
    })
    const sameDaydata = await filterData(result, year, month)
    console.log(sameDaydata,'first')
    const map = []
    const dest = []
    for (let n = 0, len = sameDaydata.length; n < len; n++) {
      if (sameDaydata[n].icontype !== icontype) {
        sameDaydata.splice(n,1)
      }
    }
    console.log(sameDaydata,'second')
    for (let i = 0; i < sameDaydata.length; i++) {
      let time = sameDaydata[i].date
      if (map.indexOf(time) === -1) {
        dest.push({
          sortindex: time.split('-')[2],
          date: time,
          list: [sameDaydata[i]]
        })
        map.push(time)
      } else {
        for (let j = 0; j < dest.length; j++) {
          if (dest[j].date === time) {
            dest[j].list.push(sameDaydata[i])
          }
        }
      }
    }
    dest.sort(sortByobj('sortindex'))
    this.ctx.body = dest
  }

  async getEchartData() {
    const body = this.ctx.request.body
    const uname = body.username
    const year = body.year
    const month = body.month
    const type = body.type
    const queryresult = await this.app.mysql.select('bill', {
      where: {username: uname},
      orders: [['date', 'desc']]
    })
    const result = filterData(queryresult, year, month)
    // console.log(result, '排序之后的钱')
    var totaldata = []
    var state = ''
    var totalmoney = 0
    for (var i = 0; i < result.length; i++) {
      state = totaldata.some(function(item) {
        if (item.name === result[i].icontype) {
          return true;
        }
      })
      if (!state) {
        totaldata.push({
          name: result[i].icontype,
          value: parseFloat(result[i].money),
          type: result[i].type,
          count: 1
        })
      } else {
        // console.log('testtest11111')
        // index = totaldata.findIndex(item => {
        //   item.name === result[i].icontype
        // })
        // console.log(index)
        // totaldata[index].value += c
        for (var j = 0; j < totaldata.length; j ++) {
          if (totaldata[j].name === result[i].icontype) {
            totaldata[j].count += 1
            totaldata[j].value = parseFloat(totaldata[j].value) + parseFloat(result[i].money)
          }
        }
      }
    }
    var filtertype = totaldata.filter(item => {
      if(item.type === type) {
        return item
      }
    })
    // console.log(filtertype)
    for (var i = 0, len = filtertype.length; i < len; i++) {
      // totalmoney = parseFloat(totalmoney) + parseFloat(filtertype[i].value)
      totalmoney += filtertype[i].value
    }
    for (var i = 0, len = filtertype.length; i < len; i++) {
      filtertype[i].percent = Math.ceil(filtertype[i].value / totalmoney * 100)
      filtertype[i].totalmoney = totalmoney
    }
    this.ctx.body = filtertype.sort(sortByobj('percent'))
  }

  async addicon() {
    const body = this.ctx.request.body
    for (var i = 0; i < body.length; i++) {
      this.app.mysql.insert('iconlist', body[i])
    }
    this.ctx.body = 'icon成功写入数据库'
    // console.log(body, 'addicon调用后打印的数据')
    // await this.app.mysql.insert('iconlist', )
  }

  async geticon() {
    const body = this.ctx.request.body
    const icontype = body.icontype
    const iconlist = await this.app.mysql.select('iconlist', {
      where: {icontype: icontype}
    })
    // console.log(iconlist, '根据icontype获取到的icon')
    this.ctx.body = iconlist
  }

  async updateItem() {
    const body = this.ctx.request.body
    const itemid = body.itemid
    const row = {
      username: body.username,
      type: body.type,
      money: body.money,
      date: body.date,
      icontype: body.icontype
    }
    const options = {
      where: {
        itemid: itemid
      }
    }
    await this.app.mysql.update('bill', row, options)
    console.log(body)
    console.log('come in ')
    this.ctx.body = '数据成功修改'
  }

  async getBudget () {
    const body = this.ctx.request.body
    const username = body.username
    const result = await this.app.mysql.select('user', {
      where: {username: username}
    })
    this.ctx.body = result
  }

  async updateBudget () {
    const body = this.ctx.request.body
    const row = {
      budget:body.newMoney
    }
    const options = {
      where: {
        username: body.username
      }
    }
    await this.app.mysql.update('user', row, options)
    this.ctx.body = '设置预算成功'
  }

  async getSortBudget () {
    const body = this.ctx.request.body
    const username = body.username
    const year = body.year.toString()
    const month = body.month.toString()
    const result = await this.app.mysql.select('bill', {
      where: {username:username}
    })
    const sameMonthdata = filterData(result, year, month)
    const map = []
    const dest = []
    for (let i = 0, len = sameMonthdata.length; i < len; i++) {
      let icontype = sameMonthdata[i].icontype
      let type = sameMonthdata[i].type
      if (map.indexOf(icontype) === -1 && type === '支出') {
        dest.push({
          icontype: icontype,
          list: [sameMonthdata[i]]
        })
        map.push(icontype)
      } else {
        for (let j = 0, length = dest.length; j < length; j++) {
          if (map[j] === icontype) {
            dest[j].list.push(sameMonthdata[i])
          }
        }
      }
    }
    for(let i = 0, len = dest.length; i < len; i++) {
      dest[i].sortTotal = 0
      dest[i].count = dest[i].list.length
      for(let j = 0, length = dest[i].list.length; j < length; j++) {
        dest[i].sortTotal += parseFloat(dest[i].list[j].money)
      }
    }
    // console.log(dest,'hahah')
    const monthSort = await this.app.mysql.select('sortbudget', {
      where: {username:username}
    })
    console.log(monthSort,'lalala')
    
    // let sortMap = []
    for (let i = 0, len = monthSort.length; i < len; i++) {
      if(monthSort[i].budget > 0 ) {
        // sortMap.push(monthSort[i].icontype)
        for(let j = 0, length = dest.length; j < length; j++) {
          if (monthSort[i].icontype === dest[j].icontype) {
            dest[j].budget = monthSort[i].budget
            dest[j].percent = 100 - dest[j].sortTotal / dest[j].budget * 100
            // if (dest[j].percent > 1) {
            //   dest[j].percent = 0
            // }
          }else {
            let index = dest.findIndex(val => {
              return val.icontype === monthSort[i].icontype
            })
            if (index === -1) {
              dest.push({
                icontype: monthSort[i].icontype,
                list: '',
                sortTotal: 0,
                count: 0,
                percent: 100,
                budget: monthSort[i].budget?monthSort[i].budget:0
              })
            }
          }
        }
      }
    }
    // console.log(sortMap,'sortmap')
    // for(let i = 0, len = dest.length; i < len; i++){
    //   let str = dest[i].icontype
    //   console.log(str,'str')
    //   if(sortMap.indexOf(str) === -1) {
    //     dest.splice(i, 1)
    //   }
    // }
    console.log(dest,'hahah')
    this.ctx.body = dest
  }

  async setSortBudget () {
    const body = this.ctx.request.body
    for (var i = 0; i < body.map.length; i++) {
      this.app.mysql.insert('sortbudget', body.map[i])
    }
  }

  async updateSortBudget () {
    const body = this.ctx.request.body
    const row = {
      username: body.username,
      icontype: body.icontype,
      budget: body.budget
    }
    const options = {
      where: {
        id: body.id
      }
    }
    await this.app.mysql.update('sortbudget', row, options)
    this.ctx.body = 'update success'
  }

  async getMonthSort () {
    const body = this.ctx.request.body
    const username = body.username
    const result = await this.app.mysql.select('sortbudget', {
      where: {username:username}
    })
    this.ctx.body = result
  }
}
module.exports = UserController;