const config = require('../config')
var hull = require('../util/convexHull.js')
var util = require('../util/util.js')
const ws = require('../util/ws.js')
var QQMapWX = require('../util/qqmap-wx-jssdk.js');
import Notify from '../lib/notify/notify';
var app = getApp()
var qqmapsdk;
Page({
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      this.cancel()
      console.log(res.target)
    }
    return {
      title: '偶遇一下',
      path: 'page/index'
    }
  },
  data: {
    latitude: 23.099994,
    longitude: 113.324520,
    openGId: "",
    online: 1,
    scale: 11,
    isInitScale: true,
    isHide: false,
    allplays: [],
    markers: [],
    polygons: [],
    isShowModel: false, //控制弹窗是否显示，默认不显示
    isShowConfirm: false, //是否只显示确定按钮，默认不是
    ModelId: 0, //弹窗id
    ModelTitle: '', //弹窗标题
    ModelContent: '', //弹窗文字内容
    inputFocus: false, // input 框的focus状态
    searchText: '', // input 框的输入内容
    inputInfo: '给圈子取个名字吧', // cover-view 显示的 input 的输入内容
    isShowSave: false,
    isShowInput: false,
    checked: wx.getStorageSync("Isshareloc") == "0" ? false : true,
    switchMsg: wx.getStorageSync("Isshareloc") == "0" ? "位置共享已关闭" : "位置共享已打开"
  },
  /**
   * 将焦点给到 input
   */
  tapInput() {
    this.setData({
      inputInfo: '',
      inputFocus: true
    });
  },
  /**
   * input 失去焦点后将 input 的输入内容给到cover-view
   */
  blurInput(val) {
    this.setData({
      inputInfo: val.detail.value || '给圈子取个名字吧'
    });
  },
  bindInput(val) {
    this.setData({
      inputInfo: val.detail.value || '给圈子取个名字吧',
      isShowSave: true
    });
  },
  saveGroupName() {
    let groupName = this.data.inputInfo
    if (groupName == "给圈子取个名字吧") {
      groupName = ""
    }
    let openGId = wx.getStorageSync("openGId")
    wx.setStorageSync(openGId, groupName)
    let myGroups = wx.getStorageSync("myGroups")
    let hasIt = false
    if (myGroups) {
      for (let i = 0; i < myGroups.length; i++) {
        if (openGId == myGroups[i].OpenGId) {
          hasIt = true
          myGroups[i].DiyGroupName = groupName
        }
      }
    }
    if (!hasIt) {
      myGroups.push({
        openGId: openGId,
        diyGroupName: groupName
      })
    }
    wx.setStorageSync("myGroups", myGroups)
    this.setData({
      isShowSave: false
    });
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1000
    })
    saveGroupNameInfo(groupName)
  },
  markertap(e) {
    let allplays = this.data.allplays
    let activeItem = {}
    for (let i = 0; i < allplays.length; i++) {
      if (allplays[i].id == e.markerId) {
        activeItem = allplays[i]
        activeItem.activeTime = util.getTimeLeave(allplays[i].locationTime)
        activeItem.activeId = allplays[i].id
      }
    }
    if (activeItem.type == 'play') {
      let url = 'find/detail/index'
      if (["运动", "KTV", "聚餐", "其他"].indexOf(activeItem.nickName) > -1) {
        url = 'find/detail/other'
      }
      wx.navigateTo({
        url: url,
        success: function(res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            data: activeItem
          })
        }
      })
    }
  },
  onShow: function() {
    let hasLogin = wx.getStorageSync("openid")
    console.log('indexOnShow,判断hasLogin', hasLogin)
    var that = this;
    that.setData({
      isInitScale: true
    })
    // 查看是否授权用户信息
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function(res) {
              let res1 = res
              // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
              // 根据自己的需求有其他操作再补充
              // 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code
              wx.showLoading({
                title: '正在加载请稍后',
              })

              wx.showNavigationBarLoading()
              if (!hasLogin) {
                app.wxlogin().then((res) => {
                  wx.hideNavigationBarLoading()
                  wx.hideLoading()

                  that.getGroupName()
                  that.selectMyGroup()
                  that.saveUserInit(res1.userInfo)
                })
              } else {
                wx.hideNavigationBarLoading()
                wx.hideLoading()

                that.getGroupName()
                that.selectMyGroup()
                that.saveUserInit(res1.userInfo)
              }
            }
          });
        } else {
          // 用户没有授权
          // 改变 isHide 的值，显示授权页面
          let isAudit = wx.getStorageSync("isAudit")
          let isHide = isAudit == "1" ? false : true
          that.setData({
            isHide: isHide
          });
        }
      }
    });
  },
  //页面加载获取圈子名称
  getGroupName: function() {
    //首页打开方式，1为分享页面，2为跳转
    let initIndexType = wx.getStorageSync("initIndexType")
    if (initIndexType == 1) {
      let shareTicket = wx.getStorageSync("shareTicket")
      if (shareTicket) {
        app.getShare(shareTicket).then(() => {
          this.initGroupName()
          return
        })
      }
    }
    this.initGroupName()
  },
  initGroupName: function() {
    let openGId = wx.getStorageSync("openGId")
    console.log('最新openGId为', openGId)
    let groupName = wx.getStorageSync(openGId)
    if (groupName) {
      this.setData({
        inputInfo: groupName,
        searchText: groupName
      });
    }
  },
  //查询我的所有群
  selectMyGroup() {
    var that = this
    wx.request({
      url: config.selectMyGroupUrl,
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
          let groupId = wx.getStorageSync("openGId")
          if (!resData) {
            let shareTicket = wx.getStorageSync("shareTicket")
            if (!shareTicket) {
              that.showModel({
                ModelId: 0,
                ModelTitle: '提示',
                ModelContent: '您还没有圈子，从微信群分享的小卡片进入，可自动加入圈子'
              })
            }
          }
          wx.setStorageSync("myGroups", resData)
          console.log("查询我的群：", resData)

          if (groupId) {
            that.setData({
              isShowInput: true
            })
            var groupName = wx.getStorageSync(groupId)
            if (!groupName) {
              for (let i = 0; i < resData.length; i++) {
                if (groupId == resData[i].OpenGId) {
                  groupName = resData[i].DiyGroupName
                  if (groupName == "") {
                    groupName = "给圈子取个名字吧"
                    that.setData({
                      inputInfo: groupName,
                      searchText: ""
                    });
                  } else {
                    wx.setStorageSync(groupId, groupName)
                    that.setData({
                      inputInfo: groupName,
                      searchText: groupName
                    });
                  }
                }
              }
            }
          }
        }
      }
    })
  },
  //点击定位按钮
  dingwei: function() {
    var myMap = wx.createMapContext("myMap", this)
    myMap.moveToLocation()
  },
  //点击切换开关按钮
  onChangeSwitch: function({
    detail
  }) {
    this.setData({
      checked: detail,
      switchMsg: detail ? "位置共享已打开" : "位置共享已关闭"
    });
    let isShareLoc = detail ? "1" : "0"
    wx.setStorageSync("Isshareloc", isShareLoc)
    //调用后台进行存储
    wx.request({
      url: config.saveUserGroupUrl,
      data: {
        userGroupInfo: JSON.stringify({
          Opengid: wx.getStorageSync("openGId"),
          Openid: wx.getStorageSync("openid"),
          Isshareloc: isShareLoc
        })
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(result) {
        if (result.code == -1) {
          console.log('操作失败！' + result.data)
        }
      }
    })
  },
  onLoad: function() {
    //带ticket转发
    wx.showShareMenu({
      withShareTicket: true
    })
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'YOKBZ-U4LCU-YONV4-22XMJ-D4W36-DWBEW'
    });
  },
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：", e.detail.userInfo);
      wx.showLoading({
        title: '正在授权请稍后',
      })
      wx.showNavigationBarLoading()
      let hasLogin = wx.getStorageSync("openid")
      if (!hasLogin) {
        app.wxlogin().then((res) => {
          wx.hideNavigationBarLoading()
          wx.hideLoading()

          that.getGroupName()
          that.selectMyGroup()
          that.saveUserButton(e.detail.userInfo)
        })
      } else {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
        that.getGroupName()
        that.selectMyGroup()
        that.saveUserButton(e.detail.userInfo)
      }
    } else {
      showError()
    }
  },
  //页面加载保存用户
  saveUserInit: function(userInfo) {
    var that = this
    saveUserInfo(userInfo)
    //查看是否授权位置信息
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userLocation']) {
          wx.getLocation({
            type: 'gcj02',
            success(res) {
              console.log("用户的位置信息如下：", res)
              that.setData({
                isHide: false,
                latitude: res.latitude,
                longitude: res.longitude
              });
              wx.setStorageSync("latitude", res.latitude)
              wx.setStorageSync("longitude", res.longitude)
              that.saveLoc(res)
              that.selectUserGroup()
            }
          });
        } else {
          // 用户没有授权
          // 改变 isHide 的值，显示授权页面
          let isAudit = wx.getStorageSync("isAudit")
          let isHide = isAudit == "1" ? false : true
          that.setData({
            isHide: isHide
          });
          that.showErrorLoc()
        }
      }
    });
  },
  //点击按钮保存用户
  saveUserButton: function(userInfo) {
    var that = this
    saveUserInfo(userInfo)
    //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
    //查看用户是否对位置授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userLocation']) {
          that.setData({
            isHide: false
          });
        } else {
          wx.getLocation({
            type: 'gcj02',
            success(res) {
              console.log("用户的位置信息如下：", res)
              that.setData({
                isHide: false,
                latitude: res.latitude,
                longitude: res.longitude
              });
              wx.setStorageSync("latitude", res.latitude)
              wx.setStorageSync("longitude", res.longitude)
              that.saveLoc(res)
              that.selectUserGroup()
            },
            fail(res) {
              that.showErrorLoc()
            }
          })
        }
      }
    })
  },
  //调用后台进行存储地理位置
  saveLoc: function(data) {
    var that = this
    wx.request({
      url: config.saveLocationUrl,
      data: {
        data: JSON.stringify(data),
        openId: wx.getStorageSync("openid")
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: function(result) {
        if (result.code == -1) {
          console.log('用户位置数据存储失败！' + result.data)
        } else {
          var openGId = wx.getStorageSync("openGId")
          var userInfo = wx.getStorageSync("userInfo")

          that.sendSocketMessage(openGId, userInfo.nickName)
        }
      }
    })
  },
  // 发送和接收 socket 消息
  sendSocketMessage: function(openGId, nickName) {
    let that = this
    let msg = openGId + '|' + nickName
    return new Promise((resolve, reject) => {
      app.sendSocketMessage('chat', msg)
      app.globalData.callback = function(res) {
        var resData = ws.messageReceivedFromConn(res)
        let resMsg = resData.msg
        let tmp = resMsg.split("|")
        if (tmp[0] == openGId && resData.evt == "chat") {
          console.log('收到服务器内容chat ', res)
          that.setData({
            isInitScale: false,
            online: tmp[2]
          })
          wx.showToast({
            title: tmp[1] + '已更新定位',
            icon: 'none',
            duration: 3000
          })
          //不是自己登陆，才再刷新一遍数据
          if (tmp[3] == "notme") {
            that.selectUserGroup()
          }

        }
        resolve(res)
      }
    })
  },
  //截取指定字符串后几位
  getCaption(obj) {
    var index = obj.lastIndexOf(",");
    obj = obj.substring(index + 1, obj.length);
    //  console.log(obj);
    return obj;
  },
  //查询用户组信息
  selectUserGroup: function() {
    var that = this
    var openId = wx.getStorageSync("openid")
    var openGId = wx.getStorageSync("openGId")
    console.log("查询用户组信息:openId=", openId, "openGId", openGId)
    if (openId && openGId) {
      that.openGId = openGId
      //查询用户组
      wx.request({
        url: config.selectUserGroupUrl,
        data: {
          openGId: openGId,
          openId: openId
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        success: function(result) {
          if (result.data.code == 0) {
            var resData = result.data.data
            if (resData == null) {
              console.log("群信息获取失败,未获取到任何数据")
              return
            }
            var points = []
            var markers = []
            for (var i = 0; i < resData.length; i++) {
              var lastTime = resData[i].locationTime
              var timeTxt = util.getTimeLeave(lastTime)
              points[i] = {
                latitude: resData[i].latitude,
                longitude: resData[i].longitude
              }
              let borderColor = '#F56C6C'
              let bgColor = '#FDE2E280'
              let content = resData[i].nickName + "\n" + timeTxt + "在这里"
              if (resData[i].type == 'play') {
                borderColor = '#409EFF'
                bgColor = '#8CC5FF'
                content = "活动：" + resData[i].nickName + "\n" + timeTxt
              }
              markers[i] = {
                iconPath: resData[i].avatarUrl,
                id: resData[i].id,
                latitude: resData[i].latitude,
                longitude: resData[i].longitude,
                callout: {
                  content: content,
                  color: "#FFFFFF",
                  fontSize: 12,
                  padding: 4,
                  borderRadius: 3,
                  borderColor: borderColor,
                  bgColor: bgColor,
                  display: "ALWAYS",
                  textAlign: "center",
                  borderWidth: 1
                },
                width: 34,
                height: 34
              }
            }
            points.push({
              latitude: that.data.latitude,
              longitude: that.data.longitude
            })
            //求坐标点最外层边框，并排序
            var resOut = hull.getOutPoints(points)
            var outPoints = resOut.outPoints
            if (that.data.isInitScale) {
              var ans = resOut.ans
              var scale = util.getScale(ans)
              that.setData({
                scale: scale,
              });
            }
            var polygons = [{
              points: outPoints,
              fillColor: "#C6E2FF26",
              strokeColor: "#F56C6C",
              strokeWidth: 2
            }]
            that.setData({
              polygons: polygons,
              markers: markers,
              allplays: resData
            });

          }
        }
      })
    }
  },

  //用户按了位置拒绝按钮
  showErrorLoc: function() {
    let that1 = this
    wx.showModal({
      title: '提示',
      content: '请手动授权使用地理位置之后再进入小程序',
      showCancel: false,
      confirmText: '重新授权',
      success: function(res) {
        let that2 = that1
        // 用户没有授权成功，不需要改变 isHide 的值
        if (res.confirm) {
          wx.openSetting({
            success(res) {
              let that3 = that2
              if (res.authSetting["scope.userLocation"] == true) {
                wx.showToast({
                  title: '授权成功',
                  icon: 'success',
                  duration: 1000
                })

                //再次授权，调用getLocationt的API
                wx.getLocation({
                  type: 'gcj02',
                  success(res) {
                    console.log("用户的位置信息如下：", res)
                    that3.setData({
                      isHide: false,
                      latitude: res.latitude,
                      longitude: res.longitude
                    });
                    wx.setStorageSync("latitude", res.latitude)
                    wx.setStorageSync("longitude", res.longitude)
                    that3.saveLoc(res)
                    that3.selectUserGroup()
                  }
                })
              } else {
                wx.showToast({
                  title: '授权失败',
                  icon: 'success',
                  duration: 1000
                })
              }
            }
          })
        }
      }
    });
  },
  //阻断模态弹窗点击穿透
  preventTouchMove: function() {},
  //点击按钮的事件
  shareInit: function(event) {},
  //调用模态弹窗
  showModel: function(e) {
    //将传过来的标题和内容展示到弹窗上
    this.setData({
      isShowModel: true,
      ModelId: e.ModelId,
      ModelTitle: e.ModelTitle,
      ModelContent: e.ModelContent
    })
  },
  //取消事件
  cancel: function(e) {
    //关闭模态弹窗
    this.setData({
      isShowModel: false
    })
  },
  //确定事件
  confirm: function(e) {
    if (e.currentTarget.dataset.modelid == 0) {
      console.log("用户点击了确定(1)")
    }
  }
})
//保存群名称
function saveGroupNameInfo(groupName) {

  if (groupName == "") {
    groupName = " "
  }
  //调用后台进行存储
  wx.request({
    url: config.saveUserGroupUrl,
    data: {
      userGroupInfo: JSON.stringify({
        Opengid: wx.getStorageSync("openGId"),
        Openid: wx.getStorageSync("openid"),
        Diygroupname: groupName
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
}

function saveUserInfo(userInfo) {
  wx.setStorageSync("userInfo", userInfo)
  wx.request({
    url: config.saveUserInfoUrl,
    data: {
      userInfo: JSON.stringify(userInfo),
      openId: wx.getStorageSync("openid")
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function(result) {
      if (result.code == -1) {
        console.log('用户数据存储失败！' + result.data)
      }
    }
  })
}
//个人信息授权失败
function showError() {
  wx.showModal({
    title: '提示',
    content: '您拒绝了微信授权，将无法进入小程序，请授权之后再进入',
    showCancel: false,
    confirmText: '重新授权',
    success: function(res) {
      // 用户没有授权成功，不需要改变 isHide 的值
      if (res.confirm) {
        console.log('用户点击了“重新登录”');
      }
    }
  });
}