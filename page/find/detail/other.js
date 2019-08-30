// page/find/index.js
const ws = require('../../../util/ws.js')
const config = require('../../../config')
var util = require('../../../util/util.js')
var Toast = require('../../../lib/toast/toast')
var app = getApp()
Page({
  data: {
    windowHeight: "",
    activeItem: {},
    players: [],
    isAdd: false,
    isShowAdd: true
  },

  onLoad(opt) {
    let that = this
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      that.setData({
        activeItem: data.data
      })
    })
  },
  onShow() {
    let that = this;
    let windowHeight = wx.getStorageSync("windowHeight")
    // 设置高度
    that.setData({
      windowHeight: windowHeight - 42
    });
    this.selectPlay()

  },
  checkStatus: function() {
    //如果已经加入活动
    if (this.data.isAdd) {
      //隐藏按钮
      this.setData({
        isShowAdd: false
      })
    }
    //如果没加入活动
    else {
      //增加按钮默认显示，但排除下面情况
      if (this.data.players.length > 5) {
        this.setData({
          isShowAdd: false,
        })
      }
    }

  },
  addMe(e) {

    let type = e.currentTarget.dataset.type
    let userInfo = wx.getStorageSync('userInfo')
    let openId = wx.getStorageSync('openid')
    let playInfo = {
      avatarUrl: userInfo.avatarUrl,
      majiangType: type,
      nickName: userInfo.nickName,
      openId: openId
    }
    let players = this.data.players

    players.push(playInfo)
    this.setData({
      players: players,
      isAdd: true,
      isShowAdd: false
    })
    wx.request({
      url: config.addPlayUrl,
      data: {
        data: JSON.stringify({
          activeId: this.data.activeItem.activeId,
          openId: wx.getStorageSync("openid")
        })
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(result) {
        if (result.data.code == 0) {
          Toast.default.success("加入成功！")
          setTimeout(function () {
            wx.navigateBack()
          }, 2000)
        }
      }
    })
  },
  exit() {
    let openId = wx.getStorageSync("openid")
    wx.request({
      url: config.leavePlayUrl,
      data: {
        activeId: this.data.activeItem.activeId,
        openId: openId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(result) {
        if (result.data.code == 0) {
          Toast.default.success("退出成功！")
          setTimeout(function () {
            wx.navigateBack()
          }, 2000)
        }
      }
    })
  },
  selectPlay: function() {
    var that = this
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: config.selectPlayerUrl,
      data: {
        activeId: that.data.activeItem.activeId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(result) {
        if (result.data.code == 0) {
          var resData = result.data.data
          var openId = wx.getStorageSync("openid")
          var players = []
          if (resData) {
            for (let i = 0; i < resData.length; i++) {
              if (resData[i].openId == openId) {
                that.setData({
                  isAdd: true
                })
              }

              players.push(resData[i])

            }
            that.setData({
              players: players
            })
            that.checkStatus()
          }
        }
        wx.hideLoading()
      }
    })
  },
  back() {
    wx.navigateBack()
  },
  //限制字数长度
  txtSub(txt, sublen) {
    var len = txt.length
    if (len > sublen) {
      txt = txt.substring(0, sublen) + "..."
    }
    return txt
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})