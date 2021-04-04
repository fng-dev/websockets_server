'use strict'

const User = use('App/Models/User')

class ChatController {

  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
    this.user = {}
    this.createUser(this.socket.id).then(() => {
      this.getusers().then((response) => {
        const users = response
        this.socket.broadcastToAll('connected', {status: 'connected', users})
      });
    })

  }

  onMessage(message) {
    message.emitedByMe = false;
    message.name = this.user.name
    this.socket.broadcast('message', message)
  }

  async onChangeName(data) {
    const user = await User.query().where('socket_id', this.socket.id).first();

    if(user) {
      user.name = data;
      this.user.name = data
      await user.save();
      this.sendUsers();
    }
  }

  async onGetUsers() {
    const users = await User.all();
    this.socket.emit('users', users)
  }

  async onClose(){
    const user = await User.query().where('socket_id', this.socket.id).first();
    if(user) {
      await user.delete();
    }
  }

  async createUser(id){
    const name = `Usuario#${Math.floor(Math.random() * 1000)}`
    this.user = {
      name: name,
      socket_id: id
    }
    await User.create(this.user)
  }

  async sendUsers(){
    const users = await User.all()
    this.socket.broadcastToAll('users', users)
  }

  async getusers(){
    const users = await User.all()
    return users;
  }
}

module.exports = ChatController
