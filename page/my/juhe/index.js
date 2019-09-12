const config = require('../../../config')
var Toast = require('../../../lib/toast/toast')
var app = getApp()
Page({
  onShareAppMessage() {
    return {
      title: '偶遇一下',
      path: 'page/index'
    }
  },

  data: {},

  onShow() {

  },
  back() {
    wx.navigateBack()
  },

})