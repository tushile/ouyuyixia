var websocketMessagePrefix = "tushile:";
var websocketMessageSeparator = ";";
var websocketMessagePrefixLen = websocketMessagePrefix.length;
var websocketMessageSeparatorLen = websocketMessageSeparator.length;
var websocketMessagePrefixAndSepIdx = websocketMessagePrefixLen + websocketMessageSeparatorLen - 1;
//获取自定义事件名，与后台对应
function getWebsocketCustomEvent(websocketMessage) {
  if (websocketMessage.length < websocketMessagePrefixAndSepIdx) {
    return "";
  }
  var s = websocketMessage.substring(websocketMessagePrefixAndSepIdx, websocketMessage.length);
  var evt = s.substring(0, s.indexOf(websocketMessageSeparator));
  return evt;
};
//获取自定义消息字符串
function getCustomMessage(event, websocketMessage) {
  var eventIdx = websocketMessage.indexOf(event + websocketMessageSeparator);
  var s = websocketMessage.substring(eventIdx + event.length + websocketMessageSeparator.length + 2, websocketMessage.length);
  return s;
};
//处理websocket返回消息
function messageReceivedFromConn(data) {
  var message = data.data;
  if (message.indexOf(websocketMessagePrefix) != -1) {
    var event_1 = getWebsocketCustomEvent(message);
    if (event_1 != "") {
      return {
        evt: event_1,
        msg: getCustomMessage(event_1, message)
      }
    }
  }
};

module.exports = {
  messageReceivedFromConn
}