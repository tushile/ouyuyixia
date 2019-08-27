// page/find/index.js
const ws = require('../../util/ws.js')
const config = require('../../config')
var util = require('../../util/util.js')
import Notify from '../../lib/notify/notify'
var app = getApp()
Page({
  data: {
    windowHeight: "",
    myPlays: [],
    myPlaysHis: [],
    myPlaysP: []
  },

  onLoad() {
    var openGId = wx.getStorageSync("openGId")
    wx.onSocketMessage(function(res) {
      var resData = ws.messageReceivedFromConn(res)
      if (resData.msg == openGId && resData.evt == "play") {
        console.log('收到服务器内容play ', res)
        Notify({
          duration: 2000,
          text: '有人发布了新活动，快去看看吧',
          selector: '#custom-selector',
          backgroundColor: '#1989fa',
          safeAreaInsetTop: true
        });
      }
    })

  },
  onShow() {
    let that = this;
    let windowHeight = wx.getStorageSync("windowHeight")
    // 设置高度
    that.setData({
      windowHeight: windowHeight - 240
    });
    // 查看是否授权用户信息
    wx.getSetting({
      success: function(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.switchTab({
            url: '../index'
          })
        }
      }
    })

    this.selectMyPlay()
  },
  selectMyPlay: function() {
    var that = this
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: config.selectMyAllPlayUrl,
      data: {
        openId: wx.getStorageSync("openid")
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(result) {
        if (result.data.code == 0) {
          var resData = result.data.data
          var resDataP = that.deepCopy(resData)
          var myPlays = []
          var myPlaysHis = []
          if (resData) {
            for (let i = 0; i < resData.length; i++) {
              let activeTime = resData[i].activeTime
              let date = new Date(activeTime)
              let h = date.getHours()
              let m = date.getMinutes()
              h = h > 9 ? h : "0" + h;
              m = m > 9 ? m : "0" + m;
              resData[i].activeTime = date.getMonth() + 1 + "." + date.getDate() + "(" + util.getDay(date) + ")" + h + ":" + m
              resData[i].address = that.txtSub(resData[i].address, 10)
              resData[i].remark = that.txtSub(resData[i].remark, 13)
              if (date < new Date()) {
                myPlaysHis.push(resData[i])
              } else {
                myPlays.push(resData[i])
              }
              resDataP[i].activeTime = date.getMonth() + 1 + "." + date.getDate() + "(" + util.getDay(date) + ")" + h + ":" + m

            }
            that.setData({
              myPlays: myPlays,
              myPlaysHis: myPlaysHis,
              myPlaysP: resDataP
            })
            wx.hideLoading()
          }
        }
      }
    })
  },
  /**
   * 深度复制数组与对象
   * @param o {Array|object} 数据包
   * @return {Array|object}
   */
  deepCopy(o) {
    if (o instanceof Array) {
      let n = [];
      for (let i = 0; i < o.length; ++i) {
        n[i] = this.deepCopy(o[i]);
      }
      return n;

    } else if (o instanceof Object) {
      let n = {};
      for (let i in o) {
        n[i] = this.deepCopy(o[i]);
      }
      return n;
    } else {
      return o;
    }
  },
  //限制字数长度
  txtSub(txt, sublen) {
    var len = txt.length
    if (len > sublen) {
      txt = txt.substring(0, sublen) + "..."
    }
    return txt
  },
  //跳转到详情页面
  turnDetail(e) {
    let that = this
    wx.navigateTo({
      url: 'detail/index',
      success: function(res) {
        let activeItem;
        for (let i in that.data.myPlaysP) {
          if (that.data.myPlaysP[i].activeId == e.currentTarget.dataset.activeid) {
            activeItem = that.data.myPlaysP[i]
            break
          }
        }
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          data: activeItem
        })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})