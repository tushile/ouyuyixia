//Graham算法求凸包
var convexHull = function() {
  return {
    rondompoint: function(size) {
      //随机生成若干个点
      var n = size;
      var points = new Array(n);
      // 随机初始化定点
      for (var i = 0; i < n; i++) {
        points[i] = new Object();
        points[i].longitude = Math.random() * (10 - 0) + 0, scl;
        points[i].latitude = Math.random() * (10 - 0) + 0, scl;
      }
      return points;
    },
    getMinyPoint: function(points, size) {
      //获取Y值最小的点 p0
      var min = points[0];
      var minId = 0
      for (var i = 1; i < size; i++) {
        if (points[i].latitude < min.latitude) {
          min = points[i];
          minId = i;
        }
      }
      return minId;
    },
    getCos: function(minId, points, mcos, size) {
      //获取p0与其余个点的连线和X轴的余弦值
      var coss;
      for (var i = 0; i < size; i++) {
        if (i == minId) {
          mcos[i] = 2;
        } else {
          coss = (points[i].longitude - points[minId].longitude) / Math.sqrt((points[i].longitude - points[minId].longitude) * (points[i].longitude - points[minId].longitude) + (points[i].latitude - points[minId].latitude) * (points[i].latitude - points[minId].latitude));
          mcos[i] = coss;
        }
      }
      return mcos;
    },
    sortPoints: function(mcos, points, size) {
      //将所得余弦值又大到小排序
      for (var i = 0; i < size; i++) {
        for (var j = 0; j < size - i - 1; j++) {
          if (mcos[j] < mcos[j + 1] || (mcos[j] == mcos[j + 1] && points[j].latitude > points[j + 1].latitude)) {
            let temp_cos = mcos[j];
            mcos[j] = mcos[j + 1];
            mcos[j + 1] = temp_cos;
            let temp_point = points[j];
            points[j] = points[j + 1];
            points[j + 1] = temp_point;
          }
        }
      }
      return points;
    },
    cww: function(a, b, c) {
      //判断ab向量和ac向量是否为逆时针旋转
      var area = (b.longitude - a.longitude) * (c.latitude - a.latitude) - (b.latitude - a.latitude) * (c.longitude - a.longitude);
      if (area < 0) {
        return -1;
      } else if (area > 0) {
        return 1;
      } else {
        return 0;
      }
    },
    //求凸包 Graham算法
    getOutPoint: function(points, size) {
      var outPoints = [];
      outPoints.push(points[0]);
      outPoints.push(points[1]);
      for (var i = 2; i < size; i++) {
        if (this.cww(outPoints[outPoints.length - 2], outPoints[outPoints.length - 1], points[i]) >= 0) {
          outPoints.push(points[i]);
        } else {
          outPoints.pop();
          i--;
        }
      }
      return outPoints;
    }
  }
}
//旋转卡壳法求最大直径
var RC = function() {
  return {
    cross: function(a, b, c) {
      //计算abc三点叉积
      return (b.longitude - a.longitude) * (c.latitude - a.latitude) - (c.longitude - a.longitude) * (b.latitude - a.latitude);
    },
    dis: function(a, b) {
      //计算ab两点距离平方
      return (a.longitude - b.longitude) * (a.longitude - b.longitude) + (a.latitude - b.latitude) * (a.latitude - b.latitude);
    },
    rc: function(outPoints, size) {
      //旋转卡壳法
      var q = 1;
      var ans = 0;
      outPoints[size] = outPoints[0];
      for (var p = 0; p < size; p++) {
        while (this.cross(outPoints[p + 1], outPoints[q + 1], outPoints[p]) > this.cross(outPoints[p + 1], outPoints[q], outPoints[p])) {
          q = (q + 1) % size;
        }
        ans = Math.max(ans, Math.max(this.dis(outPoints[p], outPoints[q]), this.dis(outPoints[p + 1], outPoints[q + 1])));
      }
      outPoints.pop();
      return ans;
    }
  }
}

//求坐标点最外层边框，并排序
var getOutPoints = function(points) {
  var convexHullMethod = convexHull();
  var RCMethod = RC();
  console.log('所有坐标：', points);
  var size = points.length;
  var minId = convexHullMethod.getMinyPoint(points, size);
  var mcos = [];
  mcos = convexHullMethod.getCos(minId, points, mcos, size);
  points = convexHullMethod.sortPoints(mcos, points, size);
  var outPoints
  var ans
  if (points.length == 1) {
    outPoints = points
    ans = 0
  } else {
    outPoints = convexHullMethod.getOutPoint(points, size);
    ans = Math.sqrt(RCMethod.rc(outPoints, outPoints.length));
  }
  console.log('最外层坐标：', outPoints);
  console.log('最大直径：', ans);
  return {
    outPoints: outPoints,
    ans: ans
  }
}
module.exports = {
  convexHull,
  RC,
  getOutPoints
}

function init() {
  var convexHullMethod = convexHull();
  var RCMethod = RC();
  //生成二十个随机坐标点
  //var size = 20;
  //var points = convexHullMethod.rondompoint(size);
  var points = [{
    longitude: 1,
    latitude: 0
  }, {
    longitude: 0,
    latitude: 1
  }, {
    longitude: 0,
    latitude: -1
  }, {
    longitude: 0,
    latitude: -2
  }, {
    longitude: -1,
    latitude: 0
  }, {
    longitude: 2,
    latitude: 0
  }, {
    longitude: -2,
    latitude: 0
  }, {
    longitude: 0,
    latitude: 2
  }]
  console.log('所有坐标');
  console.log(points);
  var size = points.length;
  var minId = convexHullMethod.getMinyPoint(points, size);
  var mcos = [];
  mcos = convexHullMethod.getCos(minId, points, mcos, size);
  points = convexHullMethod.sortPoints(mcos, points, size);
  var outPoints = convexHullMethod.getOutPoint(points, size);
  console.log('最外层坐标');
  console.log(outPoints);
  var ans = Math.sqrt(RCMethod.rc(outPoints, outPoints.length));
  console.log('最大直径：' + ans);
}