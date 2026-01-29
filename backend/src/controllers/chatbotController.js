import { genAI, pc, indexName } from "../config/ai.js";
import xlsx from "xlsx";

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

    // Prepare documents
    const documents = data.map((row, i) => {
      // Concatenate all cell values into one string for embedding
      const content = Object.values(row).join(" ");
      return {
        id: `row-${Date.now()}-${i}`,
        content,
        metadata: { ...row, source: req.file.originalname },
      };
    });

    console.log(`Processing ${documents.length} rows...`);

    // Get embedding model
    const embeddingModel = genAI.getGenerativeModel({
      model: "models/gemini-embedding-001",
    });

    // Create embeddings and upsert
    // Note: Gemini embedding-001 supports batching
    const chunkSize = 20;
    for (let i = 0; i < documents.length; i += chunkSize) {
      const chunk = documents.slice(i, i + chunkSize);

      const batchEmbeddings = await embeddingModel.batchEmbedContents({
        requests: chunk.map((doc) => ({
          content: { role: "user", parts: [{ text: doc.content }] },
        })),
      });

      const upsertData = chunk.map((doc, index) => ({
        id: doc.id,
        values: batchEmbeddings.embeddings[index].values,
        metadata: {
          text: doc.content,
          ...doc.metadata,
        },
      }));

      await index.upsert(upsertData);
    }

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
      model: "models/gemini-embedding-001",
    });

    const embeddingResult = await embeddingModel.embedContent(message);
    const queryEmbedding = embeddingResult.embedding.values;

    // 2. Query Pinecone
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    const context = queryResponse.matches
      .map((match) => match.metadata.text)
      .join("\n---\n");

    const systemPrompt = `Bạn là một trợ lý AI hữu ích. Sử dụng thông tin ngữ cảnh dưới đây để trả lời câu hỏi của người dùng. Nếu thông tin dưới đây không có câu trả lời, hãy trả lời dựa trên kiến thức của bạn nhưng ưu tiên ngữ cảnh được cung cấp.
    
Ngữ cảnh:
${context}`;

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
