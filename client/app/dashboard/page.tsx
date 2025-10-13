import DashboardClient from "./DashboardClient";

type RawAttachment = {
  filename: string;
  url: string;
  classification?: string;
  confidence?: number;
};

type RawEmail = {
  id: string;
  body?: string;
  sender?: string;
  timestamp: string;
  updatedAt: string;
  status?: string;
  attachments?: { attachments: RawAttachment[] };
};

type Email = {
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
};

function transformData(rawData: RawEmail[]): Email[] {
  return rawData.map((item) => {
    const attachments = item.attachments?.attachments || [];
    return {
      id: item.id,
      subject: item.body?.slice(0, 50) || "No Subject",
      sender: item.sender || "Unknown",
      recipient: "demo@mock.com",
      receivedAt: new Date(item.timestamp).toLocaleString(),
      processedAt: new Date(item.updatedAt).toLocaleString(),
      status: item.status || "Unknown",
      classification: attachments[0]?.classification || "unknown",
      priority: "Medium",
      size: `${Math.floor(Math.random() * 100)} KB`,
      attachments: attachments.map((a: RawAttachment) => ({
        filename: a.filename,
        url: a.url,
        classification: a.classification,
        confidence: a.confidence ? Math.round(a.confidence * 100) : 0,
      })),
    };
  });
}


async function getEmailsFromApi(): Promise<Email[]> {
  try {
    const res = await fetch("http://localhost:3000/proxy", {
      cache: "no-store", // ensure always fresh
    });

    if (!res.ok) {
      console.error("Failed to fetch from API:", res.statusText);
      return [];
    }

    const data = await res.json();
    return transformData(data);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
}

export default async function DashboardPage() {
  const emails = await getEmailsFromApi();
  return <DashboardClient initialEmails={emails.reverse()} />;
}
