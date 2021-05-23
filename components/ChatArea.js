import styles from "../styles/Chat.module.scss";

export default function ChatArea({ currentRecipient, messages, userId }) {
  const checkUser = (userIdToCheck) => {
    if (userIdToCheck === userId) {
      return styles.chatFromUser;
    } else {
      return styles.chatToUser;
    }
  };

  if (currentRecipient === undefined) {
    return <></>;
  } else {
    return messages.map((message) => {
      return (
        <p key={message.id} className={checkUser(message.senderId)}>
          {message.contents}
        </p>
      );
    });
  }
}
