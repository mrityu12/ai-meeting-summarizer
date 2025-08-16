// controllers/summaryController.js

const fs = require("fs").promises;
const Groq = require("groq-sdk");
const { sendEmail, formatSummaryEmail } = require("../config/email");

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Generate AI summary using Groq
const generateSummary = async (req, res) => {
  try {
    let transcript = "";
    const customPrompt = req.body.customPrompt || "";

    // Check if transcript is provided via file or text
    if (req.file) {
      const filePath = req.file.path;

      try {
        transcript = await fs.readFile(filePath, "utf8");
      } catch (readError) {
        return res.status(400).json({
          error: "Failed to read uploaded file.",
          details: readError.message,
        });
      }

      // Delete uploaded file after reading
      try {
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.warn("Could not delete uploaded file:", unlinkError.message);
      }
    } else if (req.body.transcript) {
      transcript = req.body.transcript;
    } else {
      return res.status(400).json({
        error: "No transcript provided. Please upload a file or paste text.",
      });
    }

    // Validate transcript
    if (!transcript.trim()) {
      return res.status(400).json({
        error: "Transcript is empty or invalid.",
      });
    }

    // AI prompts
    const systemPrompt = `You are an AI assistant specialized in summarizing meeting transcripts and notes. 
Your task is to create clear, structured, and actionable summaries.`;

    let userPrompt = `Please summarize the following meeting transcript:\n\n${transcript}`;

    if (customPrompt.trim()) {
      userPrompt += `\n\nSpecific instructions: ${customPrompt}`;
    } else {
      userPrompt += `\n\nPlease provide:
1. A brief overview of the meeting
2. Key discussion points
3. Decisions made
4. Action items (if any)
5. Next steps or follow-ups`;
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "mixtral-8x7b-32768", // ✅ valid Groq model
      temperature: 0.3,
      max_tokens: 1024,
    });

    const summary = completion.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary generated from AI service");
    }

    return res.json({
      success: true,
      summary: summary.trim(),
      originalLength: transcript.length,
      summaryLength: summary.trim().length,
      customPrompt,
    });
  } catch (error) {
    console.error("Summary generation error:", error);

    let errorMessage = "Failed to generate summary";
    if (error.message.includes("API key")) {
      errorMessage = "AI service configuration error. Please check your API key.";
    } else if (
      error.message.includes("quota") ||
      error.message.includes("limit")
    ) {
      errorMessage = "AI service quota exceeded. Please try again later.";
    } else if (
      error.message.includes("network") ||
      error.message.includes("timeout")
    ) {
      errorMessage = "Network error. Please try again.";
    }

    return res.status(500).json({
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Share summary via email
const shareSummary = async (req, res) => {
  try {
    const { recipients, subject, summary, originalText, customPrompt } = req.body;

    // Validate recipients
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        error: "Please provide at least one recipient email address.",
      });
    }

    // Validate summary
    if (!summary || !summary.trim()) {
      return res.status(400).json({
        error: "Summary content is required.",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter(
      (email) => !emailRegex.test(email.trim())
    );

    if (invalidEmails.length > 0) {
      return res.status(400).json({
        error: `Invalid email addresses: ${invalidEmails.join(", ")}`,
      });
    }

    // Prepare email
    const emailSubject = subject || "Meeting Summary - AI Generated";
    const emailContent = formatSummaryEmail(
      originalText || "Original transcript not available",
      summary,
      customPrompt
    );

    // Send email
    const emailResult = await sendEmail(recipients, emailSubject, emailContent);

    if (emailResult.success) {
      return res.json({
        success: true,
        message: `Summary sent successfully to ${recipients.length} recipient(s)`,
        messageId: emailResult.messageId,
        recipients,
      });
    } else {
      return res.status(500).json({
        error: "Failed to send email",
        details: emailResult.error,
      });
    }
  } catch (error) {
    console.error("Email sharing error:", error);
    return res.status(500).json({
      error: "Failed to share summary via email",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Health check
const healthCheck = (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "AI Meeting Summarizer",
    version: "1.0.0",
  });
};

module.exports = {
  generateSummary,
  shareSummary,
  healthCheck,
};
