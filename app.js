const config = require('./config')
const ws = require('./util/ws.js')
var WXBizDataCrypt = require('./util/WXBizDataCrypt.js')
App({
  onLaunch(opts) {
    this.initSocket()
  },

  onShow(opts) {
    var shareTicket = opts.shareTicket

    wx.setStorageSync("shareTicket", shareTicket)
    //首页打开方式，1为分享页面，2为跳转
    wx.setStorageSync("initIndexType", 1)
    console.log("app获取shareTicket为", shareTicket)
    var that = this
    var hasLogin = wx.getStorageSync("openid")
    console.log('onShow,判断hasLogin', hasLogin)
    //if (hasLogin) {
    //wx.setStorageSync("openGId", "Gfjw_5eQUo4ZAM8D9X5SstLExXho")
    // if (typeof(shareTicket) != 'undefined') {
    //   console.log('haslogin,执行getShare')
    //   that.getShare(shareTicket)
    // }
    //} else {
    // console.log('notHaslogin,执行wxlogin')
    //  this.wxlogin().then((res) => {
    //wx.setStorageSync("openGId", "Gfjw_5eQUo4ZAM8D9X5SstLExXho")
    // if (typeof(shareTicket) != 'undefined') {
    //   console.log('onShow,执行wxlogin成功，调用getShare')
    //   that.getShare(shareTicket)
    // }
    // })
    // }
  },
  wxlogin() {
    var that = this
    let promise = new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          // 获取到用户的 code 之后：res.code
          console.log("用户的code:" + res.code);
          if (res.code) {
            //发起网络请求
            wx.request({
              url: config.loginUrl,
              data: {
                code: res.code
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              method: 'POST',
              success: function(result) {
                console.log('wxlogin内部执行成功，得到openid')
                let resData = result.data
                wx.setStorageSync("openid", resData.data.openid)
                wx.setStorageSync("session_key", resData.data.session_key)
                console.log('用户的openid:' + resData.data.openid)
                console.log('用户的session_key:' + resData.data.session_key)

                that.getSystem();
                resolve(res);
              }
            })
          }
        }
      })
    })
    return promise
  },
  getSystem() {
    //获取用户手机系统信息
    wx.getSystemInfo({
      success: function(res) {
        console.log("获取当前系统信息", res)
        // 获取可使用窗口宽度
        let clientHeight = res.windowHeight;
        // 获取可使用窗口高度
        let clientWidth = res.windowWidth;
        // 算出比例
        let ratio = 750 / clientWidth;
        // 算出高度(单位rpx)
        let windowHeight = clientHeight * ratio;
        wx.setStorageSync("windowHeight", windowHeight)
        wx.setStorageSync("model", res.model)
      }
    });
  },
  getShare(sharet) {
    let promise = new Promise((resolve, reject) => {
      wx.getShareInfo({
        shareTicket: sharet,
        success: res => {
          //获取微信群ID，并解密
          var appId = 'wxa780468a57325fc3'
          var sessionKey = wx.getStorageSync("session_key")
          var encryptedData = res.encryptedData
          var iv = res.iv
          var pc = new WXBizDataCrypt(appId, sessionKey)
          var data = pc.decryptData(encryptedData, iv)
          console.log('解密后 data: ', data)
          wx.setStorageSync("openGId", data.openGId)
          console.log('获取的openGId为: ', data.openGId)

          //调用后台进行存储
          wx.request({
            url: config.saveUserGroupUrl,
            data: {
              userGroupInfo: JSON.stringify({
                Opengid: data.openGId,
                Openid: wx.getStorageSync("openid")
              })
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            success: function(result) {
              if (result.code == -1) {
                console.log('用户群数据存储失败！' + result.data)
              }
            }
          })
          resolve(res);
        }
      })
    })
    return promise
  },
  onHide() {
    console.log('App Hide')
  },
  globalData: {
    openid: null,
    localSocket: {},
    callback: function() {}
  },
  initSocket() {
    let that = this
    that.globalData.localSocket = wx.connectSocket({
      //此处 url 可以用来测试
      url: config.wsUrl
    })
    //版本库需要在 1.7.0 以上
    that.globalData.localSocket.onOpen(function(res) {
      console.log('WebSocket连接已打开！readyState=' + that.globalData.localSocket.readyState)
    })
    that.globalData.localSocket.onError(function(res) {
      console.log('WebSocket连接异常,readyState=' + that.globalData.localSocket.readyState)
    })
    that.globalData.localSocket.onClose(function(res) {
      console.log('WebSocket连接已关闭！readyState=' + that.globalData.localSocket.readyState)
      that.initSocket()
    })
    that.globalData.localSocket.onMessage(function(res) {
      // 用于在其他页面监听 websocket 返回的消息
      that.globalData.callback(res)
    })
  },

  //统一发送消息，可以在其他页面调用此方法发送消息
  sendSocketMessage: function(evt, msg) {
    let that = this
    return new Promise((resolve, reject) => {
      if (this.globalData.localSocket.readyState === 1) {
        console.log('发送消息evt:', evt, " msg:", msg)
        this.globalData.localSocket.send({
          data: 'tushile:' + evt + ';0;' + msg,
          success: function(res) {
            resolve(res)
          },
          fail: function(e) {
            reject(e)
          }
        })
      } else {
        console.log('已断开')
      }
    })
  }
})