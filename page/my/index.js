var app = getApp()
Page({
  onShareAppMessage() {
    return {
      title: '偶遇一下',
      path: 'page/index'
    }
  },

  data: {
    list: []
  },
  onLoad() {
    console.log("我的 onload")
  },
  turnGroup(e) {
    let groupId = e.currentTarget.dataset.groupid
    let groupName = e.currentTarget.dataset.groupname
    console.log("点击", groupName, "groupId", groupId)
    wx.setStorageSync(groupId, groupName)
    wx.setStorageSync("openGId", groupId)
    //首页打开方式，1为分享页面，2为跳转
    wx.setStorageSync("initIndexType", 2)
    console.log("groupName存储成功", groupName, "groupId", groupId)
    wx.switchTab({
      url: '../index'
    })
  },
  onShow() {
    // 查看是否授权用户信息
    var that = this
    wx.getSetting({
      success: function(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.switchTab({
            url: '../index'
          })
        } else {
          let myGroups = wx.getStorageSync("myGroups")
          let groupInfos = []
          if (myGroups) {
            for (let i = 0; i < myGroups.length; i++) {
              groupInfos[i] = {}
              groupInfos[i].groupName = myGroups[i].DiyGroupName
              groupInfos[i].groupId = myGroups[i].OpenGId
            }
          }
          that.setData({
            list: [{
              id: 'mygroup',
              name: '我的圈子',
              open: false,
              pages: groupInfos
            }, {
                id: 'travel',
                name: '行程发布',
                open: false,
                pages: [{
                  groupName: '发个行程，一起拼车吧', groupId: ''
                }]
              }, {
                id: 'play',
                name: '活动发布',
                open: false,
                pages: [{
                  groupName: '明天去阿发家打麻将', groupId: ''
                }]
              }, {
              id: 'run',
              name: '运动排名',
              open: false,
              pages: [{
                groupName: '我的运动统计', groupId: ''
              }]
            }, {
              id: 'setting',
              name: '设置',
              open: false,
              pages: [{
                groupName: '是否允许向好友展示轨迹'
              }, {
                groupName: '是否允许展示步数信息'
              }]
            }, {
              id: 'share',
              name: '分享至群聊',
              open: false,
              pages: [{
                groupName: '分享给啊啊'
              }, {
                groupName: '分享给波波'
              }]
            }]
          })
        }
      }
    })
  },
  kindToggle(e) {
    const id = e.currentTarget.id
    const list = this.data.list
    for (let i = 0, len = list.length; i < len; ++i) {
      if (list[i].id === id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list
    })
  }
})