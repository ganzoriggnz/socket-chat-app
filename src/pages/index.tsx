import { Button } from "antd";
import { useEffect, useState } from "react";
import io from "socket.io-client";
let socket;

type Message = {
  author: string;
  message: string;
};

export default function Home() {
  const [username, setUsername] = useState("");
  const [chosenUsername, setChosenUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<Message>>([]);

  const [joinedRoom, setJoinedRoom] = useState("");
  const [roomCreateName, setRoomCreateName] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [Allrooms, setAllrooms] = useState([]);
  const [roomPlayers, setroomPlayers] = useState([]);

  useEffect(() => {
    socketInitializer();
    return () => {
      socket.disconnect();
    };
  }, []);

  const socketInitializer = async () => {
    // We just call it because we don't need anything else out of it
    await fetch("/api/socket");

    socket = io();

    socket.on("newIncomingMessage", (msg) => {
      setMessages((currentMsg) => [
        ...currentMsg,
        { author: msg.author, message: msg.message },
      ]);
      console.log(messages);
    });

    socket.on("receive-message", (data) => {
      setAllMessages((pre) => [...pre, data]);
    });

    socket.on("getrooms", (data) => {
      console.log("getrooms:::", data);
      setAllrooms(data);
    });

    socket.on("joinroom", (data) => {
      console.log("joinroom:::", data);
      setJoinedRoom(data["room_name"]);
      setroomPlayers(data["players"]);
    });
  };

  const sendMessage = async () => {
    socket.emit("createdMessage", { author: chosenUsername, message });
    setMessages((currentMsg) => [
      ...currentMsg,
      { author: chosenUsername, message },
    ]);
    setMessage("");
  };

  const handleKeypress = (e) => {
    //it triggers by pressing the enter key
    if (e.keyCode === 13) {
      if (message) {
        sendMessage();
      }
    }
  };

  function handleSubmit(e) {
    e.preventDefault();
    console.log("emitted");
    socket.emit("send-message", {
      username,
      message,
    });
    setMessage("");
  }

  function createSubmit(e) {
    e.preventDefault();
    socket.emit("createroom", {
      room_name: roomCreateName,
    });
    setRoomCreateName("");
  }

  function joinroomSubmit(e) {
    socket.emit("joinroom", e);
  }

  function leaveSubmit(e) {
    socket.emit("leaveroom", {
      room_name: e,
    });
  }

  return (
    <div className="flex items-center p-4 mx-auto min-h-screen justify-center bg-purple-500">
      <main className="gap-4 flex flex-col items-center justify-center w-full h-full">
        {!chosenUsername ? (
          <>
            <h3 className="font-bold text-white text-xl">
              How people should call you?
            </h3>
            <input
              type="text"
              placeholder="Identity..."
              value={username}
              className="p-3 rounded-md outline-none"
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              onClick={() => {
                setChosenUsername(username);
              }}
              className="bg-white rounded-md px-4 py-2 text-xl"
            >
              Go!
            </button>
          </>
        ) : (
          <>
            <p className="font-bold text-white text-xl">
              Your username: {username}
            </p>
            <div className="flex flex-col justify-end bg-white h-[20rem] min-w-[33%] rounded-md shadow-md ">
              <div className="h-full last:border-b-0 overflow-y-scroll">
                {messages.map((msg, i) => {
                  return (
                    <div
                      className="w-full py-1 px-2 border-b border-gray-200"
                      key={i}
                    >
                      {msg.author} : {msg.message}
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-300 w-full flex rounded-bl-md">
                <input
                  type="text"
                  placeholder="New message..."
                  value={message}
                  className="outline-none py-2 px-2 rounded-bl-md flex-1"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyUp={handleKeypress}
                />
                <div className="border-l border-gray-300 flex justify-center items-center  rounded-br-md group hover:bg-purple-500 transition-all">
                  <button
                    className="group-hover:text-white px-3 h-full"
                    onClick={() => {
                      sendMessage();
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
            <div>
              Create Room :{" "}
              <form onSubmit={createSubmit}>
                <input
                  value={roomCreateName}
                  onChange={(e) => setRoomCreateName(e.target.value)}
                />
              </form>
            </div>
            <div className="flex flex-col gap-2 w-[400px]">
              <div className="flex w-full justify-between">
                <p>Өрөөний нэр</p>
                <p>Холбогдсон хүн</p>
              </div>
              {Allrooms.map(({ room_name, players }, index) => (
                <div
                  key={index}
                  className="flex w-full justify-between items-center"
                >
                  <p>{room_name}</p>
                  <p className="flex gap-2">
                    ({players.length})
                    <Button
                      onClick={() => {
                        joinroomSubmit({ room_name, players });
                      }}
                    >
                      Join
                    </Button>
                  </p>
                </div>
              ))}
            </div>

            <h1 className="w-[500px] flex justify-between items-center gap-2">
              <p>Joined Room :</p>
              <p>{joinedRoom} </p>
              {joinedRoom.length > 0 ? (
                <Button
                  onClick={() => {
                    leaveSubmit(joinedRoom);
                  }}
                >
                  leave
                </Button>
              ) : (
                ""
              )}
            </h1>
            <div>
              {roomPlayers.length}
              {roomPlayers.map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
