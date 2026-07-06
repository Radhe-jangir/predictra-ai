import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input, Select } from "../components/ui/Input";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { slideInLeft, slideInRight, fadeIn } from "../lib/motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = { role: "user" | "assistant"; text: string; source?: string };

export function ChatPage() {
  const { token } = useAuth();
  const [datasetId, setDatasetId] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Choose a dataset and ask something like \u201cWhich region performs best?\u201d or \u201cShow the biggest trend.\u201d" },
  ]);
  const datasets = useQuery({ queryKey: ["datasets"], queryFn: () => api.datasets(token!), enabled: Boolean(token) });
  const chat = useMutation({ mutationFn: ({ id, q }: { id: number; q: string }) => api.chat(token!, id, q) });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!datasetId || !question.trim()) return;
    const q = question.trim();
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: q }]);
    try {
      const response = await chat.mutateAsync({ id: Number(datasetId), q });
      setMessages((current) => [...current, { role: "assistant", text: response.answer, source: response.source }]);
    } catch (err) {
      setMessages((current) => [...current, { role: "assistant", text: err instanceof Error ? err.message : "I could not answer that question." }]);
    }
  }

  return (
    <motion.div className="space-y-6" variants={fadeIn} initial="hidden" animate="show">
      <div><h1 className="text-3xl font-semibold">Chat with data</h1><p className="mt-2 text-muted-foreground">Ask business questions in plain English with AI or local statistical fallback.</p></div>
      <Card className="min-h-[70vh]">
        <div className="mb-4 max-w-sm"><Select value={datasetId} onChange={(e) => setDatasetId(e.target.value)}><option value="">Choose dataset</option>{datasets.data?.datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select></div>
        <div className="flex h-[52vh] flex-col gap-3 overflow-auto rounded-md border border-border bg-muted/35 p-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                variants={message.role === "assistant" ? slideInLeft : slideInRight}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, x: message.role === "assistant" ? -20 : 20 }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <span className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
                    <Bot size={18} />
                  </span>
                )}
                <div className={`max-w-2xl rounded-lg p-3 text-sm leading-6 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-background"}`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-3 leading-7">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-3">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 mb-3">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold">{children}</strong>
                      ),
                      table: ({ children }) => (
                        <table className="w-full border-collapse border border-gray-300 my-3">
                          {children}
                        </table>
                      ),
                      th: ({ children }) => (
                        <th className="border p-2 bg-gray-100 text-left">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="border p-2">{children}</td>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-1 py-0.5 rounded">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>{message.source && <Badge
                    className={
                      message.source === "🟢 AI Generated"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {message.source}
                  </Badge>}
                </div>
                {message.role === "user" && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted"><User size={18} /></span>}
              </motion.div>
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {chat.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-3"
              >
                <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <span className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
                  <Bot size={18} />
                </span>
                <div className="rounded-lg bg-background p-3">
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about highest sales, top region, outliers, trends..." />
          <Button disabled={!datasetId || chat.isPending}>
            <motion.span
              animate={chat.isPending ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: chat.isPending ? Infinity : 0, ease: "linear" }}
              className="inline-flex"
            >
              <Send size={16} />
            </motion.span>
            {" "}Send
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
