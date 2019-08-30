var util = require('../../util/util.js')
const config = require('../../config')
const ws = require('../../util/ws.js')
var app = getApp()
var Toast = require('../../lib/toast/toast')
import Notify from '../../lib/notify/notify';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    indexTxt: "",
    locName: "",
    address: "",
    latitude: "",
    longitude: "",
    showLoc: false,
    showTime: false,
    showGroup: false,
    showSubmit: false,
    showRemark: false,
    markers: [],
    groupNames: [],
    groupSet: {},
    defaultGroupIndex: 0,
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime(),
    maxDate: new Date().getTime() + 1000 * 60 * 60 * 24 * 365,
    currentDate: new Date().getTime(),
    currentDateTxt: "",
    selGroupName: "",
    selGroupId: "",
    remark: "",
    showTimeModel: false,
    showGroupModel: false,
    readonlyLocInput: true
  },
  //清空活动提交数据
  clearPlayData() {
    this.setData({
      index: 0,
      indexTxt: "",
      locName: "",
      address: "",
      latitude: "",
      longitude: "",
      showLoc: false,
      showTime: false,
      showGroup: false,
      showSubmit: false,
      showRemark: false,
      markers: [],
      currentDateTxt: "",
      remark: "",
      showTimeModel: false,
      showGroupModel: false,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let mygroups = wx.getStorageSync("myGroups")
    let openGId = wx.getStorageSync("openGId")
    let groupName
    if (openGId) {
      groupName = wx.getStorageSync(openGId)
    }

    let defaultGroupIndex = 0
    let groups = []
    let groupMaps = {}
    if (mygroups) {
      for (let i = 0; i < mygroups.length; i++) {
        groups[i] = mygroups[i].DiyGroupName
        groupMaps[i] = mygroups[i].OpenGId
        if (openGId == mygroups[i].OpenGId) {
          //设置默认圈子
          defaultGroupIndex = i
        }
      }
      if (openGId) {
        this.setData({
          defaultGroupIndex: defaultGroupIndex,
          selGroupId: openGId,
          selGroupName: groupName
        })
      }
      this.setData({
        groupNames: groups,
        groupSet: groupMaps
      })
    }
  },
  onInputLoc(event) {
    this.setData({
      locName: event.detail
    });
  },
  onClearLoc() {
    this.setData({
      locName: ""
    });
  },
  //提交活动
  savePlay() {
    let that = this
    if (!this.data.locName || !this.data.latitude) {
      Toast.default.fail("请选择地点")
      return
    }
    if (!this.data.currentDateTxt) {
      Toast.default.fail("请选择时间")
      return
    }
    if (!this.data.selGroupId) {
      Toast.default.fail("请选择圈子进行提交")
      return
    }
    //保存活动提交
    let userInfo = wx.getStorageSync("userInfo")
    wx.request({
      url: config.savePlayUrl,
      data: {
        data: JSON.stringify({
          Opengid: this.data.selGroupId,
          Openid: wx.getStorageSync("openid"),
          Nickname: userInfo.nickName,
          Userimg: userInfo.avatarUrl,
          Activename: this.data.indexTxt,
          Address: this.data.locName,
          Addressall: this.data.address,
          Longitude: this.data.longitude,
          Latitude: this.data.latitude,
          Activetime: new Date(this.data.currentDate),
          Remark: this.data.remark
        })
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(result) {
        if (result.code == -1) {
          console.log('活动提交存储失败！')
        }
        Toast.default.success("提交成功！")
        //提交成功后发送websocket
        let openGId = wx.getStorageSync("openGId")
        app.sendSocketMessage('play', openGId)
        that.clearPlayData()
      }
    })
  },
  //打开时间选择蒙层
  openTimeModel: function() {
    this.setData({
      showTimeModel: true
    });
  },
  //关闭时间选择蒙层
  closeTimeModel() {
    this.setData({
      showTimeModel: false
    });
  },
  //时间输入事件
  onInputTime(event) {
    this.setData({
      currentDate: event.detail
    });
  },
  //备注输入事件
  onInputRemark(event) {
    this.setData({
      remark: event.detail
    });
  },
  //时间选择确定按钮
  onConfirmTime(event) {
    let currentDateTxt = util.formatDateTime(new Date(event.detail))
    currentDateTxt = currentDateTxt.substr(0, currentDateTxt.length - 3)
    this.setData({
      showTimeModel: false,
      showGroup: true,
      currentDateTxt: currentDateTxt
    });
    if (this.data.selGroupName) {
      this.setData({
        showRemark: true,
        showSubmit: true,
      });
    }
  },
  //时间选择取消按钮
  onCancelTime() {
    this.setData({
      showTimeModel: false
    });
  },

  //打开圈子选择蒙层
  openGroupModel: function() {
    this.setData({
      showGroupModel: true
    });
  },
  //关闭圈子选择蒙层
  closeGroupModel() {
    this.setData({
      showGroupModel: false
    });
  },
  //切换圈子
  onChangeGroup(event) {
    let item = event.detail
    this.setData({
      showGroupModel: false,
      selGroupName: item.value,
      selGroupId: this.data.groupSet[item.index],
      showSubmit: true,
      showRemark: true
    });
  },
  //点击活动类型图标
  getType: function(e) {
    let selIndex = e.currentTarget.dataset['index'];
    let selIndexTxt = e.currentTarget.dataset['txt'];
    if (this.data.markers.length > 0) {
      var markers = this.data.markers
      markers[0].iconPath = "resources/" + selIndex + ".png"
      this.setData({
        markers: markers
      })
    }
    this.setData({
      index: selIndex,
      indexTxt: selIndexTxt
    })
  },

  //打开位置选择
  openLoc: function() {
    var that = this
    wx.chooseLocation({
      success: function(res) {
        var markers = []
        markers[0] = {
          iconPath: "resources/" + that.data.index + ".png",
          id: 0,
          latitude: res.latitude,
          longitude: res.longitude,
          width: 30,
          height: 30
        }
        that.setData({
          locName: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
          showLoc: true,
          showTime: true,
          readonlyLocInput: false,
          markers: markers
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // Notify({
    //   duration: 2000,
    //   text: '通知内容',
    //   selector: '#custom-selector',
    //   backgroundColor: '#1989fa',
    //   safeAreaInsetTop: true
    // });
    // 查看是否授权用户信息
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.switchTab({
            url: '../index'
          })
        }
      }
    })
    let mygroups = wx.getStorageSync("myGroups")
    let groups = []
    let groupMaps = {}
    if (mygroups) {
      for (let i = 0; i < mygroups.length; i++) {
        groups[i] = mygroups[i].DiyGroupName
        groupMaps[i] = mygroups[i].OpenGId
      }
      this.setData({
        groupNames: groups,
        groupSet: groupMaps
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})