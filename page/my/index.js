var app = getApp()
Page({
  onShareAppMessage() {
    return {
      title: '偶遇一下',
      path: 'page/index'
    }
  },

  data: {
    groupInfos: [],
    openGId: '',
    noGroup:false
  },
  turnGroup(e) {
    let groupId = e.currentTarget.dataset.groupid
    let groupName = e.currentTarget.dataset.groupname
    console.log("点击", groupName, "groupId", groupId)
    wx.setStorageSync(groupId, groupName)
    wx.setStorageSync("openGId", groupId)

    this.setData({
      openGId: groupId
    })
    //首页打开方式，1为分享页面，2为跳转
    wx.setStorageSync("initIndexType", 2)
    console.log("groupName存储成功", groupName, "groupId", groupId)
    wx.switchTab({
      url: '../index'
    })
  },
  onShow() {
    // 查看是否授权用户信息
    this.setData({
      openGId: wx.getStorageSync("openGId")
    })
    var that = this
    wx.getSetting({
      success: function(res) {
        if (!res.authSetting['scope.userInfo']) {
          let isAudit = wx.getStorageSync("isAudit")
          if(isAudit!="1"){
            wx.switchTab({
              url: '../index'
            })
          }
          
        } else {
          let myGroups = wx.getStorageSync("myGroups")
          let groupInfos = []
          if (myGroups) {
            for (let i = 0; i < myGroups.length; i++) {
              groupInfos[i] = {}
              groupInfos[i].groupName = myGroups[i].DiyGroupName
              groupInfos[i].groupId = myGroups[i].OpenGId
            }
          }else{
            that.setData({
              noGroup: true,
            })
          }
          that.setData({
            groupInfos: groupInfos,
          })
        }
      }
    })
  },
  turnAdvice() {
    wx.navigateTo({
      url: "advice/index"
    })
  },
  turnJuhe() {
    wx.navigateTo({
      url: "juhe/index"
    })
  }
})