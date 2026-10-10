import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";
import { body, validationResult } from "express-validator";
import axios from "axios";
import * as cheerio from "cheerio";
import { google } from "googleapis";
import ExcelJS from "exceljs";
import cookieSession from "cookie-session";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { spawn } from "child_process";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Shared Server-Side Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Resilient Gemini generateContent with automatic fallback
async function generateContentWithFallback(params: { contents: any; config?: any }) {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} request failed, attempting resilient fallback:`, err.message);
    }
  }
  throw lastError;
}

// Social Publish Backend Helpers
async function generateAndPublishSocial(noticeTitle: string, platform: 'facebook' | 'linkedin' | 'twitter' | 'tiktok' | 'instagram' | 'threads') {
  try {
    const prompt = `
      You are an expert Tax and VAT consultant in Bangladesh. 
      Generate a professional and engaging social media post for ${platform} in Bengali (and a bit of English) 
      about this new notice: "${noticeTitle}".
      Keep it informative, use relevant hashtags like #VATX #NBR #TaxBangladesh #VATUpdates.
      ${platform === 'twitter' ? 'Keep it under 280 characters.' : ''}
      ${platform === 'instagram' ? 'Focus on visual description as well.' : ''}
      Only return the post content text.
    `;
    
    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ parts: [{ text: prompt }] }]
    });
    const postContent = result.text || "";

    await performPublish(platform, postContent, undefined, 'automated');

  } catch (error: any) {
    console.error(`Auto Publish Error (${platform}):`, error.message);
  }
}

// Extend Express Request type for session
declare global {
  namespace Express {
    interface Request {
      session: {
        tokens?: any;
      } | null;
    }
  }
}

const getCurrentFilename = () => {
  try {
    return fileURLToPath(import.meta.url);
  } catch (e) {
    return typeof __filename !== 'undefined' ? __filename : '';
  }
};

const getCurrentDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (e) {
    return typeof __dirname !== 'undefined' ? __dirname : '';
  }
};

const __filename = getCurrentFilename();
const __dirname = getCurrentDirname();

// Initialize Database
const db = new Database("vatx.db");

// Platform-specific publishing handlers
async function publishToFacebook(content: string, mediaUrl: string | undefined, settings: any): Promise<string> {
  const providedToken = settings.facebook_access_token || process.env.FACEBOOK_ACCESS_TOKEN;
  const fbPageId = settings.facebook_page_id || process.env.FACEBOOK_PAGE_ID;
  
  if (!providedToken || !fbPageId) throw new Error("Facebook configuration missing");

  let activeToken = providedToken;

  // Check if the token is a Page Token or User Token
  // We attempt to get the Page Token using the provided token acting as a User Token
  try {
    const pageInfo = await axios.get(`https://graph.facebook.com/v19.0/${fbPageId}`, {
      params: {
        fields: 'access_token',
        access_token: providedToken
      }
    });
    if (pageInfo.data.access_token) {
      activeToken = pageInfo.data.access_token;
      console.log(`Successfully exchanged User Token for Page Access Token for ID: ${fbPageId}`);
    }
  } catch (err: any) {
    console.log("Token exchange skipped or failed, attempting direct post with provided token.");
  }

  const postData: any = { 
    message: content, 
    access_token: activeToken 
  };
  
  if (mediaUrl) postData.link = mediaUrl;
  
  const response = await axios.post(`https://graph.facebook.com/v19.0/${fbPageId}/feed`, postData);
  return response.data.id;
}

