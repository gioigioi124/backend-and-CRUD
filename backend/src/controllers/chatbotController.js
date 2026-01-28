import { openai, pc, indexName } from "../config/ai.js";
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

    // Create embeddings and upsert
    // Note: Breaking into chunks to avoid potential limits
    const chunkSize = 20;
    for (let i = 0; i < documents.length; i += chunkSize) {
      const chunk = documents.slice(i, i + chunkSize);

      const embeddings = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk.map((doc) => doc.content),
      });

      const upsertData = chunk.map((doc, index) => ({
        id: doc.id,
        values: embeddings.data[index].embedding,
        metadata: {
          text: doc.content,
          ...doc.metadata,
        },
      }));

      await index.upsert(upsertData);
    }

    res
      .status(200)
      .json({
        message: `Successfully updated knowledge base with ${documents.length} items.`,
      });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({
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
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 2. Query Pinecone
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    const context = queryResponse.matches
      .map((match) => match.metadata.text)
      .join("\n---\n");

    // 3. Generate response with OpenAI
    const systemPrompt = `Bạn là một trợ lý AI hữu ích. Sử dụng thông tin ngữ cảnh dưới đây để trả lời câu hỏi của người dùng. Nếu thông tin dưới đây không có câu trả lời, hãy trả lời dựa trên kiến thức của bạn nhưng ưu tiên ngữ cảnh được cung cấp.
    
Ngữ cảnh:
${context}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use gpt-4o-mini for better speed/cost
      messages: [
        { role: "system", content: systemPrompt },
        ...history.slice(-5), // last 5 messages for context
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res
      .status(500)
      .json({ message: "Error during chat", error: error.message });
  }
};
