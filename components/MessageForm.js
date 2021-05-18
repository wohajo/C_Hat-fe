import { React, useState } from "react";
import { decryptString, encryptString } from "./service/utlis";
import { Toast, Form, Button, FormControl, InputGroup } from "react-bootstrap";

export default function name({
  currentRecipientId,
  currentRecipient,
  cookies,
  friends,
  roomsMap,
  socket,
  username,
  userId,
  token,
}) {
  const [messageValue, setMessageValue] = useState("");

  const sendMessage = () => {
    if (messageValue.length < 1) {
      return;
    }

    const receiver = friends.find(
      (friend) => friend.username === currentRecipient
    );
    const receiverRoom = roomsMap.get(receiver.id);

    const encryptedMessageString = encryptString(
      messageValue,
      cookies["secretWith" + currentRecipient]
    );

    socket.emit("room_message", {
      roomName: receiverRoom,
      sender: username,
      senderId: userId,
      receiver: currentRecipient,
      receiverId: receiver.id,
      contents: encryptedMessageString,
      token: token,
    });
    setMessageValue(() => "");
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}
      inline
    >
      <InputGroup className="mb-3">
        <FormControl
          disabled={currentRecipientId === -1 ? true : false}
          placeholder="Message"
          value={messageValue}
          onChange={(e) => {
            setMessageValue(e.target.value);
          }}
        />
        <InputGroup.Append>
          <Button
            disabled={currentRecipientId === -1 ? true : false}
            variant="dark"
            id="send-button"
            type="submit"
          >
            Send
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  );
}
