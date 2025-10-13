"use client";

import { useState } from "react";
import {
  Mail,
  Play,
  Square,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Email {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  receivedAt: string;
  processedAt: string;
  status: string;
  classification: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  size: string;
  attachments: {
    filename: string;
    url: string;
    classification?: string;
    confidence?: number;
  }[];
}

interface DashboardClientProps {
  initialEmails: Email[];
}

export default function DashboardClient({ initialEmails }: DashboardClientProps) {
  const [emails] = useState<Email[]>(initialEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [engineRunning, setEngineRunning] = useState<boolean>(false);

  const getStatusBadge = (status: string) => {
    const label = status.replace("_", " ");
    const variant =
      status === "error"
        ? "bg-red-900/40 text-red-400 border border-red-700"
        : status.includes("completed")
        ? "bg-emerald-900/30 text-emerald-300 border border-emerald-700"
        : "bg-gray-800 text-gray-300 border border-gray-700";

    return (
      <Badge className={`${variant} font-medium px-2 py-1 text-xs rounded-md`}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-black text-white p-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl text-white font-bold tracking-tight flex items-center gap-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow">
          <Mail className="w-7 h-7 text-white" />
          Email Dashboard
        </h1>

        <div className="flex gap-3">
          {!engineRunning ? (
            <Button
              variant="outline"
              className="border border-green-500 bg-green-500 text-white hover:border hover:border-green-600 hover:bg-green-600 hover:text-white"
              onClick={() => setEngineRunning(true)}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Engine
            </Button>
          ) : (
            <Button
              variant="outline"
              className="border border-red-500 bg-red-500 text-white hover:border hover:border-red-600 hover:bg-red-600 hover:text-white"
              onClick={() => setEngineRunning(false)}
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Engine
            </Button>
          )}
        </div>
      </div>

      {/* Email Table */}
      <Card className="bg-neutral-950/80 border border-neutral-800 shadow-xl rounded-2xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Email Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-neutral-800">
            <Table>
              <TableHeader className="bg-neutral-900/70">
                <TableRow>
                  <TableHead className="text-white font-semibold">Subject</TableHead>
                  <TableHead className="text-white font-semibold">Sender</TableHead>
                  <TableHead className="text-white font-semibold">Received</TableHead>
                  <TableHead className="text-white font-semibold">Status</TableHead>
                  <TableHead className="text-white font-semibold text-center">
                    Attachments
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <motion.tr
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    whileHover={{ backgroundColor: "rgba(20,20,20,0.9)" }}
                    className="cursor-pointer transition-all border-b border-neutral-800 hover:shadow-[0_0_10px_rgba(0,255,180,0.15)] m-10"
                  >
                    <TableCell className="max-w-xs truncate text-gray-100">
                      {email.subject}
                    </TableCell>
                    <TableCell className="text-gray-300">{email.sender}</TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {email.receivedAt}
                    </TableCell>
                    <TableCell>{getStatusBadge(email.status)}</TableCell>
                    <TableCell className="text-gray-300 text-center">
                      {email.attachments.length}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Floating Dialog */}
      <AnimatePresence>
        {selectedEmail && (
          <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
            <DialogContent className="bg-neutral-950/95 backdrop-blur-md border border-neutral-800 max-w-3xl text-white rounded-2xl shadow-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-1">
                  {selectedEmail.subject}
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-sm">
                  Detailed view of this email and attachments
                </DialogDescription>
              </DialogHeader>

              <Separator className="my-4 bg-neutral-800" />

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
                <p><strong>From:</strong> {selectedEmail.sender}</p>
                <p><strong>To:</strong> {selectedEmail.recipient}</p>
                <p><strong>Received:</strong> {selectedEmail.receivedAt}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedEmail.status)}</p>
                <p><strong>Classification:</strong> {selectedEmail.classification}</p>
                <p><strong>Priority:</strong> {selectedEmail.priority}</p>
              </div>

              <Separator className="my-4 bg-neutral-800" />

              <h3 className="font-semibold text-gray-200 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Attachments
              </h3>
              <div className="overflow-x-auto border border-neutral-800 rounded-lg mb-4">
                <Table>
                  <TableHeader className="bg-gray-100/70">
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>View</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEmail.attachments.map((att) => (
                      <TableRow
                        key={att.filename}
                        className="border-neutral-800 hover:bg-neutral-900/60 transition"
                      >
                        <TableCell>{att.filename}</TableCell>
                        <TableCell>{att.classification || "-"}</TableCell>
                        <TableCell>
                          {att.confidence !== undefined ? `${att.confidence}%` : "-"}
                        </TableCell>
                        <TableCell>
                          <a
                            href={att.url}
                            target="_blank"
                            className="text-emerald-400 hover:text-emerald-300 underline transition"
                          >
                            Open
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-4 bg-neutral-800" />
              
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
