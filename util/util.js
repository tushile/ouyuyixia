function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  const hour = parseInt(time / 3600, 10)
  time %= 3600
  const minute = parseInt(time / 60, 10)
  time = parseInt(time % 60, 10)
  const second = time

  return ([hour, minute, second]).map(function(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

function formatDate(date) {
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var fdate = year + seperator1 + month + seperator1 + strDate;
  return fdate;
}
var nextWeek = getWeek()

function getDay(date) {
  var dayStr = ""
  if (nextWeek.indexOf(formatDate(date)) > -1) {
    dayStr = "下"
  }
  var days = date.getDay()
  switch (days) {
    case 1:
      dayStr += '周一';
      break;
    case 2:
      dayStr += '周二';
      break;
    case 3:
      dayStr += '周三';
      break;
    case 4:
      dayStr += '周四';
      break;
    case 5:
      dayStr += '周五';
      break;
    case 6:
      dayStr += '周六';
      break;
    case 0:
      dayStr += '周日';
      break;
  }
  return dayStr
}
//获取下周7天日期
function getWeek() {
  const week = [];
  for (let i = 0; i < 7; i++) {
    let Stamp = new Date();
    let num = 7 - Stamp.getDay() + 1 + i;
    Stamp.setDate(Stamp.getDate() + num);
    week[i] = formatDate(Stamp);
  }
  return week;
}

function formatLocation(longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude)
    latitude = parseFloat(latitude)
  }

  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}

function fib(n) {
  if (n < 1) return 0
  if (n <= 2) return 1
  return fib(n - 1) + fib(n - 2)
}

function formatLeadingZeroNumber(n, digitNum = 2) {
  n = n.toString()
  const needNum = Math.max(digitNum - n.length, 0)
  return new Array(needNum).fill(0).join('') + n
}

function formatDateTime(date, withMs = false) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  const ms = date.getMilliseconds()

  let ret = [year, month, day].map(value => formatLeadingZeroNumber(value, 2)).join('-') +
    ' ' + [hour, minute, second].map(value => formatLeadingZeroNumber(value, 2)).join(':')
  if (withMs) {
    ret += '.' + formatLeadingZeroNumber(ms, 3)
  }
  return ret
}

function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i], 10)
    const num2 = parseInt(v2[i], 10)

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

function getTimeLeave(lastTime) {
  let timeTxt = ""
  var curTimestamp = (new Date().getTime() / 60000).toFixed(1)
  var lastTimestamp = (new Date(lastTime).getTime() / 60000).toFixed(1)
  var timestampDiff = curTimestamp - lastTimestamp // 参数时间戳与当前时间戳相差秒数

  let date = new Date(lastTime)
  let h = date.getHours()
  h = h > 9 ? h : "0" + h;
  if (timestampDiff < 0) {
    timeTxt = date.getMonth() + 1 + "." + date.getDate() + "(" + getDay(date) + ")" + h + '点'
  } else if (timestampDiff > 0 && timestampDiff < 5) {
    timeTxt = "刚刚"
  } else if (timestampDiff > 5 && timestampDiff < 20) {
    timeTxt = "5分钟前"
  } else if (timestampDiff > 20 && timestampDiff < 40) {
    timeTxt = "20分钟前"
  } else if (timestampDiff > 40 && timestampDiff < 60) {
    timeTxt = "40分钟前"
  } else if (timestampDiff > 60 && timestampDiff < 120) {
    timeTxt = "1小时前"
  } else if (timestampDiff > 120 && timestampDiff < 240) {
    timeTxt = "2小时前"
  } else if (timestampDiff > 240 && timestampDiff < 720) {
    timeTxt = "4小时前"
  } else if (timestampDiff > 720 && timestampDiff < 1440) {
    timeTxt = "12小时前"
  } else if (timestampDiff > 1440 && timestampDiff < 2880) {
    timeTxt = "一天前"
  } else if (timestampDiff > 2880 && timestampDiff < 5760) {
    timeTxt = "两天前"
  } else if (timestampDiff > 5760 && timestampDiff < 10080) {
    timeTxt = "四天前"
  } else if (timestampDiff > 10080 && timestampDiff < 20160) {
    timeTxt = "一周前"
  } else if (timestampDiff > 20160 && timestampDiff < 40320) {
    timeTxt = "两周前"
  } else if (timestampDiff > 40320 && timestampDiff < 80640) {
    timeTxt = "一个月前"
  } else if (timestampDiff > 80640 && timestampDiff < 241920) {
    timeTxt = "两个月前"
  } else if (timestampDiff > 241920 && timestampDiff < 483840) {
    timeTxt = "半年前"
  } else if (timestampDiff > 483840) {
    timeTxt = "一年前"
  }
  return timeTxt
}
//判断最长直径与放大倍数的关联
function getScale(ans) {
  var scale = 0
  if (ans < 0.14) {
    scale = 12
  } else if (ans > 0.14 && ans < 0.25) {
    scale = 11
  } else if (ans > 0.25 && ans < 0.50) {
    scale = 10
  } else if (ans > 0.5 && ans < 1.2) {
    scale = 9
  } else if (ans > 1.2 && ans < 2.3) {
    scale = 8
  } else if (ans > 2.3 && ans < 5) {
    scale = 7
  } else if (ans > 5 && ans < 11) {
    scale = 6
  } else if (ans > 11 && ans < 22) {
    scale = 5
  } else if (ans > 22) {
    scale = 4
  }
  return scale
}
module.exports = {
  formatTime,
  formatLocation,
  fib,
  formatDateTime,
  compareVersion,
  getTimeLeave,
  getScale,
  getDay
}