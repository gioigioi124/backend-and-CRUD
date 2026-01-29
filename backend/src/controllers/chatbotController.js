import { genAI, pc, indexName } from "../config/ai.js";
import xlsx from "xlsx";
import KnowledgeBaseFile from "../models/KnowledgeBaseFile.js";

export const uploadKnowledgeBase = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const index = pc.index(indexName);
    const filename = req.file.originalname;

    // 1. Clear old data from Pinecone
    console.log(`Clearing old data for file: ${filename}...`);
    await index.deleteMany({ source: { $eq: filename } });

    // 2. Clear meta info from MongoDB if exists
    await KnowledgeBaseFile.findOneAndDelete({ filename: filename });

    // Prepare documents
    const documents = data.map((row, i) => {
      // Create a structured string: "Column1: Value1, Column2: Value2..."
      const content = Object.entries(row)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");

      return {
        id: `row-${Date.now()}-${i}`,
        content,
        metadata: { ...row, text: content, source: req.file.originalname },
      };
    });

    console.log(`Processing ${documents.length} rows...`);

    // Get embedding model
    const embeddingModel = genAI.getGenerativeModel({
      model: "models/text-embedding-004",
    });

    // Create embeddings and upsert
    // Note: Gemini embedding-001 supports batching
    const chunkSize = 20;
    for (let i = 0; i < documents.length; i += chunkSize) {
      const chunk = documents.slice(i, i + chunkSize);

      const batchEmbeddings = await embeddingModel.batchEmbedContents({
        requests: chunk.map((doc) => ({
          content: { role: "user", parts: [{ text: doc.content }] },
          taskType: "RETRIEVAL_DOCUMENT",
        })),
      });

      const upsertData = chunk.map((doc, index) => ({
        id: doc.id,
        values: batchEmbeddings.embeddings[index].values,
        metadata: doc.metadata,
      }));

      await index.upsert(upsertData);
    }

    // 3. Save file info to MongoDB
    await KnowledgeBaseFile.create({
      filename: filename,
      originalName: filename,
      rowCount: documents.length,
      uploadedBy: req.user?._id,
    });

    res.status(200).json({
      message: `Successfully updated knowledge base with ${documents.length} items.`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Error uploading knowledge base",
      error: error.message,
    });
  }
};

export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const index = pc.index(indexName);

    // 1. Create embedding for user query
    const embeddingModel = genAI.getGenerativeModel({
      model: "models/text-embedding-004",
    });

    const embeddingResult = await embeddingModel.embedContent({
      content: { parts: [{ text: message }] },
      taskType: "RETRIEVAL_QUERY",
    });
    const queryEmbedding = embeddingResult.embedding.values;

    // 2. Query Pinecone
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 25,
      includeMetadata: true,
    });

    // Lọc những kết quả có score quá thấp (giảm nhiễu khi dữ liệu lớn)
    const threshold = 0.4;
    const filteredMatches = queryResponse.matches.filter(
      (match) => match.score >= threshold,
    );

    console.log(
      `Pinecone tìm thấy ${queryResponse.matches.length} kết quả, giữ lại ${filteredMatches.length} kết quả chất lượng (score > ${threshold})`,
    );

    filteredMatches.forEach((match, idx) => {
      console.log(
        `Match ${idx + 1} (Score: ${match.score}):`,
        match.metadata.text?.substring(0, 100),
      );
    });

    const context = filteredMatches
      .map(
        (match) =>
          `[Độ liên quan: ${Math.round(match.score * 100)}%]: ${match.metadata.text}`,
      )
      .join("\n---\n");

    const systemPrompt = `Bạn là một trợ lý AI chuyên nghiệp.
Sử dụng thông tin ngữ cảnh dưới đây (được sắp xếp theo độ liên quan từ cao đến thấp) để trả lời người dùng.

LƯU Ý QUAN TRỌNG:
1. Nếu trong ngữ cảnh có nhiều mục cùng tên (ví dụ cùng là "Mai Hương"), hãy liệt kê rõ các lựa chọn dựa trên địa chỉ hoặc thông tin đi kèm.
2. Nếu người dùng hỏi đích danh một địa điểm (ví dụ "Mai Hương ở Bắc Giang"), hãy ưu tiên tìm mục có chứa từ "Bắc Giang" trong ngữ cảnh.
3. Chatbot không được bịa đặt thông tin. Nếu trong ngữ cảnh không thấy "Mai Hương" ở "Bắc Giang", hãy nói rõ: "Trong dữ liệu của tôi chỉ thấy nhà Mai Hương ở Nam Định (và các nơi khác nếu có), không thấy ở Bắc Giang".

Ngữ cảnh:
${context || "Không tìm thấy dữ liệu liên quan trong bộ nhớ kiến thức."}`;

    // 3. Generate response with Gemini
    console.log("--- Generating response with Gemini-flash-latest ---");
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
    });

    // Convert history to Gemini format
    // OpenAI: { role: 'user', content: '...' }
    // Gemini: { role: 'user', parts: [{ text: '...' }] }
    let geminiHistory = history.slice(-5).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // CRITICAL: Gemini requires the first message in history to be from 'user'
    while (geminiHistory.length > 0 && geminiHistory[0].role === "model") {
      geminiHistory.shift();
    }

    const chatInstance = model.startChat({
      history: geminiHistory,
    });

    console.log("Sending message to Gemini...");
    const result = await chatInstance.sendMessage(message);
    const reply = result.response.text();
    console.log("Gemini reply received.");

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error details:", error);
    res
      .status(500)
      .json({ message: "Error during chat", error: error.message });
  }
};

export const deleteKnowledgeBase = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ message: "Filename is required" });
    }

    const index = pc.index(indexName);
    console.log(`Deleting all data for file: ${filename}...`);

    // 1. Delete from Pinecone
    await index.deleteMany({ source: { $eq: filename } });

    // 2. Delete from MongoDB
    await KnowledgeBaseFile.findOneAndDelete({ filename: filename });

    res
      .status(200)
      .json({ message: `Successfully deleted knowledge base for ${filename}` });
  } catch (error) {
    console.error("Delete error:", error);
    res
      .status(500)
      .json({ message: "Error deleting knowledge base", error: error.message });
  }
};

export const getKnowledgeSources = async (req, res) => {
  try {
    const files = await KnowledgeBaseFile.find().sort({ createdAt: -1 });
    res.status(200).json(files);
  } catch (error) {
    console.error("List sources error:", error);
    res
      .status(500)
      .json({ message: "Error fetching sources", error: error.message });
  }
};
