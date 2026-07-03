import axiosInstance from "./axiosInstance";
import type { DocumentRecord, DocumentStatus, NewDocumentInput } from "../types/document";

type ContractDto = {
  id: string;
  contractNumber?: string;
  contractName: string;
  partyA?: string;
  partyB?: string;
  contractType?: string | null;
  effectiveDate?: string;
  expirationDate?: string | null;
  documentUrl?: string;
  documentType?: string;
  fileSize?: number | null;
  status?: string;
  tags?: string[];
};

const mapContractStatus = (status?: string): DocumentStatus => {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "COMPLETED" || normalized === "ACTIVE") return "Active";
  if (normalized === "ARCHIVED" || normalized === "ERROR") return "Expired";
  return "Pending";
};

const formatFileSize = (bytes?: number | null): string | undefined => {
  if (!bytes) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const mapContractToDocument = (contract: ContractDto): DocumentRecord => ({
  id: contract.id,
  title: contract.contractName,
  company: contract.partyB || contract.partyA || "—",
  category: contract.contractType || "General",
  startDate: contract.effectiveDate
    ? new Date(contract.effectiveDate).toISOString().split("T")[0]
    : "—",
  endDate: contract.expirationDate
    ? new Date(contract.expirationDate).toISOString().split("T")[0]
    : "—",
  status: mapContractStatus(contract.status),
  fileName: contract.contractNumber
    ? `${contract.contractNumber}.${(contract.documentType || "pdf").toLowerCase()}`
    : contract.contractName,
  fileSize: formatFileSize(contract.fileSize),
  fileType: contract.documentType,
  documentUrl: contract.documentUrl,
  tags: contract.tags ?? [],
});

export const contractApi = {
  list: async (): Promise<DocumentRecord[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: ContractDto[] }>(
      "/contracts"
    );
    return (response.data.data ?? []).map(mapContractToDocument);
  },

  getById: async (id: string): Promise<DocumentRecord | null> => {
    const response = await axiosInstance.get<{ success: boolean; data: ContractDto }>(
      `/contracts/${id}`
    );
    return response.data.data ? mapContractToDocument(response.data.data) : null;
  },

  upload: async (file: File, title?: string): Promise<DocumentRecord> => {
    const formData = new FormData();
    const stamp = Date.now();
    formData.append("file", file);
    formData.append("contractNumber", `DOC-${stamp}`);
    formData.append("contractName", title || file.name.replace(/\.[^/.]+$/, ""));
    formData.append("partyA", "Deepiri");
    formData.append("partyB", "—");
    formData.append("effectiveDate", new Date().toISOString());
    formData.append("contractType", "Uploads");

    const response = await axiosInstance.post<{ success: boolean; data: ContractDto }>(
      "/contracts/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return mapContractToDocument(response.data.data);
  },

  create: async (input: NewDocumentInput): Promise<DocumentRecord> => {
    const stamp = Date.now();
    const placeholder = new File(
      [new Blob([`Document: ${input.title}`], { type: "text/plain" })],
      `${input.title.replace(/\s+/g, "_")}.txt`,
      { type: "text/plain" }
    );
    const formData = new FormData();
    formData.append("file", placeholder);
    formData.append("contractNumber", `DOC-${stamp}`);
    formData.append("contractName", input.title);
    formData.append("partyA", "Deepiri");
    formData.append("partyB", input.company);
    formData.append("effectiveDate", input.startDate || new Date().toISOString());
    if (input.endDate) formData.append("expirationDate", input.endDate);
    formData.append("contractType", input.category || "General");

    const response = await axiosInstance.post<{ success: boolean; data: ContractDto }>(
      "/contracts/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    const doc = mapContractToDocument(response.data.data);
    return { ...doc, status: input.status };
  },
};
