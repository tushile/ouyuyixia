/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

//const host = 'http://127.0.0.1:443'
//const wsshost = 'ws://127.0.0.1:443'
const host = 'https://heltoo.xyz'
const wsshost = 'wss://heltoo.xyz'
const config = {

  // 下面的地址配合云端 Server 工作
  host,

  // 登录地址，用于建立会话
  loginUrl: `${host}/login`,

  // 保存用户信息
  saveUserInfoUrl: `${host}/saveUserInfo`,

  // 保存位置信息
  saveLocationUrl: `${host}/saveLocation`,

  // 保存用户群信息
  saveUserGroupUrl: `${host}/saveUserGroup`,

  // 查询用户群信息
  selectUserGroupUrl: `${host}/selectUserGroup`,

  // 查询我的所有群信息
  selectMyGroupUrl: `${host}/selectMyGroup`,

  // 存储活动发布
  savePlayUrl: `${host}/savePlay`,

  // 查询我的所有活动
  selectMyAllPlayUrl: `${host}/selectMyAllPlay`,

  // 查询活动成员
  selectPlayerUrl: `${host}/selectPlayer`,

  // 加入活动
  addPlayUrl: `${host}/addPlay`,

  // 退出活动
  leavePlayUrl: `${host}/leavePlay`,

  //websocket地址
  wsUrl: `${wsshost}/echo`
}

module.exports = config