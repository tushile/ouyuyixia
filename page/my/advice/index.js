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

  data: {
    radio: '1',
    message: ''
  },

  onShow() {

  },
  back() {
    wx.navigateBack()
  },
  onChange(e) {
    this.setData({
      radio: e.detail
    })
  },
  onClick(e) {
    const {
      name
    } = e.currentTarget.dataset
    this.setData({
      radio: name
    })
  },
  //留言输入事件
  onInput(event) {
    this.setData({
      message: event.detail
    });
  },
  commit() {
    let userInfo = wx.getStorageSync("userInfo")
    let adviceName = ''
    if (this.data.radio == '1') {
      adviceName = '建议'
    } else if (this.data.radio == '2') {
      adviceName = '错误'
    } else if (this.data.radio == '3') {
      adviceName = '疑问'
    } else if (this.data.radio == '4') {
      adviceName = '其他'
    }
    wx.request({
      url: config.saveAdviceUrl,
      data: {
        data: JSON.stringify({
          Openid: wx.getStorageSync("openid"),
          Advicetype: this.data.radio,
          Advicename: adviceName,
          Content: this.data.message,
          Imgurl: userInfo.avatarUrl
        })
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(result) {
        if (result.code == -1) {
          console.log('提交失败！')
        }
        Toast.default.success("提交成功！")
        setTimeout(function() {
          wx.navigateBack()
        }, 2000)
      }
    })
  },
  turnHis() {
    wx.navigateTo({
      url: "detail/index"
    })
  }
})