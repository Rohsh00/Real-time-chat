import { useDispatch, useSelector } from "react-redux";
import {
  fetchChatList,
  searchUsers,
  startChat,
  setSelectedChat,
} from "../../slices/chatSlice";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function UserList() {
  const dispatch = useDispatch();
  const debounceRef = useRef(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const URLChatID = searchParams.get("chatid");

  const { chatid } = useParams();
  console.log("Chat ID:", chatid);

  const { chatList, searchedUsers, selectedChat, searchLoading } = useSelector(
    (state) => state.chat,
  );

  const { userId } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchChatList());
  }, [dispatch]);

  useEffect(() => {
    if (!chatid || chatList.length === 0) return;

    const urlChat = chatList.find((chat) => chat._id === chatid);
    if (urlChat && selectedChat?._id !== urlChat._id) {
      dispatch(setSelectedChat(urlChat));
    }
  }, [chatid, chatList, dispatch, selectedChat]);

  const userSearchHandler = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        dispatch(searchUsers(value));
      }
    }, 500);
  };

  const handleChatClick = (chat) => {
    console.log({ chat });
    dispatch(setSelectedChat(chat));
    navigate(`/chat/${chat._id}`);
  };

  return (
    <div className="w-80 border-r bg-white flex flex-col h-full">
      <div className="p-4 border-b font-semibold text-lg">Chats</div>

      <div className="p-3 relative">
        <input
          placeholder="Search users..."
          className="w-full px-3 py-2 border rounded-xl bg-gray-100"
          value={search}
          onChange={userSearchHandler}
        />

        {search && (
          <div className="absolute left-3 right-3 top-14 bg-white border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
            {searchLoading && (
              <p className="p-3 text-sm text-gray-400">Searching...</p>
            )}

            {!searchLoading &&
              searchedUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => {
                    dispatch(startChat(user._id)).then(() =>
                      dispatch(fetchChatList()),
                    );
                    setSearch("");
                  }}
                  className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                >
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                    {user.username[0]}
                  </div>
                  <span className="capitalize">{user.username}</span>
                </div>
              ))}

            {!searchLoading && searchedUsers.length === 0 && (
              <p className="p-3 text-sm text-gray-400">No users found</p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {chatList.map((chat) => {
          const otherUser = chat.user1._id === userId ? chat.user2 : chat.user1;
          const isSelected = selectedChat?._id === chat._id;

          return (
            <div
              key={chat._id}
              onClick={() => handleChatClick(chat)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer
                ${isSelected ? "bg-blue-100" : "hover:bg-gray-100"}`}
            >
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center capitalize">
                {otherUser?.username?.[0]}
              </div>

              <div className="flex-1">
                <p className="capitalize font-medium">{otherUser?.username}</p>
                <p className="text-xs text-gray-500 truncate">
                  {chat.lastMessage || "No messages yet"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserList;
