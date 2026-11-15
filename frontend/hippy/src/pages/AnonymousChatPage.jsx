import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  ArrowRight,
  Flag,
  Loader,
  LockKeyhole,
  MessageCircle,
  MessageSquare,
  Search,
  ShieldCheck,
  SkipForward,
  X,
} from "lucide-react";

const SOCKET_URL = "http://localhost:5001";
const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate behavior" },
  { value: "spam", label: "Spam or advertising" },
  { value: "other", label: "Something else" },
];

const AnonymousChatPage = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [chatStatus, setChatStatus] = useState("idle");
  const [isBot, setIsBot] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    const anonymousSocket = io(SOCKET_URL, { autoConnect: false });
    setSocket(anonymousSocket);

    anonymousSocket.on("connect", () => {
      setConnectionStatus("connected");
      setErrorMessage("");
    });
    anonymousSocket.on("disconnect", () => {
      setConnectionStatus("disconnected");
      setChatStatus("idle");
    });
    anonymousSocket.on("connect_error", () => {
      setConnectionStatus("disconnected");
      setErrorMessage("Can’t reach the chat server. Make sure the backend is running, then try again.");
    });
    anonymousSocket.on("anonymous:queued", () => {
      setChatStatus("searching");
      setIsBot(false);
      setMessages([]);
      setErrorMessage("");
    });
    anonymousSocket.on("anonymous:matched", ({ stranger, isBot: matchedWithBot = false } = {}) => {
      setChatStatus("matched");
      setIsBot(matchedWithBot);
      setMessages([]);
      setErrorMessage("");
      if (matchedWithBot && stranger) setErrorMessage("");
    });
    anonymousSocket.on("anonymous:message", (message) => {
      setMessages((currentMessages) => [...currentMessages, { ...message, mine: false }]);
    });
    anonymousSocket.on("anonymous:partner-left", () => {
      setChatStatus("idle");
      setIsBot(false);
      setReportOpen(false);
      setErrorMessage("The other person left the chat.");
    });
    anonymousSocket.on("anonymous:left", () => {
      setChatStatus("idle");
      setIsBot(false);
      setMessages([]);
      setReportOpen(false);
    });
    anonymousSocket.on("anonymous:report-received", () => {
      setChatStatus("idle");
      setIsBot(false);
      setMessages([]);
      setReportOpen(false);
      setErrorMessage("Thanks for reporting. You won’t be matched with this person again in this session.");
    });

    anonymousSocket.connect();
    return () => {
      anonymousSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const findChat = () => {
    if (!socket?.connected) {
      setErrorMessage("Connecting to the chat server…");
      return;
    }
    setErrorMessage("");
    socket.emit("anonymous:join");
  };

  const nextChat = () => {
    if (!socket?.connected) return;
    setDraft("");
    setReportOpen(false);
    socket.emit("anonymous:next");
  };

  const leaveChat = () => {
    if (!socket?.connected) return;
    setDraft("");
    setErrorMessage("");
    socket.emit("anonymous:leave");
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || chatStatus !== "matched" || !socket?.connected) return;
    if (text.length > 2000) {
      setErrorMessage("Messages must be 2,000 characters or fewer.");
      return;
    }

    setErrorMessage("");
    socket.emit("anonymous:message", { text }, (result) => {
      if (!result?.ok) {
        setErrorMessage(result?.message || "Your message could not be sent.");
        return;
      }
      setMessages((currentMessages) => [...currentMessages, { ...result.message, mine: true }]);
      setDraft("");
    });
  };

  const reportChat = (reason) => {
    socket?.emit("anonymous:report", { reason });
  };

  const isSearching = chatStatus === "searching";
  const isMatched = chatStatus === "matched";
  const isConnected = connectionStatus === "connected";

  return (
    <main className="min-h-screen px-2 pb-4 pt-20 sm:px-6 sm:pb-6 sm:pt-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1 sm:mb-5">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <MessageCircle className="size-4" />
              </span>
              Meet someone new
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Random chat</h1>
            <p className="mt-1 text-sm text-base-content/55">Talk to someone new, one conversation at a time.</p>
          </div>
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
            isConnected
              ? "border-success/20 bg-success/10 text-success"
              : "border-base-300 bg-base-100 text-base-content/50"
          }`}>
            <span className={`size-2 rounded-full ${isConnected ? "bg-success" : "bg-base-content/30"}`} />
            {isConnected ? "Chat service ready" : "Connecting"}
          </div>
        </div>

        <section className="app-shell grid min-h-[min(72vh,720px)] overflow-hidden rounded-3xl border border-base-300/70 bg-base-100 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex min-h-[34rem] min-w-0 flex-col">
            <header className="flex items-center justify-between border-b border-base-300/70 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {isSearching ? <Search className="size-5 animate-pulse" /> : <MessageSquare className="size-5" />}
                  {isMatched && <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-base-100 bg-success" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{isMatched ? "Stranger" : "Anonymous chat"}</p>
                  <p className={`text-xs ${isMatched && !isBot ? "text-success" : "text-base-content/50"}`}>
                    {isMatched
                      ? isBot ? "Automated bot · not a person" : "Connected with a stranger"
                      : isSearching ? "Finding someone for you…" : "Ready when you are"}
                  </p>
                </div>
              </div>
              {isMatched && (
                <div className="relative flex items-center gap-1">
                  {!isBot && <button
                    type="button"
                    onClick={() => setReportOpen(!reportOpen)}
                    className="btn btn-ghost btn-sm btn-square text-base-content/55"
                    title="Report this person"
                    aria-label="Report this person"
                  >
                    <Flag className="size-4" />
                  </button>}
                  <button
                    type="button"
                    onClick={nextChat}
                    className="btn btn-primary btn-sm gap-2"
                    title="Leave this person and find someone new"
                  >
                    <SkipForward className="size-4" />
                    <span className="hidden sm:inline">Next</span>
                  </button>
                  <button
                    type="button"
                    onClick={leaveChat}
                    className="btn btn-ghost btn-sm btn-square text-base-content/55"
                    title="Leave this chat"
                    aria-label="Leave this chat"
                  >
                    <X className="size-4" />
                  </button>
                  {reportOpen && !isBot && (
                    <div className="absolute right-0 top-11 z-10 w-56 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl">
                      <p className="px-2 py-1 text-xs font-semibold text-base-content/55">Report this chat</p>
                      {REPORT_REASONS.map((reason) => (
                        <button
                          key={reason.value}
                          type="button"
                          onClick={() => reportChat(reason.value)}
                          className="w-full rounded-xl px-2 py-2 text-left text-sm hover:bg-base-200"
                        >
                          {reason.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </header>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-base-200/25 p-4 sm:p-6">
              {isMatched ? (
                <>
                  <div className="mb-2 flex justify-center">
                    <span className="rounded-full border border-base-300/70 bg-base-100 px-3 py-1 text-[11px] text-base-content/50">
                      {isBot ? "You’re chatting with an automated bot" : "You’re chatting anonymously"}
                    </span>
                  </div>
                  {messages.length === 0 && (
                    <div className="m-auto max-w-sm py-8 text-center">
                      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <MessageCircle className="size-6" />
                      </div>
                      <p className="font-semibold">Say hello</p>
                      <p className="mt-1 text-sm text-base-content/55">A friendly first message can start a great conversation.</p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm sm:max-w-[70%] ${
                        message.mine
                          ? "self-end rounded-br-md bg-primary text-primary-content"
                          : "self-start rounded-bl-md border border-base-300/50 bg-base-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                      <time className={`mt-1 block text-right text-[10px] ${message.mine ? "opacity-60" : "text-base-content/40"}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </>
              ) : (
                <div className="m-auto max-w-md px-4 py-10 text-center">
                  <div className={`mx-auto mb-5 flex size-20 items-center justify-center rounded-[1.75rem] ${
                    isSearching ? "bg-primary/10 text-primary" : "bg-base-100 text-primary shadow-lg shadow-base-content/5"
                  }`}>
                    {isSearching ? <Loader className="size-8 animate-spin" /> : <MessageCircle className="size-8" />}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {isSearching ? "Looking for someone…" : "Your next conversation is one click away"}
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-base-content/55">
                    {isSearching
                      ? "You’ll be connected to another visitor if one is waiting, or a clearly labeled chat bot in a few seconds."
                      : "Start matching to chat privately with a random person. No account or profile needed."}
                  </p>
                  {!isSearching && (
                    <button
                      type="button"
                      onClick={findChat}
                      disabled={!isConnected}
                      className="btn btn-primary mt-6 gap-2 px-6"
                    >
                      {isConnected ? "Find someone" : "Connecting…"}
                      <ArrowRight className="size-4" />
                    </button>
                  )}
                  {isSearching && (
                    <button type="button" onClick={leaveChat} className="btn btn-ghost mt-5 gap-2">
                      <X className="size-4" />
                      Cancel search
                    </button>
                  )}
                  {errorMessage && (
                    <p role="status" className="mx-auto mt-4 max-w-sm text-sm text-warning">
                      {errorMessage}
                    </p>
                  )}
                </div>
              )}
            </div>

            {isMatched ? (
              <form onSubmit={sendMessage} className="border-t border-base-300/70 bg-base-100 p-3 sm:p-4">
                {errorMessage && <p role="alert" className="mb-2 text-xs text-error">{errorMessage}</p>}
                <div className="flex items-center gap-2 rounded-2xl border border-base-300/70 bg-base-200/40 p-1.5 pl-3 focus-within:border-primary/50">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value.slice(0, 2000))}
                    placeholder="Write a message…"
                    aria-label="Write a message"
                    maxLength={2000}
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-base-content/40"
                  />
                  <button type="submit" className="btn btn-primary btn-sm btn-square rounded-xl" disabled={!draft.trim()}>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
                <div className="mt-2 flex justify-between px-1 text-[10px] text-base-content/40">
                  <span>Press Next to meet someone else</span>
                  <span>{draft.length}/2000</span>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 border-t border-base-300/70 bg-base-100 px-4 py-3 text-xs text-base-content/45">
                <LockKeyhole className="size-3.5" />
                Private, temporary conversations
              </div>
            )}
          </div>

          <aside className="hidden flex-col border-l border-base-300/70 bg-base-100 p-5 lg:flex">
            <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-success/10 text-success">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="text-sm font-bold">A little privacy goes a long way</h2>
            <p className="mt-2 text-xs leading-relaxed text-base-content/55">
              You’re paired randomly. Your account details aren’t shared, and messages aren’t saved.
            </p>

            <div className="my-5 border-t border-base-300/70" />

            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-base-content/45">Chat safely</h3>
            <ul className="mt-3 space-y-3 text-xs leading-relaxed text-base-content/60">
              <li className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />Don’t share passwords or private details.</li>
              <li className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />Leave or press Next whenever you like.</li>
              <li className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />Report behavior that makes you uncomfortable.</li>
            </ul>

            <div className="mt-auto rounded-2xl bg-base-200/70 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <LockKeyhole className="size-3.5 text-primary" />
                No account required
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-base-content/50">
                Chat history disappears when you leave.
              </p>
            </div>
          </aside>
        </section>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-base-content/45">
          <LockKeyhole className="size-3" />
          Anonymous chats are temporary and aren’t stored.
        </p>
      </div>
    </main>
  );
};

export default AnonymousChatPage;