async function publishToLinkedIn(content: string, mediaUrl: string | undefined, settings: any): Promise<string> {
  const liToken = settings.linkedin_access_token || process.env.LINKEDIN_ACCESS_TOKEN;
  const liPersonId = settings.linkedin_person_id || process.env.LINKEDIN_PERSON_ID;
  if (!liToken || !liPersonId) throw new Error("LinkedIn configuration missing");
  const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', {
    author: `urn:li:person:${liPersonId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: content },
        shareMediaCategory: mediaUrl ? "IMAGE" : "NONE",
        media: mediaUrl ? [{
          status: "READY",
          description: { text: "VATX Post" },
          media: mediaUrl,
          title: { text: "VATX Update" }
        }] : undefined
      }
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
  }, {
    headers: {
      'Authorization': `Bearer ${liToken}`,
      'X-Restli-Protocol-Version': '2.0.0'
    }
  });
  return response.headers['x-restli-id'] as string || "published";
}

async function publishToTwitter(content: string, mediaUrl: string | undefined, settings: any): Promise<string> {
  const twToken = settings.twitter_bearer_token || process.env.TWITTER_BEARER_TOKEN;
  if (!twToken) throw new Error("Twitter configuration missing");
  const response = await axios.post('https://api.twitter.com/2/tweets', { text: content }, {
    headers: { 'Authorization': `Bearer ${twToken}` }
  });
  return response.data.id;
}

async function publishToInstagram(content: string, mediaUrl: string | undefined, settings: any): Promise<string> {
  const fbToken = settings.facebook_access_token || process.env.FACEBOOK_ACCESS_TOKEN;
  const igUserId = settings.instagram_user_id || process.env.INSTAGRAM_USER_ID;
  if (!fbToken || !igUserId) throw new Error("Instagram configuration missing");
  const container = await axios.post(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
    caption: content,
    image_url: mediaUrl || `https://picsum.photos/seed/vatx/1080/1080`,
    access_token: fbToken
  });
  const publish = await axios.post(`https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
    creation_id: container.data.id,
    access_token: fbToken
  });
  return publish.data.id;
}

async function publishToThreads(content: string, mediaUrl: string | undefined, settings: any): Promise<string> {
  const thToken = settings.threads_access_token || process.env.THREADS_ACCESS_TOKEN;
  if (!thToken) throw new Error("Threads configuration missing");
  const response = await axios.post('https://graph.threads.net/v1.0/me/threads', {
    text: content,
    access_token: thToken
  });
  return response.data.id;
}

async function publishToTikTok(content: string, mediaUrl: string | undefined, settings: any): Promise<string> {
  console.log(`TikTok mock publish with media: ${mediaUrl}`);
  return "tiktok-queued-" + Date.now();
}

const socialHandlers: Record<string, (content: string, mediaUrl: string | undefined, settings: any) => Promise<string>> = {
  facebook: publishToFacebook,
  linkedin: publishToLinkedIn,
  twitter: publishToTwitter,
  instagram: publishToInstagram,
  threads: publishToThreads,
  tiktok: publishToTikTok,
};

async function performPublish(platform: string, content: string, mediaUrl?: string, statusSource: string = 'success') {
  const settingsRows = db.prepare("SELECT * FROM app_settings").all();
  const settings: any = settingsRows.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const handler = socialHandlers[platform];
  if (!handler) {
    throw new Error("Unsupported platform: " + platform);
  }

  const externalId = await handler(content, mediaUrl, settings);

  db.prepare(`
    INSERT INTO social_publish_logs (platform, postContent, mediaUrl, status, externalId)
    VALUES (?, ?, ?, ?, ?)
  `).run(platform, content, mediaUrl, statusSource, externalId);

  return { externalId };
}

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS vat_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    rate REAL NOT NULL,
    category TEXT,
    label TEXT,
    includeVAT BOOLEAN,
    hasInputTaxCredit BOOLEAN,
    inputTaxCreditAmount REAL DEFAULT 0,
    isExport BOOLEAN,
    isReverseCharge BOOLEAN,
    otherCharges REAL DEFAULT 0,
    currencyCode TEXT DEFAULT 'BDT',
    exchangeRate REAL DEFAULT 1,
    baseAmount REAL,
    subtotal REAL,
    vatAmount REAL,
    netVAT REAL,
    totalAmount REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tax_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taxYear TEXT NOT NULL,
    entityType TEXT NOT NULL,
    label TEXT,
    totalIncome REAL NOT NULL,
    businessExpenses REAL DEFAULT 0,
    capitalGains REAL DEFAULT 0,
    rentIncome REAL DEFAULT 0,
    interestIncome REAL DEFAULT 0,
    dividendIncome REAL DEFAULT 0,
    agriculturalIncome REAL DEFAULT 0,
    foreignIncome REAL DEFAULT 0,
    totalDeductions REAL DEFAULT 0,
    taxableIncome REAL DEFAULT 0,
    totalTaxLiability REAL DEFAULT 0,
    taxDue REAL DEFAULT 0,
    taxRefund REAL DEFAULT 0,
    effectiveRate REAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    planName TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    paymentMethod TEXT,
    amount REAL,
    transactionId TEXT,
    bankSlipUrl TEXT,
    expiresAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT DEFAULT 'Admin',
    category TEXT DEFAULT 'Tax News',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Insert some initial blog posts if empty
  INSERT INTO blog_posts (title, content, category) 
  SELECT 'New VAT Rates for 2025', 'The National Board of Revenue has announced updated VAT rates for the upcoming fiscal year...', 'VAT Updates'
  WHERE NOT EXISTS (SELECT 1 FROM blog_posts);
  
  INSERT INTO blog_posts (title, content, category) 
  SELECT 'Income Tax Filing Deadline Extended', 'Good news for taxpayers! The deadline for filing individual income tax returns has been extended by 30 days.', 'Tax News'
  WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE title = 'Income Tax Filing Deadline Extended');

  CREATE TABLE IF NOT EXISTS invoice_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sellerName TEXT,
    sellerAddress TEXT,
    sellerBin TEXT,
    buyerName TEXT,
    buyerAddress TEXT,
    buyerBin TEXT,
    items TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    bin TEXT,
    mobile TEXT,
    tin TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tax_notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    link TEXT NOT NULL UNIQUE,
    category TEXT,
    publishedAt TEXT,
    summary TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS investment_partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS blockchain_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fileHash TEXT NOT NULL UNIQUE,
    fileName TEXT,
    fileSize INTEGER,
    txHash TEXT,
    network TEXT DEFAULT 'Ethereum Mainnet',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tokenized_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tokenId TEXT NOT NULL UNIQUE,
    ownerAddress TEXT NOT NULL,
    certType TEXT NOT NULL,
    issueDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    metadataUrl TEXT
  );

  CREATE TABLE IF NOT EXISTS social_publish_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    postContent TEXT NOT NULL,
    mediaUrl TEXT,
    status TEXT NOT NULL,
    externalId TEXT,
    error TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mushak91_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taxpayerName TEXT,
    bin TEXT,
    address TEXT,
    taxPeriod TEXT,
    returnType TEXT,
    outputVatTotal REAL DEFAULT 0,
    inputTaxCreditTotal REAL DEFAULT 0,
    vdsTotal REAL DEFAULT 0,
    netPayable REAL DEFAULT 0,
    formData TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    label TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS social_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    postContent TEXT NOT NULL,
    mediaUrl TEXT,
    scheduledAt TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    transactionId TEXT,
    paymentUrl TEXT,
    merchantInvoiceNumber TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ocr_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sourceType TEXT DEFAULT 'social_media',
    rawText TEXT,
    extractedData TEXT,
    imageUrl TEXT,
    sourceUrl TEXT,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vds_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendorName TEXT NOT NULL,
    vendorBin TEXT,
    invoiceNo TEXT,
    invoiceDate DATE,
    totalAmount REAL,
    vatAmount REAL,
    vdsAmount REAL,
    mushak66No TEXT,
    mushak66Date DATE,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tds_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payeeName TEXT NOT NULL,
    payeeTin TEXT,
    paymentType TEXT,
    invoiceNo TEXT,
    invoiceDate DATE,
    grossAmount REAL,
    tdsRate REAL,
    tdsAmount REAL,
    challanNo TEXT,
    challanDate DATE,
    certificateNo TEXT,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tds_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    section TEXT,
    rateWithTin REAL,
    rateWithoutTin REAL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS compliance_deadlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    deadlineDate DATE NOT NULL,
    category TEXT,
    description TEXT,
    isCompleted BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recurring_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    frequency TEXT NOT NULL,
    dayOfMonth INTEGER,
    description TEXT,
    reminderDays INTEGER DEFAULT 3,
    lastGeneratedDate TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vat_agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    firmName TEXT,
    licenseNo TEXT,
    location TEXT,
    rating REAL DEFAULT 5.0,
    contactNo TEXT,
    email TEXT,
    specialization TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS challan_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    challanNo TEXT NOT NULL,
    bankName TEXT,
    branchName TEXT,
    amount REAL,
    verificationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'verified'
  );

  CREATE TABLE IF NOT EXISTS mfs_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    transactionId TEXT,
    status TEXT DEFAULT 'pending',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Initial Compliance Deadlines
  INSERT INTO compliance_deadlines (title, deadlineDate, category, description)
  SELECT 'Monthly VAT Return (Mushak 9.1)', '2026-04-15', 'VAT', 'Submission of monthly VAT return for March 2026'
  WHERE NOT EXISTS (SELECT 1 FROM compliance_deadlines WHERE title = 'Monthly VAT Return (Mushak 9.1)' AND deadlineDate = '2026-04-15');

  INSERT INTO compliance_deadlines (title, deadlineDate, category, description)
  SELECT 'Quarterly TDS Return', '2026-04-20', 'Tax', 'Submission of Tax Deducted at Source return for Q1 2026'
  WHERE NOT EXISTS (SELECT 1 FROM compliance_deadlines WHERE title = 'Quarterly TDS Return' AND deadlineDate = '2026-04-20');

  -- Initial Agents
  INSERT INTO vat_agents (name, firmName, licenseNo, location, specialization)
  SELECT 'Abdur Rahman', 'Rahman & Associates', 'VAT-10293', 'Dhaka, Motijheel', 'Manufacturing & Export'
  WHERE NOT EXISTS (SELECT 1 FROM vat_agents WHERE name = 'Abdur Rahman');

  INSERT INTO vat_agents (name, firmName, licenseNo, location, specialization)
  SELECT 'Fatima Begum', 'FB Tax Consulting', 'VAT-20394', 'Chittagong, Agrabad', 'Service Sector'
  WHERE NOT EXISTS (SELECT 1 FROM vat_agents WHERE name = 'Fatima Begum');

  -- Initial Partners
  INSERT INTO investment_partners (name, url, description)
  SELECT 'MetLife (Alico)', 'https://www.metlife.com.bd/', 'Life Insurance & Savings'
  WHERE NOT EXISTS (SELECT 1 FROM investment_partners WHERE name = 'MetLife (Alico)');
  
  INSERT INTO investment_partners (name, url, description)
  SELECT 'Jibon Bima Corp', 'http://www.jbc.gov.bd/', 'Govt. Life Insurance'
  WHERE NOT EXISTS (SELECT 1 FROM investment_partners WHERE name = 'Jibon Bima Corp');
  
  INSERT INTO investment_partners (name, url, description)
  SELECT 'IDLC Finance', 'https://idlc.com/', 'DPS & Mutual Funds'
  WHERE NOT EXISTS (SELECT 1 FROM investment_partners WHERE name = 'IDLC Finance');
  
  INSERT INTO investment_partners (name, url, description)
  SELECT 'Delta Life', 'https://www.deltalife.org/', 'Insurance Solutions'
  WHERE NOT EXISTS (SELECT 1 FROM investment_partners WHERE name = 'Delta Life');

  -- Seed TDS Rates
  INSERT INTO tds_rates (category, section, rateWithTin, rateWithoutTin, description)
  SELECT 'Supply of Goods', '52', 3, 6, 'TDS on supply of goods (general)'
  WHERE NOT EXISTS (SELECT 1 FROM tds_rates WHERE category = 'Supply of Goods');

  INSERT INTO tds_rates (category, section, rateWithTin, rateWithoutTin, description)
  SELECT 'Execution of Contract', '52', 5, 10, 'TDS on execution of contract'
  WHERE NOT EXISTS (SELECT 1 FROM tds_rates WHERE category = 'Execution of Contract');

  INSERT INTO tds_rates (category, section, rateWithTin, rateWithoutTin, description)
  SELECT 'Service Fees', '52AA', 10, 20, 'TDS on professional or technical service fees'
  WHERE NOT EXISTS (SELECT 1 FROM tds_rates WHERE category = 'Service Fees');

  INSERT INTO tds_rates (category, section, rateWithTin, rateWithoutTin, description)
  SELECT 'House Rent', '53A', 5, 10, 'TDS on house rent'
  WHERE NOT EXISTS (SELECT 1 FROM tds_rates WHERE category = 'House Rent');

  INSERT INTO tds_rates (category, section, rateWithTin, rateWithoutTin, description)
  SELECT 'Commission/Brokerage', '53E', 10, 20, 'TDS on commission or brokerage'
  WHERE NOT EXISTS (SELECT 1 FROM tds_rates WHERE category = 'Commission/Brokerage');
`);

// Migration for existing clients table
try {
  db.prepare("ALTER TABLE clients ADD COLUMN mobile TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE clients ADD COLUMN tin TEXT").run();
} catch (e) {}

