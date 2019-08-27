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
    type1Players: [],
    type2Players: [],
    type3Players: [],
    type4Players: [],
    isAdd: false,
    isShowAdd2: true,
    isShowAdd3: true,
    isShowAdd4: true,
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
        isShowAdd2: false,
        isShowAdd3: false,
        isShowAdd4: false,
      })
    }
    //如果没加入活动
    else {
      //增加按钮默认显示，但排除下面情况
      if (this.data.type2Players.length > 5) {
        this.setData({
          isShowAdd2: false,
        })
      }
      if (this.data.type3Players.length > 5) {
        this.setData({
          isShowAdd3: false,
        })
      }
      if (this.data.type4Players.length > 5) {
        this.setData({
          isShowAdd4: false,
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
    let type1Players = this.data.type1Players
    let type2Players = this.data.type2Players
    let type3Players = this.data.type3Players
    let type4Players = this.data.type4Players
    if (type == 1) {
      if (type1Players.length > 3) {
        return
      }
      if (players.length > 0) {
        for (let i = 0; i < players.length; i++) {
          if (players[i].openId == openId) {
            Toast.default.fail("活动已加入！")
            return
          }
        }
      }

      type1Players.push(playInfo)
    } else if (type == 2) {
      type2Players.push(playInfo)
    } else if (type == 3) {
      type3Players.push(playInfo)
    } else if (type == 4) {
      type4Players.push(playInfo)
    }
    players.push(playInfo)
    this.setData({
      players: players,
      type1Players: type1Players,
      type2Players: type2Players,
      type3Players: type3Players,
      type4Players: type4Players,
      isAdd: true,
      isShowAdd2: false,
      isShowAdd3: false,
      isShowAdd4: false,
    })
    wx.request({
      url: config.addPlayUrl,
      data: {
        data: JSON.stringify({
          activeId: this.data.activeItem.activeId,
          openId: wx.getStorageSync("openid"),
          majiangType: type
        })
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(result) {
        if (result.data.code == 0) {
          Toast.default.success("加入成功！")
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
          wx.navigateBack()
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
          var type1Players = []
          var type2Players = []
          var type3Players = []
          var type4Players = []
          if (resData) {
            for (let i = 0; i < resData.length; i++) {
              if (resData[i].openId == openId) {
                that.setData({
                  isAdd: true
                })
              }
              if (resData[i].majiangType == '1') {
                type1Players.push(resData[i])
              } else if (resData[i].majiangType == '2') {
                type2Players.push(resData[i])
              } else if (resData[i].majiangType == '3') {
                type3Players.push(resData[i])
              } else if (resData[i].majiangType == '4') {
                type4Players.push(resData[i])
              }
            }
            that.setData({
              players: resData,
              type1Players: type1Players,
              type2Players: type2Players,
              type3Players: type3Players,
              type4Players: type4Players
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