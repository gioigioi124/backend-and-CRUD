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
    await index.deleteMany({ source: { $eq: filename } });

    // 2. Clear meta info from MongoDB if exists
    await KnowledgeBaseFile.findOneAndDelete({ filename: filename });

    // Prepare documents
    const documents = data.map((row, i) => {
      // Create a structured string: "Source: filename, Column1: Value1, Column2: Value2..."
      // Adding filename to content helps for queries like "giá bông" when "bông" is in the filename
      const content =
        `Nguồn dữ liệu: ${filename}, ` +
        Object.entries(row)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");

      return {
        id: `row-${Date.now()}-${i}`,
        content,
        metadata: { ...row, text: content, source: filename },
      };
    });

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
          taskType: "RETRIEVAL_DOCUMENT",
          outputDimensionality: 768,
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
    let embeddingResult;
    try {
      const embeddingModel = genAI.getGenerativeModel({
        model: "models/gemini-embedding-001",
      });

      embeddingResult = await embeddingModel.embedContent({
        content: { parts: [{ text: message }] },
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: 768,
      });
    } catch (embError) {
      console.error("Embedding API Error:", embError);
      if (embError.status === 429 || embError.message?.includes("quota")) {
        return res.status(429).json({
          message:
            "Giới hạn tạo embedding (Gemini) đã đạt. Vui lòng thử lại sau.",
          error: embError.message,
          source: "embedding",
        });
      }
      throw new Error(`Embedding failed: ${embError.message}`);
    }
    const queryEmbedding = embeddingResult.embedding.values;

    // 2. Query Pinecone
    let queryResponse;
    try {
      queryResponse = await index.query({
        vector: queryEmbedding,
        topK: 20,
        includeMetadata: true,
      });
    } catch (pcError) {
      console.error("Pinecone Query Error:", pcError);
      if (pcError.status === 429 || pcError.message?.includes("Rate limit")) {
        return res.status(429).json({
          message:
            "Giới hạn truy vấn database (Pinecone) đã đạt. Vui lòng thử lại sau.",
          error: pcError.message,
          source: "pinecone",
        });
      }
      throw new Error(`Pinecone query failed: ${pcError.message}`);
    }

    // Lọc những kết quả có score quá thấp (giảm nhiễu khi dữ liệu lớn)
    const threshold = 0.25; // Hạ thêm một chút để lấy được các dòng giá trị khác nhau
    const filteredMatches = queryResponse.matches.filter(
      (match) => match.score >= threshold,
    );

    const context = filteredMatches
      .map(
        (match) =>
          `[Nguồn: ${match.metadata.source || "Unknown"}, Độ liên quan: ${Math.round(match.score * 100)}%]: ${match.metadata.text}`,
      )
      .join("\n---\n");

    const systemPrompt = `Bạn là một trợ lý AI hỗ trợ quản lý thông tin của doanh nghiệp. 
Kiến thức của bạn được lấy từ các tệp dữ liệu đã tải lên, bao gồm thông tin khách hàng, công nợ, bảng giá vận chuyển (ví dụ: giá bông), và các tài liệu khác.

Dưới đây là dữ liệu liên quan tìm được từ bộ nhớ kiến thức (context):
${context || "KHÔNG CÓ DỮ LIỆU PHÙ HỢP TRONG NGỮ CẢNH."}

HƯỚNG DẪN TRẢ LỜI:
1. Trả lời dựa TRỰC TIẾP và CHỈ DỰA VÀO ngữ cảnh được cung cấp ở trên.
2. Nếu người dùng hỏi về "cao nhất", "thấp nhất" hoặc yêu cầu so sánh, hãy quét qua tất cả các dòng trong ngữ cảnh và tìm giá trị tương ứng để trả lời.
3. Nếu ngữ cảnh chứa thông tin về giá vận chuyển, hãy cung cấp chính xác con số và địa điểm.
4. Nếu người dùng hỏi về thông tin không có trong ngữ cảnh, hãy thông báo rõ là không tìm thấy.
5. Khi có nhiều thông tin tương tự (ví dụ: cước đi nhiều nơi ở tỉnh đó), hãy liệt kê đầy đủ.
6. Luôn ưu tiên độ chính xác tuyệt đối từ dữ liệu nguồn.

ĐỊNH DẠNG TRẢ LỜI (BẮT BUỘC):
7. **LUÔN LUÔN sử dụng BẢNG MARKDOWN** khi liệt kê dữ liệu (từ 2 items trở lên).
   KHÔNG BAO GIỜ dùng bullet points (*), numbered list, hoặc line breaks để liệt kê.
   
8. Format bảng markdown CHÍNH XÁC như sau:
   | Tên cột 1 | Tên cột 2 | Tên cột 3 |
   |-----------|-----------|-----------|
   | Giá trị 1 | Giá trị 2 | Giá trị 3 |
   | Giá trị 1 | Giá trị 2 | Giá trị 3 |
   
   LƯU Ý: 
   - Dòng đầu tiên là header (tên cột)
   - Dòng thứ hai PHẢI có dấu gạch ngang |---|---|
   - Mỗi dòng dữ liệu sau đó là một row

9. Ví dụ CỤ THỂ cho câu hỏi "giá bông":
   
   Dưới đây là các thông tin về giá bông được tìm thấy:
   
   | Loại giá bông | Điều kiện | Giá (VNĐ) |
   |---------------|-----------|-----------|
   | Giá bông theo điều kiện đặt tiền | - | 31000 |
   | Giá bông không đặt tiền | - | 31000 |
   | Giá bông đặt tiền tối thiểu 30 triệu/lần | - | 26700 |
   | Giá bông ghé đặt tiền | - | 27700 |
   | Giá bông đã tính vận chuyển | - | 27200 |
   | Giá bông thạch thất | Đã tính vận chuyển | 27200 |

10. TUYỆT ĐỐI KHÔNG trả lời dạng này:
    ❌ "Giá bông theo điều kiện đặt tiền: 31000"
    ❌ "- Giá bông không đặt tiền là 31000"
    ❌ "Giá bông đặt tiền tối thiểu 30 triệu/lần là 26700"
    
    ✅ Chỉ trả lời dạng BẢNG MARKDOWN như ví dụ trên.
`;

    // 3. Generate response with Gemini
    // Using gemini-3-flash-preview - the latest flash model with better reasoning and calculation accuracy
    const model = genAI.getGenerativeModel({
      model: "models/gemini-3-flash-preview",
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

    let result;
    try {
      const chatInstance = model.startChat({
        history: geminiHistory,
      });

      result = await chatInstance.sendMessage(message);
    } catch (genError) {
      console.error("Gemini Generation Error:", genError);
      if (genError.status === 429 || genError.message?.includes("quota")) {
        return res.status(429).json({
          message: "Giới hạn chat (Gemini) đã đạt. Vui lòng thử lại sau.",
          error: genError.message,
          source: "generation",
        });
      }
      throw new Error(`Generation failed: ${genError.message}`);
    }

    const reply = result.response.text();
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error details:", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      details: error.details,
      stack: error.stack,
    });

    // Check if it's a rate limit error
    if (
      error.message?.includes("quota") ||
      error.message?.includes("rate limit")
    ) {
      return res.status(429).json({
        message: "Đã vượt quá giới hạn request. Vui lòng thử lại sau vài giây.",
        error: error.message,
        isRateLimit: true,
      });
    }

    res.status(500).json({
      message: "Lỗi khi xử lý chat",
      error: error.message,
    });
  }
};

export const deleteKnowledgeBase = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ message: "Filename is required" });
    }

    const index = pc.index(indexName);

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
