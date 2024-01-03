export default (io, socket) => {
  var roomList = [];

  const createdMessage = (msg) => {
    socket.broadcast.emit("newIncomingMessage", msg);
  };

  socket.on("createdMessage", createdMessage);

  console.log("client ::::", socket.id);

  socket.on("input-change", (msg) => {
    socket.broadcast.emit("update-input", msg);
  });

  socket.emit("getrooms", roomList);

  socket.on("createroom", (data) => {
    roomList.push({ room_name: data["room_name"], players: [] });
    io.emit("getrooms", roomList);
  });

  socket.on("joinroom", (data) => {
    roomList.forEach((element) => {
      socket.leave(element["room_name"]);
    });

    socket.join(data["room_name"]);
    socket.emit("joinroom", data);
  });

  socket.on("leaveroom", (data) => {
    socket.leave(data["room_name"]);
    socket.emit("joinroom", {
      room_name: "",
      players: [],
    });
  });

  socket.on("set_player", (data) => {
    const index = roomList.findIndex(
      (item) => item.room_name === data["room_name"]
    );
    if (index > -1) {
      roomList[index].players.push(data["player"]);
      io.to(data["room_name"]).emit("playerSet", roomList[index]);
    }
  });

  socket.on("out_player", (data) => {
    const index = roomList.findIndex(
      (item) => item.room_name === data["room_name"]
    );
    if (index > -1) {
      const playerIndex = roomList[index].players.findIndex(
        (item) => item === data["player"]
      );
      if (playerIndex > -1) {
        roomList[index].players.splice(playerIndex, 1);
        io.to(data["room_name"]).emit("playerSet", roomList[index]);
      }
    }
  });
};
