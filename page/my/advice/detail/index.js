const config = require('../../../../config')
var app = getApp()
Page({
  onShareAppMessage() {
    return {
      title: '偶遇一下',
      path: 'page/index'
    }
  },

  data: {
    advices: []
  },

  onShow() {
    this.selectAdvice()
  },
  selectAdvice: function() {
    var that = this
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: config.selectAdviceUrl,
      data: {},
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(result) {
        if (result.data.code == 0) {
          var resData = result.data.data
          that.setData({
            advices: resData
          })
        }
        wx.hideLoading()
      }
    })
  },
  back() {
    wx.navigateBack()
  },

})