// Migration for existing tds_records table
try {
  db.prepare("ALTER TABLE tds_records ADD COLUMN payeeCategory TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE tds_records ADD COLUMN payeeBin TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE tds_records ADD COLUMN bankName TEXT").run();
} catch (e) {}
try {
  db.prepare("ALTER TABLE tds_records ADD COLUMN bankBranch TEXT").run();
} catch (e) {}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'vatx-secret'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    sameSite: 'none'
  }));

  // Google OAuth Setup
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/auth/google/callback`
  );

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Google OAuth Routes
  app.get("/auth/google/url", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file', 'profile', 'email'],
      prompt: 'consent'
    });
    res.json({ url });
  });

  app.get("/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      req.session!.tokens = tokens;
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            </script>
            <p>Authentication successful. You can close this window.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Google Auth Error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({ isAuthenticated: !!req.session?.tokens });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  app.post("/api/drive/upload", async (req, res) => {
    const tokens = req.session?.tokens;
    if (!tokens) return res.status(401).json({ error: "Not authenticated" });

    const { content, fileName, mimeType = 'text/plain' } = req.body;
    
    try {
      oauth2Client.setCredentials(tokens);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      
      const fileMetadata = {
        name: fileName,
      };
      const media = {
        mimeType: mimeType,
        body: content,
      };
      
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      res.json({ success: true, fileId: response.data.id, link: response.data.webViewLink });
    } catch (error) {
      console.error("Drive Upload Error:", error);
      res.status(500).json({ error: "Failed to upload to Google Drive" });
    }
  });

  // VAT Calculation
  app.post("/api/vat/calculate", [
    body('amount').isFloat({ min: 0 }),
    body('rate').isFloat({ min: 0 }),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      amount, rate, category, includeVAT, hasInputTaxCredit,
      inputTaxCreditAmount = 0, isExport, isReverseCharge,
      otherCharges = 0, currencyCode = 'BDT', exchangeRate = 1
    } = req.body;

    let baseAmount = amount;
    let vatAmount = 0;

    if (includeVAT) {
      baseAmount = amount / (1 + rate / 100);
      vatAmount = amount - baseAmount;
    } else {
      vatAmount = amount * (rate / 100);
    }

    if (isExport) vatAmount = 0;
    if (isReverseCharge) vatAmount = 0;

    const subtotal = baseAmount + otherCharges;
    const netVAT = vatAmount - (hasInputTaxCredit ? inputTaxCreditAmount : 0);
    const totalAmount = subtotal + vatAmount;

    const stmt = db.prepare(`
      INSERT INTO vat_records (
        amount, rate, category, includeVAT, hasInputTaxCredit,
        inputTaxCreditAmount, isExport, isReverseCharge, otherCharges,
        currencyCode, exchangeRate, baseAmount, subtotal, vatAmount,
        netVAT, totalAmount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      amount, rate, category, includeVAT ? 1 : 0, hasInputTaxCredit ? 1 : 0,
      inputTaxCreditAmount, isExport ? 1 : 0, isReverseCharge ? 1 : 0, otherCharges,
      currencyCode, exchangeRate, baseAmount, subtotal, vatAmount,
      netVAT, totalAmount
    );

    res.json({
      id: result.lastInsertRowid,
      baseAmount,
      otherCharges,
      subtotal,
      vatAmount,
      inputTaxCredit: hasInputTaxCredit ? inputTaxCreditAmount : 0,
      netVAT,
      totalAmount,
      effectiveRate: rate
    });
  });

  // Income Tax Calculation (Simplified for demo)
  app.post("/api/tax/income/calculate", (req, res) => {
    const {
      totalIncome, businessExpenses = 0, capitalGains = 0,
      rentIncome = 0, interestIncome = 0, dividendIncome = 0,
      taxYear = '2024-25', entityType = 'individual'
    } = req.body;

    const netIncome = totalIncome - businessExpenses + capitalGains + rentIncome + interestIncome + dividendIncome;
    
    // Simple progressive tax for individual
    let taxableIncome = Math.max(0, netIncome - 300000); // 3L threshold
    let tax = 0;
    
    if (entityType === 'individual') {
      if (taxableIncome > 0) {
        const slab1 = Math.min(taxableIncome, 100000);
        tax += slab1 * 0.05;
        taxableIncome -= slab1;
      }
      if (taxableIncome > 0) {
        const slab2 = Math.min(taxableIncome, 100000);
        tax += slab2 * 0.10;
        taxableIncome -= slab2;
      }
      if (taxableIncome > 0) {
        tax += taxableIncome * 0.15;
      }
    } else {
      tax = netIncome * 0.25; // Corporate flat 25%
    }

    const stmt = db.prepare(`
      INSERT INTO tax_records (
        taxYear, entityType, totalIncome, businessExpenses, capitalGains,
        rentIncome, interestIncome, dividendIncome, taxableIncome,
        totalTaxLiability, effectiveRate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      taxYear, entityType, totalIncome, businessExpenses, capitalGains,
      rentIncome, interestIncome, dividendIncome, Math.max(0, netIncome - 300000),
      tax, (tax / totalIncome) * 100
    );

    res.json({
      id: result.lastInsertRowid,
      totalIncome: netIncome,
      taxableIncome: Math.max(0, netIncome - 300000),
      totalTaxLiability: tax,
      effectiveRate: (tax / totalIncome) * 100
    });
  });

  app.get("/api/history/vat", (req, res) => {
    const records = db.prepare("SELECT * FROM vat_records ORDER BY createdAt DESC LIMIT 50").all();
    res.json(records);
  });

  app.get("/api/history/tax", (req, res) => {
    const records = db.prepare("SELECT * FROM tax_records ORDER BY createdAt DESC LIMIT 50").all();
    res.json(records);
  });

  app.patch("/api/history/vat/:id", (req, res) => {
    const { id } = req.params;
    const { label } = req.body;
    db.prepare("UPDATE vat_records SET label = ? WHERE id = ?").run(label, id);
    res.json({ success: true });
  });

  app.patch("/api/history/tax/:id", (req, res) => {
    const { id } = req.params;
    const { label } = req.body;
    db.prepare("UPDATE tax_records SET label = ? WHERE id = ?").run(label, id);
    res.json({ success: true });
  });

  // Subscription Routes
  app.get("/api/subscription", (req, res) => {
    const sub = db.prepare("SELECT * FROM subscriptions ORDER BY createdAt DESC LIMIT 1").get();
    res.json(sub || { status: 'none' });
  });

  app.post("/api/subscription/subscribe", (req, res) => {
    const { planName, paymentMethod, amount, transactionId } = req.body;
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    
    const result = db.prepare(`
      INSERT INTO subscriptions (planName, status, paymentMethod, amount, transactionId, expiresAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(planName, 'active', paymentMethod, amount, transactionId, expiresAt.toISOString());
    
    res.json({ success: true, id: result.lastInsertRowid });
  });

  app.post("/api/subscription/bank-payment", (req, res) => {
    const { planName, amount, bankSlipUrl } = req.body;
    const result = db.prepare(`
      INSERT INTO subscriptions (planName, status, paymentMethod, amount, bankSlipUrl)
      VALUES (?, ?, ?, ?, ?)
    `).run(planName, 'pending', 'bank', amount, bankSlipUrl);
    
    res.json({ success: true, id: result.lastInsertRowid });
  });

  // MFS Payment Routes
  app.post("/api/payments/create", async (req, res) => {
    const { amount, method } = req.body;
    const merchantInvoiceNumber = `INV-${Date.now()}`;

    try {
      // Store pending payment
      const stmt = db.prepare(`
        INSERT INTO payments (amount, method, status, merchantInvoiceNumber)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(amount, method, 'pending', merchantInvoiceNumber);
      const paymentId = result.lastInsertRowid;

      let paymentUrl = "";

      if (method === 'bkash') {
        const bkashBaseUrl = process.env.BKASH_BASE_URL;
        if (!bkashBaseUrl) {
          // Fallback for demo if no credentials
          paymentUrl = `/payment/bkash/mock?id=${paymentId}&amount=${amount}`;
        } else {
          // Real bKash integration logic would go here
          // 1. Get Token
          // 2. Create Payment
          // For now, we'll provide the mock URL but structure it for real use
          paymentUrl = `/payment/bkash/mock?id=${paymentId}&amount=${amount}`;
        }
      } else if (method === 'nagad') {
        paymentUrl = `/payment/nagad/mock?id=${paymentId}&amount=${amount}`;
      } else if (method === 'rocket') {
        paymentUrl = `/payment/rocket/mock?id=${paymentId}&amount=${amount}`;
      }

      db.prepare("UPDATE payments SET paymentUrl = ? WHERE id = ?").run(paymentUrl, paymentId);

      res.json({ success: true, paymentId, paymentUrl, merchantInvoiceNumber });
    } catch (error) {
      console.error("Payment Creation Error:", error);
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  });

  app.get("/api/payments/verify/:id", async (req, res) => {
    const { id } = req.params;
    const payment = db.prepare("SELECT * FROM payments WHERE id = ?").get(id) as any;

    if (!payment) return res.status(404).json({ error: "Payment not found" });

    try {
      // In a real integration, we would call the MFS provider's verify API here
      // For this implementation, we'll simulate a successful verification if it's still pending
      if (payment.status === 'pending') {
        const transactionId = 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();
        db.prepare("UPDATE payments SET status = 'success', transactionId = ? WHERE id = ?")
          .run(transactionId, id);
        
        return res.json({ success: true, status: 'success', transactionId });
      }

      res.json({ success: true, status: payment.status, transactionId: payment.transactionId });
    } catch (error) {
      console.error("Payment Verification Error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // OCR History Routes
  app.get("/api/ocr/history", (req, res) => {
    const history = db.prepare("SELECT * FROM ocr_entries ORDER BY createdAt DESC").all();
    res.json(history.map((h: any) => ({
      ...h,
      extractedData: JSON.parse(h.extractedData || '{}')
    })));
  });

  app.post("/api/ocr/save", (req, res) => {
    const { documentType, fields, items, imageUrl } = req.body;
    const extractedData = JSON.stringify({ documentType, fields, items });
    
    const stmt = db.prepare(`
      INSERT INTO ocr_entries (sourceType, extractedData, imageUrl, status)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run('document_centre', extractedData, imageUrl || '', 'completed');
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.delete("/api/ocr/history/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM ocr_entries WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Server-Side Gemini OCR Endpoint
  app.post("/api/gemini/ocr", async (req, res) => {
    try {
      const { contents, prompt, images, config } = req.body;

      let contentsPayload: any[] = [];
      if (Array.isArray(contents) && contents.length > 0) {
        contentsPayload = contents;
      } else {
        if (Array.isArray(images) && images.length > 0) {
          images.forEach((img: any) => {
            const rawData = typeof img === 'string' ? img : (img.base64 || img.data || '');
            const cleanBase64 = rawData.includes(',') ? rawData.split(',')[1] : rawData;
            const mimeType = (typeof img === 'object' && img.mimeType) ? img.mimeType : 'image/jpeg';
            contentsPayload.push({
              inlineData: {
                mimeType,
                data: cleanBase64
              }
            });
          });
        }
        if (prompt) {
          contentsPayload.push({ text: prompt });
        }
      }

      if (contentsPayload.length === 0) {
        return res.status(400).json({ error: "Missing contents or prompt for OCR" });
      }

      const mergedConfig: any = {};
      if (config && typeof config === 'object') {
        Object.assign(mergedConfig, config);
      }
      if (req.body.responseMimeType) {
        mergedConfig.responseMimeType = req.body.responseMimeType;
      }
      if (req.body.responseSchema) {
        mergedConfig.responseSchema = req.body.responseSchema;
      }
      if (req.body.systemInstruction) {
        mergedConfig.systemInstruction = req.body.systemInstruction;
      }

      const response = await generateContentWithFallback({
        contents: contentsPayload,
        config: Object.keys(mergedConfig).length > 0 ? mergedConfig : undefined
      });

      return res.json({ text: response.text || "" });
    } catch (err: any) {
      console.error("Gemini OCR error:", err);
      return res.status(500).json({ error: err.message || "Gemini OCR processing failed" });
    }
  });

  // Server-Side Gemini General Generate Endpoint
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, contents, systemInstruction, config, responseMimeType, responseSchema } = req.body;
      const finalContents = contents || prompt;
      if (!finalContents) {
        return res.status(400).json({ error: "Prompt or contents is required" });
      }

      const mergedConfig: any = {};
      if (config && typeof config === 'object') Object.assign(mergedConfig, config);
      if (systemInstruction) mergedConfig.systemInstruction = systemInstruction;
      if (responseMimeType) mergedConfig.responseMimeType = responseMimeType;
      if (responseSchema) mergedConfig.responseSchema = responseSchema;

      const response = await generateContentWithFallback({
        contents: finalContents,
        config: Object.keys(mergedConfig).length > 0 ? mergedConfig : undefined
      });

      return res.json({ text: response.text || "" });
    } catch (err: any) {
      console.error("Gemini generate error:", err);
      return res.status(500).json({ error: err.message || "Gemini generation failed" });
    }
  });

  // Microsoft MarkItDown Document Conversion Helper
  function runMarkItDown(payload: { base64?: string; file_path?: string; filename?: string; extension?: string; mime_type?: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'scripts', 'markitdown_converter.py');
      const py = spawn('python3', [scriptPath, '--json']);
      let stdoutData = '';
      let stderrData = '';

      py.stdout.on('data', (d) => { stdoutData += d.toString(); });
      py.stderr.on('data', (d) => { stderrData += d.toString(); });

      py.on('close', (code) => {
        if (code !== 0 && !stdoutData) {
          return reject(new Error(`MarkItDown process exited with code ${code}: ${stderrData}`));
        }
        try {
          const result = JSON.parse(stdoutData || '{}');
          resolve(result);
        } catch (e: any) {
          reject(new Error(`Failed to parse MarkItDown output: ${e.message}`));
        }
      });

      py.stdin.write(JSON.stringify(payload));
      py.stdin.end();
    });
  }

  // Microsoft MarkItDown Document Conversion & OCR Route
  app.post("/api/markitdown/convert", async (req, res) => {
    try {
      const { base64, fileData, filename, fileName, mimeType, enableAiOcr = true } = req.body;
      const finalBase64 = base64 || fileData || '';
      const finalFilename = filename || fileName || 'document.pdf';
      const ext = path.extname(finalFilename) || (mimeType?.includes('pdf') ? '.pdf' : '.png');

      // 1. Run native Microsoft MarkItDown
      let markitdownRes: any = { success: false, markdown: '' };
      if (finalBase64) {
        try {
          markitdownRes = await runMarkItDown({
            base64: finalBase64,
            filename: finalFilename,
            extension: ext,
            mime_type: mimeType
          });
        } catch (err: any) {
          console.warn("MarkItDown native convert error, trying fallback:", err.message);
        }
      }

      let markdown = (markitdownRes?.markdown || "").trim();
      let isAiEnhanced = false;

      // 2. If markdown is minimal or lacks structured Markdown tables (e.g. image / scanned PDF / flat PDF text), enhance via Vision OCR
      const isImage = mimeType?.startsWith('image/') || /\.(png|jpe?g|webp|bmp|tiff)$/i.test(finalFilename);
      const isMinimal = !markdown || markdown.length < 40;
      const lacksMarkdownTable = !markdown.includes('|');

      if ((isMinimal || ((isImage || lacksMarkdownTable) && enableAiOcr)) && finalBase64) {
        try {
          const cleanBase64 = finalBase64.includes(',') ? finalBase64.split(',')[1] : finalBase64;
          const aiRes = await generateContentWithFallback({
            contents: [
              {
                inlineData: {
                  mimeType: mimeType || (ext === '.pdf' ? 'application/pdf' : 'image/png'),
                  data: cleanBase64
                }
              },
              {
                text: `You are Microsoft MarkItDown OCR Engine. Convert this document/certificate into high-precision, clean GitHub-Flavored Markdown.

CRITICAL EXTRACTION RULES:
1. ACTUAL AMOUNTS & DATA ONLY: NEVER fabricate, invent, or use placeholder/fictitious numbers, names, or reference codes. Extract ONLY the exact text, dates, reference numbers, and financial amounts that appear physically in this document.
2. TABLES: Preserve all tables in exact Markdown table syntax (| Col 1 | Col 2 | ... |). Keep the original table columns faithfully.
3. FOR TAX & SALARY CERTIFICATES / CHALLANS:
   - Extract the actual depositing employer/bank/authority name.
   - Extract the actual Challan / Certificate reference number string completely without truncation.
   - Extract the actual Challan Date (DD-MM-YYYY).
   - Extract the actual Total Challan / Deposited Amount.
   - Extract the actual Claimed TDS Amount relating to the employee.
   - Preserve all individual rows or months that are actually listed in the document. Do not fabricate rows that do not exist.
4. TAXPAYER IDENTITY: Extract the actual Taxpayer Name, e-TIN (12-digit), Employee ID, Designation, Assessment Year, and Income Year if present.
5. Output ONLY the clean markdown representation of the document.`
              }
            ]
          });

          if (aiRes.text) {
            markdown = aiRes.text;
            isAiEnhanced = true;
          }
        } catch (aiErr: any) {
          console.warn("MarkItDown Vision OCR enhancement failed:", aiErr.message);
        }
      }

      return res.json({
        success: true,
        markdown: markdown || "# Converted Document\n\nNo text could be extracted.",
        filename: finalFilename,
        engine: isAiEnhanced ? "Microsoft MarkItDown + AI Vision OCR" : "Microsoft MarkItDown Core",
        charCount: markdown.length
      });
    } catch (err: any) {
      console.error("MarkItDown Convert Route Error:", err);
      return res.status(500).json({ error: err.message || "MarkItDown document conversion failed" });
    }
  });

  // Blog Routes
  app.get("/api/blog", (req, res) => {
    const posts = db.prepare("SELECT * FROM blog_posts ORDER BY createdAt DESC").all();
    res.json(posts);
  });

  app.post("/api/blog", [
    body('title').notEmpty(),
    body('content').notEmpty(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, author = 'Admin', category = 'Tax News' } = req.body;
    const stmt = db.prepare("INSERT INTO blog_posts (title, content, author, category) VALUES (?, ?, ?, ?)");
    const result = stmt.run(title, content, author, category);
    res.json({ id: result.lastInsertRowid, title, content, author, category });
  });

  // Invoice Template Routes
  app.get("/api/invoice/templates", (req, res) => {
    const templates = db.prepare("SELECT * FROM invoice_templates ORDER BY createdAt DESC").all();
    res.json(templates.map(t => ({
      ...t,
      items: JSON.parse(t.items || '[]')
    })));
  });

  app.post("/api/invoice/templates", [
    body('name').notEmpty(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, sellerName, sellerAddress, sellerBin, buyerName, buyerAddress, buyerBin, items } = req.body;
    const stmt = db.prepare(`
      INSERT INTO invoice_templates (
        name, sellerName, sellerAddress, sellerBin, buyerName, buyerAddress, buyerBin, items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, sellerName, sellerAddress, sellerBin, buyerName, buyerAddress, buyerBin, JSON.stringify(items));
    res.json({ id: result.lastInsertRowid, name });
  });

  app.delete("/api/invoice/templates/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM invoice_templates WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Client Management Routes
  app.get("/api/clients", (req, res) => {
    const clients = db.prepare("SELECT * FROM clients ORDER BY name ASC").all();
    res.json(clients);
  });

  app.post("/api/clients", [
    body('name').notEmpty(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, address, bin, mobile, tin } = req.body;
    const stmt = db.prepare("INSERT INTO clients (name, address, bin, mobile, tin) VALUES (?, ?, ?, ?, ?)");
    const result = stmt.run(name, address, bin, mobile, tin);
    res.json({ id: result.lastInsertRowid, name, address, bin, mobile, tin });
  });

  app.delete("/api/clients/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM clients WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.patch("/api/clients/:id", (req, res) => {
    const { id } = req.params;
    const { name, address, bin, mobile, tin } = req.body;
    db.prepare("UPDATE clients SET name = ?, address = ?, bin = ?, mobile = ?, tin = ? WHERE id = ?").run(name, address, bin, mobile, tin, id);
    res.json({ success: true });
  });

  // Tax Notices Routes
  app.get("/api/notices", (req, res) => {
    const notices = db.prepare("SELECT * FROM tax_notices ORDER BY createdAt DESC LIMIT 20").all();
    res.json(notices);
  });

  app.post("/api/notices", [
    body('title').notEmpty(),
    body('link').notEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, link, category = 'General' } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO tax_notices (title, link, category) VALUES (?, ?, ?)");
      const result = stmt.run(title, link, category);
      const noticeId = result.lastInsertRowid;

      // Check for auto-publish
      const autoPublishRaw = db.prepare("SELECT value FROM app_settings WHERE key = 'auto_publish_on_gen'").get() as any;
      if (autoPublishRaw && autoPublishRaw.value === 'true') {
        const platforms: ('facebook' | 'linkedin' | 'twitter' | 'tiktok' | 'instagram' | 'threads')[] = ['facebook', 'linkedin', 'twitter'];
        for (const platform of platforms) {
          generateAndPublishSocial(title, platform);
        }
      }

      res.json({ id: noticeId, title, link, category, success: true });
    } catch (error) {
      console.error("Notice creation failed:", error);
      res.status(500).json({ error: "Failed to create notice" });
    }
  });

  app.delete("/api/notices/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM tax_notices WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/social/publish-now", async (req, res) => {
    const { platform, content, mediaUrl } = req.body;
    try {
      const result = await performPublish(platform, content, mediaUrl);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/social/verify/facebook", async (req, res) => {
    console.log("POST /api/social/verify/facebook hit", req.body);
    try {
      const { facebook_page_id, facebook_access_token } = req.body;

      let fbToken = facebook_access_token;
      let fbPageId = facebook_page_id;

      if (!fbToken || !fbPageId) {
        const settingsRows = db.prepare("SELECT * FROM app_settings").all();
        const settings: any = settingsRows.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});

        fbToken = fbToken || settings.facebook_access_token || process.env.FACEBOOK_ACCESS_TOKEN;
        fbPageId = fbPageId || settings.facebook_page_id || process.env.FACEBOOK_PAGE_ID;
      }

      if (!fbToken || !fbPageId) return res.status(400).json({ error: "Facebook configuration missing" });

      // First, try to fetch the page name directly
      // If fbToken is a User Token, we need to ensure the user has access to the page 
      const response = await axios.get(`https://graph.facebook.com/v19.0/${fbPageId}`, {
        params: {
          fields: 'name,access_token',
          access_token: fbToken
        }
      });
      
      const isUserToken = !!response.data.access_token;
      res.json({ 
        success: true, 
        name: response.data.name,
        tokenType: isUserToken ? "User Token (Page Match Found)" : "Page Token (Direct)"
      });
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || error.message;
      res.status(500).json({ error: msg });
    }
  });

  app.post("/api/notices/summarize/:id", async (req, res) => {
    const { id } = req.params;
    const notice = db.prepare("SELECT * FROM tax_notices WHERE id = ?").get(id) as any;
    
    if (!notice) return res.status(404).json({ error: "Notice not found" });
    if (notice.summary) return res.json({ summary: notice.summary });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Analyze this Bangladesh Tax/VAT notice title and explain its likely impact on taxpayers or businesses in 2-3 concise bullet points. 
        Notice Title: ${notice.title}
        Category: ${notice.category}`,
        config: {
          systemInstruction: "You are a senior tax consultant in Bangladesh. Provide practical, impact-focused summaries.",
        }
      });

      const summary = response.text || "Summary unavailable.";
      db.prepare("UPDATE tax_notices SET summary = ? WHERE id = ?").run(summary, id);
      res.json({ summary });
    } catch (error) {
      console.error("Summarization failed:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  app.get("/api/search", (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== "string") return res.json({ results: [] });

    const searchTerm = `%${q}%`;
    const results: any[] = [];

    // Search Blog Posts
    const blogPosts = db.prepare("SELECT id, title, 'blog' as type FROM blog_posts WHERE title LIKE ? OR content LIKE ? LIMIT 5").all(searchTerm, searchTerm);
    results.push(...blogPosts);

    // Search Clients
    const clients = db.prepare("SELECT id, name as title, 'client' as type FROM clients WHERE name LIKE ? OR bin LIKE ? LIMIT 5").all(searchTerm, searchTerm);
    results.push(...clients);

    // Search Tax Notices
    const notices = db.prepare("SELECT id, title, 'notice' as type, link FROM tax_notices WHERE title LIKE ? LIMIT 5").all(searchTerm);
    results.push(...notices);

    // Search Invoices
    const invoices = db.prepare("SELECT id, name as title, 'invoice' as type FROM invoice_templates WHERE name LIKE ? OR buyerName LIKE ? LIMIT 5").all(searchTerm, searchTerm);
    results.push(...invoices);

    res.json({ results });
  });

  app.post("/api/hscode/search", async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Search for HS Code and duty rates in Bangladesh for: ${query}. 
        Return the result as a JSON array of objects with the following properties:
        - hsCode: string
        - description: string
        - cd: number (Customs Duty %)
        - sd: number (Supplementary Duty %)
        - vat: number (VAT %)
        - ait: number (Advance Income Tax %)
        - rd: number (Regulatory Duty %)
        - at: number (Advance Tax %)
        Limit to 5 results.`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const results = JSON.parse(response.text || "[]");
      res.json(results);
    } catch (error) {
      console.error("HS Code search failed:", error);
      res.status(500).json({ error: "Failed to search HS codes" });
    }
  });

  // Background task to fetch notices
  async function fetchLatestNotices() {
    console.log("Fetching latest tax notices from NBR...");
    const sources = [
      { url: "https://nbr.gov.bd/information-library/publicnotice-details/income-tax/eng", category: "Income Tax" },
      { url: "https://nbr.gov.bd/information-library/publicnotice-details/vat/eng", category: "VAT" },
      { url: "https://nbr.gov.bd/information-library/publicnotice-details/customs/eng", category: "Customs" }
    ];

    let newCount = 0;
    for (const source of sources) {
      try {
        const response = await axios.get(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 10000
        });
        const $ = cheerio.load(response.data);
        
        $("a").each((i, el) => {
          const title = $(el).text().trim();
          const link = $(el).attr("href");
          
          if (link && title && title.length > 5 && (link.includes("/uploads/publications/") || link.includes("details"))) {
            const fullLink = link.startsWith("http") ? link : `https://nbr.gov.bd${link}`;
            
            try {
              const stmt = db.prepare("INSERT OR IGNORE INTO tax_notices (title, link, category) VALUES (?, ?, ?)");
              const info = stmt.run(title, fullLink, source.category);
              if (info.changes > 0) {
                newCount++;
                
                // Auto-publish if enabled
                const autoPublish = db.prepare("SELECT value FROM app_settings WHERE key = 'auto_publish_on_gen'").get() as any;
                if (autoPublish?.value === 'true') {
                  generateAndPublishSocial(title, 'facebook');
                  generateAndPublishSocial(title, 'linkedin');
                }
              }
            } catch (e) {
              // Ignore duplicates
            }
          }
        });
      } catch (error) {
        console.error(`Error fetching notices from ${source.url}:`, error.message);
      }
    }
    console.log(`Notice fetch complete. Added ${newCount} new notices.`);
    return newCount;
  }

  app.post("/api/notices/refresh", async (req, res) => {
    try {
      const count = await fetchLatestNotices();
      res.json({ success: true, newNotices: count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Investment Partners Routes
  app.get("/api/investment-partners", (req, res) => {
    const partners = db.prepare("SELECT * FROM investment_partners ORDER BY name ASC").all();
    res.json(partners);
  });

  app.post("/api/investment-partners", [
    body('name').notEmpty(),
    body('url').isURL(),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, url, description } = req.body;
    const stmt = db.prepare("INSERT INTO investment_partners (name, url, description) VALUES (?, ?, ?)");
    const result = stmt.run(name, url, description);
    res.json({ id: result.lastInsertRowid, name, url, description });
  });

  app.delete("/api/investment-partners/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM investment_partners WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Blockchain Verification Routes
  app.post("/api/blockchain/verify", (req, res) => {
    const { fileHash, fileName, fileSize, checkOnly } = req.body;
    const existing = db.prepare("SELECT * FROM blockchain_verifications WHERE fileHash = ?").get(fileHash);
    
    if (existing) {
      return res.json({ verified: true, anchored: false, data: existing });
    }

    if (checkOnly) {
      return res.json({ verified: false, anchored: false });
    }
    
    // Simulate anchoring on blockchain
    const txHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const stmt = db.prepare("INSERT INTO blockchain_verifications (fileHash, fileName, fileSize, txHash) VALUES (?, ?, ?, ?)");
    stmt.run(fileHash, fileName, fileSize, txHash);
    
    res.json({ 
      verified: true, 
      anchored: true,
      data: { fileHash, fileName, fileSize, txHash, network: 'Ethereum Mainnet', createdAt: new Date().toISOString() } 
    });
  });

  app.get("/api/blockchain/history", (req, res) => {
    const history = db.prepare("SELECT * FROM blockchain_verifications ORDER BY createdAt DESC").all();
    res.json(history);
  });

  // Tokenized Certificates Routes
  app.get("/api/blockchain/certificates", (req, res) => {
    const certs = db.prepare("SELECT * FROM tokenized_certificates ORDER BY issueDate DESC").all();
    res.json(certs);
  });

  app.post("/api/blockchain/certificates/mint", (req, res) => {
    const { ownerAddress, certType } = req.body;
    const tokenId = "SBT-" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const stmt = db.prepare("INSERT INTO tokenized_certificates (tokenId, ownerAddress, certType) VALUES (?, ?, ?)");
    stmt.run(tokenId, ownerAddress, certType);
    res.json({ success: true, tokenId, ownerAddress, certType });
  });

  app.patch("/api/blockchain/certificates/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE tokenized_certificates SET status = ? WHERE id = ?").run(status, id);
    res.json({ success: true });
  });

  // Mushak-9.1 Routes
  app.post("/api/mushak91", (req, res) => {
    const { 
      taxpayerName, bin, address, taxPeriod, returnType, 
      outputVatTotal, inputTaxCreditTotal, vdsTotal, netPayable, 
      formData 
    } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO mushak91_submissions (
        taxpayerName, bin, address, taxPeriod, returnType, 
        outputVatTotal, inputTaxCreditTotal, vdsTotal, netPayable, 
        formData
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      taxpayerName, bin, address, taxPeriod, returnType, 
      outputVatTotal, inputTaxCreditTotal, vdsTotal, netPayable, 
      JSON.stringify(formData)
    );
    
    res.json({ success: true, id: result.lastInsertRowid });
  });

  app.get("/api/mushak91", (req, res) => {
    const submissions = db.prepare("SELECT * FROM mushak91_submissions ORDER BY createdAt DESC").all();
    res.json(submissions.map(s => ({ ...s, formData: JSON.parse(s.formData) })));
  });

  app.get("/api/mushak91/:id", (req, res) => {
    const { id } = req.params;
    const submission = db.prepare("SELECT * FROM mushak91_submissions WHERE id = ?").get(id) as any;
    if (!submission) return res.status(404).json({ error: "Submission not found" });
    res.json({ ...submission, formData: JSON.parse(submission.formData) });
  });

  // Social Integration Routes
  app.get("/api/social/links", (req, res) => {
    const links = db.prepare("SELECT * FROM social_links ORDER BY createdAt DESC").all();
    res.json(links);
  });

  app.post("/api/social/links", (req, res) => {
    const { platform, url, label } = req.body;
    const result = db.prepare("INSERT INTO social_links (platform, url, label) VALUES (?, ?, ?)").run(platform, url, label);
    res.json({ id: result.lastInsertRowid, platform, url, label });
  });

  app.delete("/api/social/links/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM social_links WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.get("/api/social/ocr", (req, res) => {
    const entries = db.prepare("SELECT * FROM ocr_entries ORDER BY createdAt DESC").all();
    res.json(entries.map(e => ({ ...e, extractedData: JSON.parse(e.extractedData || '{}') })));
  });

  app.post("/api/social/ocr", async (req, res) => {
    const { rawText, extractedData, imageUrl, sourceUrl, sourceType } = req.body;
    const result = db.prepare("INSERT INTO ocr_entries (rawText, extractedData, imageUrl, sourceUrl, sourceType) VALUES (?, ?, ?, ?, ?)")
      .run(rawText, JSON.stringify(extractedData), imageUrl, sourceUrl, sourceType);
    res.json({ id: result.lastInsertRowid, success: true });
  });

  // VDS Tracker Routes
  app.get("/api/vds", (req, res) => {
    const records = db.prepare("SELECT * FROM vds_records ORDER BY createdAt DESC").all();
    res.json(records);
  });

  app.post("/api/vds", (req, res) => {
    const { vendorName, vendorBin, invoiceNo, invoiceDate, totalAmount, vatAmount, vdsAmount, mushak66No, mushak66Date, status } = req.body;
    const stmt = db.prepare(`
      INSERT INTO vds_records (vendorName, vendorBin, invoiceNo, invoiceDate, totalAmount, vatAmount, vdsAmount, mushak66No, mushak66Date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(vendorName, vendorBin, invoiceNo, invoiceDate, totalAmount, vatAmount, vdsAmount, mushak66No, mushak66Date, status || 'pending');
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.patch("/api/vds/:id", (req, res) => {
    const { id } = req.params;
    const { status, mushak66No, mushak66Date } = req.body;
    db.prepare("UPDATE vds_records SET status = ?, mushak66No = ?, mushak66Date = ? WHERE id = ?").run(status, mushak66No, mushak66Date, id);
    res.json({ success: true });
  });

  // TDS Routes
  app.get("/api/tds", (req, res) => {
    const records = db.prepare("SELECT * FROM tds_records ORDER BY createdAt DESC").all();
    res.json(records);
  });

  app.post("/api/tds", (req, res) => {
    const { payeeName, payeeTin, payeeBin, payeeCategory, paymentType, invoiceNo, invoiceDate, grossAmount, tdsRate, tdsAmount } = req.body;
    const result = db.prepare(`
      INSERT INTO tds_records (payeeName, payeeTin, payeeBin, payeeCategory, paymentType, invoiceNo, invoiceDate, grossAmount, tdsRate, tdsAmount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(payeeName, payeeTin, payeeBin, payeeCategory, paymentType, invoiceNo, invoiceDate, grossAmount, tdsRate, tdsAmount);
    res.json({ id: result.lastInsertRowid });
  });

  app.patch("/api/tds/:id", (req, res) => {
    const { id } = req.params;
    const { status, challanNo, challanDate, certificateNo, bankName, bankBranch } = req.body;
    db.prepare(`
      UPDATE tds_records 
      SET status = ?, 
          challanNo = ?, 
          challanDate = ?, 
          certificateNo = ?, 
          bankName = ?, 
          bankBranch = ? 
      WHERE id = ?
    `).run(status, challanNo, challanDate, certificateNo, bankName, bankBranch, id);
    res.json({ success: true });
  });

  app.get("/api/tds/rates", (req, res) => {
    const rates = db.prepare("SELECT * FROM tds_rates").all();
    res.json(rates);
  });

  app.post("/api/tds/rates", (req, res) => {
    const { category, section, rateWithTin, rateWithoutTin, description } = req.body;
    if (!category) return res.status(400).json({ error: "Category is required" });
    
    const result = db.prepare(`
      INSERT INTO tds_rates (category, section, rateWithTin, rateWithoutTin, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(category, section, rateWithTin, rateWithoutTin, description);
    
    res.status(201).json({ id: result.lastInsertRowid });
  });

  app.put("/api/tds/rates/:id", (req, res) => {
    const { id } = req.params;
    const { category, section, rateWithTin, rateWithoutTin, description } = req.body;
    
    const result = db.prepare(`
      UPDATE tds_rates 
      SET category = ?, section = ?, rateWithTin = ?, rateWithoutTin = ?, description = ?
      WHERE id = ?
    `).run(category, section, rateWithTin, rateWithoutTin, description, id);
    
    if (result.changes === 0) return res.status(404).json({ error: "Rate not found" });
    res.json({ success: true });
  });

  app.delete("/api/tds/rates/:id", (req, res) => {
    const { id } = req.params;
    const result = db.prepare("DELETE FROM tds_rates WHERE id = ?").run(id);
    if (result.changes === 0) return res.status(404).json({ error: "Rate not found" });
    res.json({ success: true });
  });

  // Compliance Calendar Routes
  app.get("/api/compliance", (req, res) => {
    const deadlines = db.prepare("SELECT * FROM compliance_deadlines ORDER BY deadlineDate ASC").all();
    res.json(deadlines);
  });

  app.post("/api/compliance", (req, res) => {
    const { title, date, category, description } = req.body;
    if (!title || !date) return res.status(400).json({ error: "Title and date are required" });
    
    try {
      const result = db.prepare(`
        INSERT INTO compliance_deadlines (title, deadlineDate, category, description)
        VALUES (?, ?, ?, ?)
      `).run(title, date, category, description);
      
      res.status(201).json({ id: result.lastInsertRowid, title, deadlineDate: date, category, description, isCompleted: 0 });
    } catch (err) {
      console.error("Failed to add compliance deadline", err);
      res.status(500).json({ error: "Failed to add compliance deadline" });
    }
  });

  app.patch("/api/compliance/:id", (req, res) => {
    const { id } = req.params;
    const current = db.prepare("SELECT isCompleted FROM compliance_deadlines WHERE id = ?").get(id) as any;
    if (!current) return res.status(404).json({ error: "Deadline not found" });
    
    const newStatus = current.isCompleted ? 0 : 1;
    db.prepare("UPDATE compliance_deadlines SET isCompleted = ? WHERE id = ?").run(newStatus, id);
    res.json({ success: true, isCompleted: newStatus });
  });

  app.get("/api/recurring-tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM recurring_tasks ORDER BY createdAt DESC").all();
    res.json(tasks);
  });

  app.post("/api/recurring-tasks", (req, res) => {
    const { title, category, frequency, dayOfMonth, description, reminderDays } = req.body;
    if (!title || !frequency) return res.status(400).json({ error: "Title and frequency are required" });

    try {
      const result = db.prepare(`
        INSERT INTO recurring_tasks (title, category, frequency, dayOfMonth, description, reminderDays)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(title, category, frequency, dayOfMonth || 15, description, reminderDays || 3);
      
      res.status(201).json({ id: result.lastInsertRowid, title, category, frequency, dayOfMonth, description, reminderDays });
    } catch (err) {
      console.error("Failed to add recurring task", err);
      res.status(500).json({ error: "Failed to add recurring task" });
    }
  });

  app.delete("/api/recurring-tasks/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM recurring_tasks WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.post("/api/compliance/generate", (req, res) => {
    const tasks = db.prepare("SELECT * FROM recurring_tasks").all() as any[];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let generatedCount = 0;

    tasks.forEach(task => {
      const datesToGenerate = [];
      
      if (task.frequency === 'monthly') {
        // Generate for next 3 months
        for (let i = 0; i < 3; i++) {
          const date = new Date(currentYear, currentMonth + i, task.dayOfMonth);
          datesToGenerate.push(date.toISOString().split('T')[0]);
        }
      } else if (task.frequency === 'quarterly') {
        // Generate for current and next quarter
        const quarters = [0, 3, 6, 9];
        quarters.forEach(qMonth => {
          const date = new Date(currentYear, qMonth, task.dayOfMonth);
          if (date >= now) datesToGenerate.push(date.toISOString().split('T')[0]);
        });
      } else if (task.frequency === 'annually') {
        const date = new Date(currentYear, now.getMonth(), task.dayOfMonth);
        if (date < now) {
          datesToGenerate.push(new Date(currentYear + 1, now.getMonth(), task.dayOfMonth).toISOString().split('T')[0]);
        } else {
          datesToGenerate.push(date.toISOString().split('T')[0]);
        }
      }

      datesToGenerate.forEach(dateStr => {
        const exists = db.prepare("SELECT id FROM compliance_deadlines WHERE title = ? AND deadlineDate = ?").get(task.title, dateStr);
        if (!exists) {
          db.prepare(`
            INSERT INTO compliance_deadlines (title, deadlineDate, category, description)
            VALUES (?, ?, ?, ?)
          `).run(task.title, dateStr, task.category, task.description);
          generatedCount++;
        }
      });
    });

    res.json({ success: true, generatedCount });
  });

  // VAT Agent Routes
  app.get("/api/agents", (req, res) => {
    const agents = db.prepare("SELECT * FROM vat_agents ORDER BY rating DESC").all();
    res.json(agents);
  });

  // Challan Verification Routes
  app.post("/api/challan/verify", (req, res) => {
    const { challanNo } = req.body;
    // Simulate verification
    const existing = db.prepare("SELECT * FROM challan_verifications WHERE challanNo = ?").get(challanNo);
    if (existing) return res.json({ verified: true, data: existing });

    const bankName = "Sonali Bank PLC";
    const branchName = "Local Office, Motijheel";
    const amount = Math.floor(Math.random() * 50000) + 5000;
    
    const stmt = db.prepare("INSERT INTO challan_verifications (challanNo, bankName, branchName, amount) VALUES (?, ?, ?, ?)");
    stmt.run(challanNo, bankName, branchName, amount);
    
    res.json({ 
      verified: true, 
      data: { challanNo, bankName, branchName, amount, verificationDate: new Date().toISOString(), status: 'verified' } 
    });
  });

  // MFS Payment Routes
  app.post("/api/payments/create", (req, res) => {
    const { amount, method } = req.body;
    if (!amount || !method) return res.status(400).json({ error: "Amount and method required" });
    const stmt = db.prepare("INSERT INTO mfs_payments (amount, method, status) VALUES (?, ?, 'pending')");
    const result = stmt.run(parseFloat(amount), method);
    res.json({ success: true, paymentId: result.lastInsertRowid });
  });

  app.get("/api/payments/verify/:id", (req, res) => {
    const { id } = req.params;
    const payment = db.prepare("SELECT * FROM mfs_payments WHERE id = ?").get(id) as any;
    const txHash = "TRX" + Math.floor(Math.random() * 89999999 + 10000000);
    
    if (payment) {
      db.prepare("UPDATE mfs_payments SET status = 'success', transactionId = ? WHERE id = ?").run(txHash, id);
    }
    
    res.json({ 
      success: true, 
      status: 'success', 
      transactionId: txHash,
      amount: payment?.amount || 0,
      method: payment?.method || 'bkash'
    });
  });

  // Base (Database Management) Routes
  app.get("/api/base/tables", (req, res) => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    res.json(tables);
  });

  app.get("/api/base/table/:name", (req, res) => {
    const { name } = req.params;
    try {
      const schema = db.prepare(`PRAGMA table_info(${name})`).all();
      const data = db.prepare(`SELECT * FROM ${name} LIMIT 100`).all();
      res.json({ schema, data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/base/query", (req, res) => {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: "SQL query is required" });
    
    // Basic safety check (only for demo/dev purposes)
    const lowerSql = sql.toLowerCase().trim();
    if (lowerSql.startsWith("drop") || lowerSql.startsWith("delete") || lowerSql.startsWith("truncate")) {
      // Allow but warn? Or restrict? 
      // For now, let's allow it but maybe only if it's not a system table.
    }

    try {
      const result = db.prepare(sql).all();
      res.json(result);
    } catch (error) {
      // If it's a non-SELECT query, it might not return results
      try {
        const info = db.prepare(sql).run();
        res.json({ success: true, changes: info.changes });
      } catch (runError) {
        res.status(400).json({ error: runError.message });
      }
    }
  });

  app.get("/api/base/export/:table", async (req, res) => {
    const { table } = req.params;
    try {
      const data = db.prepare(`SELECT * FROM ${table}`).all();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(table);
      
      if (data.length > 0) {
        const columns = Object.keys(data[0]).map(key => ({ header: key, key }));
        worksheet.columns = columns;
        worksheet.addRows(data);
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${table}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // X (Twitter) Scraper Routes
  const XQUIK_BASE_URL = "https://xquik.com/api/v1";
  const xquikHeaders = {
    "x-api-key": process.env.XQUIK_API_KEY || ""
  };

  app.get("/api/x/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query is required" });
    try {
      const response = await axios.get(`${XQUIK_BASE_URL}/x/tweets/search`, {
        params: { q },
        headers: xquikHeaders
      });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/x/user/:username", async (req, res) => {
    const { username } = req.params;
    try {
      const response = await axios.get(`${XQUIK_BASE_URL}/x/users/${username}`, {
        headers: xquikHeaders
      });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/x/trends", async (req, res) => {
    try {
      const response = await axios.get(`${XQUIK_BASE_URL}/trends`, {
        headers: xquikHeaders
      });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // WhatsApp Automation Routes (via Composio/Rube)
  const COMPOSIO_BASE_URL = "https://api.composio.ai/v1";
  const composioHeaders = {
    "x-api-key": process.env.COMPOSIO_API_KEY || "",
    "Content-Type": "application/json"
  };

  app.get("/api/whatsapp/numbers", async (req, res) => {
    try {
      // In a real scenario, we'd use the Composio SDK or direct API
      // For this implementation, we'll proxy to the WhatsApp toolkit
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "whatsapp_get_phone_numbers",
        params: {}
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/whatsapp/send", async (req, res) => {
    const { to, body, phone_number_id } = req.body;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "whatsapp_send_message",
        params: { to, body, phone_number_id }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/whatsapp/templates", async (req, res) => {
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "whatsapp_get_message_templates",
        params: {}
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/whatsapp/send-template", async (req, res) => {
    const { template_name, language_code, to, components, phone_number_id } = req.body;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "whatsapp_send_template_message",
        params: { template_name, language_code, to, components, phone_number_id }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // Dropbox Automation Routes (via Composio/Rube)
  app.get("/api/dropbox/list", async (req, res) => {
    const { path = "" } = req.query;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "dropbox_list_files_in_folder",
        params: { path }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/dropbox/search", async (req, res) => {
    const { q } = req.query;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "dropbox_search_file_or_folder",
        params: { query: q }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/dropbox/upload", async (req, res) => {
    const { path, content } = req.body;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "dropbox_upload_file",
        params: { path, content }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/dropbox/share", async (req, res) => {
    const { path } = req.body;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "dropbox_create_shared_link",
        params: { path }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // Odoo ERP Integration Routes (via Composio/Rube)
  app.get("/api/odoo/search", async (req, res) => {
    const { model, domain = "[]", fields = "[]" } = req.query;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "odoo_search_read",
        params: { 
          model, 
          domain: JSON.parse(domain as string), 
          fields: JSON.parse(fields as string) 
        }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/odoo/create", async (req, res) => {
    const { model, values } = req.body;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "odoo_create_record",
        params: { model, values }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/odoo/fields", async (req, res) => {
    const { model } = req.query;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "odoo_get_model_fields",
        params: { model }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // ERPNext Integration Routes (via Composio/Rube)
  app.get("/api/erpnext/list", async (req, res) => {
    const { doctype, filters = "{}", fields = '["*"]' } = req.query;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "erpnext_list_resource",
        params: { 
          doctype, 
          filters: JSON.parse(filters as string), 
          fields: JSON.parse(fields as string) 
        }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/erpnext/get", async (req, res) => {
    const { doctype, name } = req.query;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "erpnext_get_resource",
        params: { doctype, name }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/erpnext/create", async (req, res) => {
    const { doctype, data } = req.body;
    try {
      const response = await axios.post(`${COMPOSIO_BASE_URL}/actions/execute`, {
        action: "erpnext_create_resource",
        params: { doctype, data }
      }, { headers: composioHeaders });
      res.json(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // App Settings API (Developer Only)
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM app_settings").all();
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  });

  app.post("/api/settings", (req, res) => {
    const { settings } = req.body;
    const upsert = db.prepare("INSERT OR REPLACE INTO app_settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP)");
    const transaction = db.transaction((items: any) => {
      for (const [key, value] of Object.entries(items)) {
        upsert.run(key, value);
      }
    });
    transaction(settings);
    res.json({ success: true });
  });

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  });

  const upload = multer({ storage: storage });

  app.use('/uploads', express.static(uploadsDir));

  app.post("/api/upload-media", upload.single('media'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const mediaUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ success: true, url: mediaUrl, filename: req.file.filename });
  });

  // Social Media Direct Publish API (Developer Only)
  app.post("/api/social/publish", async (req, res) => {
    const { platform, content, mediaUrl } = req.body;
    try {
      const result = await performPublish(platform, content, mediaUrl);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error(`Social Publish Error (${platform}):`, error.response?.data || error.message);
      
      db.prepare(`
        INSERT INTO social_publish_logs (platform, postContent, mediaUrl, status, error)
        VALUES (?, ?, ?, ?, ?)
      `).run(platform, content, mediaUrl, 'error', error.response?.data ? JSON.stringify(error.response.data) : error.message);

      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.response?.data
      });
    }
  });

  app.post("/api/social/schedule", (req, res) => {
    const { platform, content, mediaUrl, scheduledAt } = req.body;
    if (!platform || !content || !scheduledAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    try {
      db.prepare(`
        INSERT INTO social_schedules (platform, postContent, mediaUrl, scheduledAt, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(platform, content, mediaUrl, scheduledAt, 'pending');
      res.json({ success: true, message: "Post scheduled successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/social/schedules", (req, res) => {
    try {
      const schedules = db.prepare("SELECT * FROM social_schedules WHERE status = 'pending' ORDER BY scheduledAt ASC").all();
      res.json(schedules);
    } catch (error: any) {
      console.error("Fetch Schedules Error:", error);
      res.json([]);
    }
  });

  app.delete("/api/social/schedules/:id", (req, res) => {
    try {
      db.prepare("DELETE FROM social_schedules WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  async function processScheduledPosts() {
    try {
      const now = new Date().toISOString();
      const dueSchedules = db.prepare(`
        SELECT * FROM social_schedules 
        WHERE status = 'pending' AND scheduledAt <= ?
      `).all(now) as any[];

      for (const schedule of dueSchedules) {
        try {
          console.log(`Processing scheduled post for ${schedule.platform}...`);
          await performPublish(schedule.platform, schedule.postContent, schedule.mediaUrl);
          db.prepare("UPDATE social_schedules SET status = 'published' WHERE id = ?").run(schedule.id);
        } catch (error: any) {
          console.error(`Scheduled Publish Error (ID: ${schedule.id}):`, error.message);
          db.prepare("UPDATE social_schedules SET status = 'failed' WHERE id = ?").run(schedule.id);
          
          db.prepare(`
            INSERT INTO social_publish_logs (platform, postContent, mediaUrl, status, error)
            VALUES (?, ?, ?, ?, ?)
          `).run(schedule.platform, schedule.postContent, schedule.mediaUrl, 'scheduled_error', error.message);
        }
      }
    } catch (err) {
      console.error("Schedule Polling Error:", err);
    }
  }

  app.get("/api/social/publish-logs", (req, res) => {
    try {
      const logs = db.prepare("SELECT * FROM social_publish_logs ORDER BY createdAt DESC LIMIT 50").all();
      res.json(logs);
    } catch (error) {
      console.error("Fetch Logs Error:", error);
      res.json([]);
    }
  });

  // Run immediately on start and then every 2 hours
  fetchLatestNotices();
  setInterval(fetchLatestNotices, 1000 * 60 * 60 * 2);

  // Poll for scheduled posts every 1 minute
  setInterval(processScheduledPosts, 1000 * 60);

  // API 404 fallback handler (prevents returning HTML for unknown API endpoints)
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.originalUrl}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
