import websocket ,{ WebSocketServer } from 'ws';

class Server {
  wss?: WebSocketServer;
  wsList: {
    [key: string]: websocket
  } = {};
  constructor () {
    this.init();
  }

  init () {
    this.wss = new WebSocketServer({
      port: 1234,
    })

    this.wss.on('connection', this.handleConnect.bind(this));
    console.log('bind 1234')
  }

  async handleConnect (ws: websocket) {
    // ws.onclose = () => {

    // }
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data as string);
      if (data.type === 'new-user') {
        if (this.wsList[data.name]) {
          // console.log('重复进入');
          throw Error('重复进入')
        }
        console.log('get new user', data.name)
        ws.send(`get user ${data.name}`)
        this.wsList[data.name] = ws
      } else if (data.type === 'video-offer') {
        const { name, sdp } = data;
        const otherWs = this.getOtherUser(name, data.type);

        if (otherWs) {
          otherWs.send(JSON.stringify({
            type: 'video-offer',
            name,
            sdp,
          }))
        }
      } else if (data.type === 'video-answer') {
        const { name, sdp } = data;
        const otherWs = this.getOtherUser(name, data.type);

        if (otherWs) {
          otherWs.send(JSON.stringify({
            type: 'video-answer',
            name,
            sdp,
          }))
        }
      } else if (data.type === 'new-ice-candidate') {
        const { name, sdp } = data;
        const otherWs = this.getOtherUser(name, data.type);

        if (otherWs) {
          otherWs.send(JSON.stringify({
            type: 'new-ice-candidate',
            name,
            sdp,
          }))
        }
      }
    }
  }

  getOtherUser(name: string, type: string) {
    const keys = Object.keys(this.wsList);
    console.log(keys, name)
    const otherUser = keys.find(item => item != name)
    if (otherUser) {
      console.log('send other user sdp', name, otherUser, type);
      return this.wsList[otherUser]
    }
    console.log('未找到另外一个用户')
    return null;
  }
}

new Server()